package so.keyring.card;

import javacard.framework.*;
import javacard.security.*;
import so.keyring.card.jcmathlib.*;
import so.keyring.card.swalgs.*;

public class Ed25519 {
    public final static boolean DEBUG = true;
    public final static short CARD = OperationSupport.JCOP4_P71; // TODO set your card
    // public final static short CARD = OperationSupport.JCOP4_P71; // NXP J3Rxxx
    // public final static short CARD = OperationSupport.JCOP3_P60; // NXP J3H145
    // public final static short CARD = OperationSupport.JCOP21;    // NXP J2E145
    // public final static short CARD = OperationSupport.SECORA;    // Infineon Secora ID S


    private ResourceManager rm;
    public ECCurve curve;
    private BigNat privateKey, privateNonce, signature;
    private BigNat transformC, transformA3, transformX, transformY, eight;
    private ECPoint point;

    private final byte[] prefix = new byte[32];
    private final byte[] publicKey = new byte[32];
    private final byte[] publicNonce = new byte[32];

    private MessageDigest hasher;

    private final byte[] ramArray = JCSystem.makeTransientByteArray((short) Wei25519.G.length, JCSystem.CLEAR_ON_DESELECT);
    private final RandomData random = RandomData.getInstance(RandomData.ALG_SECURE_RANDOM);

    public Ed25519() {
        OperationSupport.getInstance().setCard(CARD);

        try {
            hasher = MessageDigest.getInstance(MessageDigest.ALG_SHA_512, false);
        } catch (CryptoException e) {
            hasher = new Sha2(Sha2.SHA_512);
        }

        rm = new ResourceManager((short) 256);

        privateKey = new BigNat((short) 32, JCSystem.MEMORY_TYPE_PERSISTENT, rm);

        privateNonce = new BigNat((short) 64, JCSystem.MEMORY_TYPE_TRANSIENT_DESELECT, rm);
        signature = new BigNat((short) 64, JCSystem.MEMORY_TYPE_TRANSIENT_DESELECT, rm);

        transformC = new BigNat((short) Consts.TRANSFORM_C.length, JCSystem.MEMORY_TYPE_PERSISTENT, rm);
        transformC.fromByteArray(Consts.TRANSFORM_C, (short) 0, (short) Consts.TRANSFORM_C.length);
        transformA3 = new BigNat((short) Consts.TRANSFORM_A3.length, JCSystem.MEMORY_TYPE_PERSISTENT, rm);
        transformA3.fromByteArray(Consts.TRANSFORM_A3, (short) 0, (short) Consts.TRANSFORM_A3.length);
        transformX = new BigNat((short) 32, JCSystem.MEMORY_TYPE_TRANSIENT_RESET, rm);
        transformY = new BigNat((short) 32, JCSystem.MEMORY_TYPE_TRANSIENT_RESET, rm);

        eight = new BigNat((short) 1,  JCSystem.MEMORY_TYPE_PERSISTENT, rm);
        eight.setValue((byte) 8);

        curve = new ECCurve(Wei25519.p, Wei25519.a, Wei25519.b, Wei25519.G, Wei25519.r, Wei25519.k, rm);
        point = new ECPoint(curve);
    }

    public boolean select() {
        curve.updateAfterReset();
        return true;
    }

    public void setKeypair(byte[] masterKeyParam) {
        hasher.reset();
        hasher.doFinal(masterKeyParam, (short) 0, (short) 32, ramArray, (short) 0);
        ramArray[0] &= (byte) 0xf8; // Clear lowest three bits
        ramArray[31] &= (byte) 0x7f; // Clear highest bit
        ramArray[31] |= (byte) 0x40; // Set second-highest bit
        changeEndianity(ramArray, (short) 0, (short) 32);

        Util.arrayCopyNonAtomic(ramArray, (short) 32, prefix, (short) 0, (short) 32);

        privateKey.fromByteArray(ramArray, (short) 0, (short) 32);
        privateKey.shiftRight((short) 3); // Required by smartcards (scalar must be lesser than r)
        point.setW(curve.G, (short) 0, curve.POINT_SIZE);
        point.multiplication(privateKey);
        privateKey.fromByteArray(ramArray, (short) 0, (short) 32); // Reload private key
        privateKey.mod(curve.rBN);

        point.multiplication(eight); // Compensate bit shift

        encodeEd25519(point, publicKey, (short) 0);
    }

    public void copyPubkey(byte[] apduBuffer, short offset) {
        Util.arrayCopyNonAtomic(publicKey, (short) 0, apduBuffer, (short) offset, (short) 32);
    }

    // private void setPublicKey(APDU apdu) {
    //     byte[] apduBuffer = apdu.getBuffer();
    //     Util.arrayCopyNonAtomic(apduBuffer, ISO7816.OFFSET_CDATA, publicKey, (short) 0, (short) publicKey.length);
    //     apdu.setOutgoing();
    // }

    public void signInit() {
        // Generate nonce R
        randomNonce();
        point.setW(curve.G, (short) 0, curve.POINT_SIZE);
        point.multiplication(privateNonce);
        hasher.reset();
        
        encodeEd25519(point, ramArray, (short) 0);
        Util.arrayCopyNonAtomic(ramArray, (short) 0, publicNonce, (short) 0, curve.COORD_SIZE);
        hasher.update(ramArray, (short) 0, curve.COORD_SIZE); // R
        hasher.update(publicKey, (short) 0, curve.COORD_SIZE); // A
    }

    // private void signNonce(APDU apdu) {
    //     byte[] apduBuffer = apdu.getBuffer();
    //     hasher.reset();
    //     Util.arrayCopyNonAtomic(apduBuffer, ISO7816.OFFSET_CDATA, publicNonce, (short) 0, curve.COORD_SIZE);
    //     hasher.update(apduBuffer, ISO7816.OFFSET_CDATA, curve.COORD_SIZE); // R
    //     hasher.update(publicKey, (short) 0, curve.COORD_SIZE); // A
    //     apdu.setOutgoing();
    // }

    public void signFinalize(byte[] apduBuffer, short len, short off) {
        hasher.doFinal(apduBuffer, ISO7816.OFFSET_CDATA, len, apduBuffer, (short) off); // m
        changeEndianity(apduBuffer, (short) off, (short) 64);
        signature.fromByteArray(apduBuffer, (short) off, (short) 64);
        signature.mod(curve.rBN);
        signature.resize((short) 32);

        // Compute signature s = r + ex
        signature.modMult(privateKey, curve.rBN);
        signature.modAdd(privateNonce, curve.rBN);

        // Return signature (R, s)
        Util.arrayCopyNonAtomic(publicNonce, (short) 0, apduBuffer, (short) off, curve.COORD_SIZE);
        signature.prependZeros(curve.COORD_SIZE, apduBuffer, (short) (curve.COORD_SIZE + off));
        changeEndianity(apduBuffer, (short) (curve.COORD_SIZE + off), curve.COORD_SIZE);
    }

    // private void signUpdate(APDU apdu) {
    //     byte[] apduBuffer = apdu.getBuffer();
    //     short len = (short) ((short) apduBuffer[ISO7816.OFFSET_P1] & (short) 0xff);
    //     hasher.update(apduBuffer, ISO7816.OFFSET_CDATA, len);
    //     apdu.setOutgoing();
    // }

    private void encodeEd25519(ECPoint point, byte[] buffer, short offset) {
        point.getW(ramArray, (short) 0);

        // Compute X
        transformX.fromByteArray(ramArray, (short) 1, (short) 32);
        transformY.fromByteArray(ramArray, (short) 33, (short) 32);
        transformX.modSub(transformA3, curve.pBN);
        transformX.modMult(transformC, curve.pBN);
        transformY.modInv(curve.pBN);
        transformX.modMult(transformY, curve.pBN);

        boolean xBit = transformX.isOdd();

        // Compute Y
        transformX.fromByteArray(ramArray, (short) 1, (short) 32);
        transformX.modSub(transformA3, curve.pBN);
        transformY.clone(transformX);
        transformX.decrement();
        transformY.increment();
        transformY.mod(curve.pBN);
        transformY.modInv(curve.pBN);
        transformX.modMult(transformY, curve.pBN);
        transformX.prependZeros(curve.COORD_SIZE, buffer, offset);

        buffer[offset] |= xBit ? (byte) 0x80 : (byte) 0x00;

        changeEndianity(buffer, offset, (short) 32);
    }

    private void changeEndianity(byte[] array, short offset, short len) {
        for (short i = 0; i < (short) (len / 2); ++i) {
            byte tmp = array[(short) (offset + len - i - 1)];
            array[(short) (offset + len - i - 1)] = array[(short) (offset + i)];
            array[(short) (offset + i)] = tmp;
        }
    }

    // CAN BE USED ONLY IF NO OFFLOADING IS USED; OTHERWISE INSECURE!
    // private void deterministicNonce(byte[] msg, short offset, short len) {
    //     hasher.reset();
    //     hasher.update(prefix, (short) 0, (short) 32);
    //     hasher.doFinal(msg, offset, len, ramArray, (short) 0);
    //     changeEndianity(ramArray, (short) 0, (short) 64);
    //     privateNonce.fromByteArray(ramArray, (short) 0, (short) 64);
    //     privateNonce.mod(curve.rBN);
    //     privateNonce.resize((short) 32);
    // }

    public void randomNonce() {
        random.generateData(ramArray, (short) 0, (short) 32);
        privateNonce.fromByteArray(ramArray, (short) 0, (short) 32);
        privateNonce.mod(curve.rBN);
        privateNonce.resize((short) 32);
    }
}
