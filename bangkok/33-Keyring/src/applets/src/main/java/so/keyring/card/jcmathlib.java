package so.keyring.card;

import javacard.framework.ISOException;
import javacard.framework.JCSystem;
import javacard.framework.Util;
import javacard.security.*;
import javacardx.crypto.Cipher;

/**
 * Packaged JCMathLib v2.1-rc.1 (https://github.com/OpenCryptoProject/JCMathLib).
 */
public class jcmathlib {
    /**
     * @author Vasilios Mavroudis and Petr Svenda and Antonin Dufka
     */
    public static class BigNat extends BigNatInternal {

        /**
         * Construct a BigNat of a given size in bytes.
         */
        public BigNat(short size, byte allocatorType, ResourceManager rm) {
            super(size, allocatorType, rm);
        }

        /**
         * Division of this BigNat by provided other BigNat.
         */
        public void divide(BigNat other) {
            BigNat tmp = rm.BN_E;

            tmp.clone(this);
            tmp.remainderDivide(other, this);
            copy(tmp);
        }

        /**
         * Greatest common divisor of this BigNat with other BigNat. Result is stored into this.
         */
        public void gcd(BigNat other) {
            BigNat tmp = rm.BN_A;
            BigNat tmpOther = rm.BN_B;


            tmpOther.clone(other);

            // TODO: optimise?
            while (!other.equals((byte) 0)) {
                tmp.clone(tmpOther);
                mod(tmpOther);
                tmpOther.clone(this);
                clone(tmp);
            }

        }

        /**
         * Decides whether the arguments are co-prime or not.
         */
        public boolean isCoprime(BigNat a, BigNat b) {
            BigNat tmp = rm.BN_C;

            tmp.clone(a);

            tmp.gcd(b);
            boolean result = tmp.equals((byte) 1);
            return result;
        }

        /**
         * Square computation supporting base greater than MAX_BIGNAT_LENGTH.
         */
        public void sq() {
            if (!OperationSupport.getInstance().RSA_SQ) {
                BigNat tmp = rm.BN_E;
                tmp.setSize(length());
                tmp.copy(this);
                super.mult(tmp);
                return;
            }
            if ((short) (rm.MAX_SQ_LENGTH - 1) < (short) (2 * length())) {
                ISOException.throwIt(ReturnCodes.SW_BIGNAT_INVALIDSQ);
            }

            byte[] resultBuffer = rm.ARRAY_A;
            short offset = (short) (rm.MAX_SQ_LENGTH - length());

            Util.arrayFillNonAtomic(resultBuffer, (short) 0, offset, (byte) 0x00);
            copyToByteArray(resultBuffer, offset);
            short len = rm.sqCiph.doFinal(resultBuffer, (short) 0, rm.MAX_SQ_LENGTH, resultBuffer, (short) 0);
            if (len != rm.MAX_SQ_LENGTH) {
                if (OperationSupport.getInstance().RSA_PREPEND_ZEROS) {
                    Util.arrayCopyNonAtomic(resultBuffer, (short) 0, resultBuffer, (short) (rm.MAX_SQ_LENGTH - len), len);
                    Util.arrayFillNonAtomic(resultBuffer, (short) 0, (short) (rm.MAX_SQ_LENGTH - len), (byte) 0);
                } else {
                    ISOException.throwIt(ReturnCodes.SW_ECPOINT_UNEXPECTED_KA_LEN);
                }
            }
            short zeroPrefix = (short) (rm.MAX_SQ_LENGTH - (short) 2 * length());
            fromByteArray(resultBuffer, zeroPrefix, (short) (rm.MAX_SQ_LENGTH - zeroPrefix));
            shrink();
        }

        /**
         * Computes this * other and stores the result into this.
         */
        public void mult(BigNat other) {
            if (OperationSupport.getInstance().RSA_CHECK_ONE && equals((byte) 1)) {
                clone(other);
                return;
            }
            if (!OperationSupport.getInstance().RSA_SQ || length() <= (short) 16) {
                super.mult(other);
                return;
            }

            BigNat result = rm.BN_F;
            BigNat tmp = rm.BN_G;

            result.setSize((short) ((length() > other.length() ? length() : other.length()) + 1));
            result.copy(this);
            result.add(other);
            result.sq();

            if (isLesser(other)) {
                tmp.clone(other);
                tmp.subtract(this);
            } else {
                tmp.clone(this);
                tmp.subtract(other);
            }
            tmp.sq();

            result.subtract(tmp);
            result.shiftRight((short) 2);

            setSizeToMax(false);
            copy(result);
            shrink();
        }

        /**
         * Computes modulo and stores the result in this.
         */
        public void mod(BigNat mod) {
            remainderDivide(mod, null);
        }

        /**
         * Negate current BigNat modulo provided modulus.
         */
        public void modNegate(BigNat mod) {
            BigNat tmp = rm.BN_B;

            tmp.clone(mod);
            tmp.subtract(this);
            setSize(mod.length());
            copy(tmp);
        }

        /**
         * Modular addition of a BigNat to this.
         */
        public void modAdd(BigNat other, BigNat mod) {
            resize((short) (mod.length() + 1));
            add(other);
            if (!isLesser(mod)) {
                subtract(mod);
            }
            setSize(mod.length());
        }

        /**
         * Modular subtraction of a BigNat from this.
         */
        public void modSub(BigNat other, BigNat mod) {
            resize((short) (mod.length() + 1));
            if (isLesser(other)) {
                add(mod);
            }
            subtract(other);
            setSize(mod.length());
        }

        /**
         * Square this mod a modulus fixed with fixModSqMod method.
         */
        private void modSqFixed() {
            BigNat tmpMod = rm.BN_F;
            byte[] tmpBuffer = rm.ARRAY_A;
            short modLength;

            tmpMod.setSize(rm.MAX_EXP_LENGTH);
            if (OperationSupport.getInstance().RSA_RESIZE_MOD) {
                modLength = rm.MAX_EXP_LENGTH;
            } else {
                modLength = rm.fixedMod.length();
            }

            prependZeros(modLength, tmpBuffer, (short) 0);
            short len = rm.modSqCiph.doFinal(tmpBuffer, (short) 0, modLength, tmpBuffer, (short) 0);

            if (len != rm.MAX_EXP_LENGTH) {
                if (OperationSupport.getInstance().RSA_PREPEND_ZEROS) {
                    Util.arrayCopyNonAtomic(tmpBuffer, (short) 0, tmpBuffer, (short) (rm.MAX_EXP_LENGTH - len), len);
                    Util.arrayFillNonAtomic(tmpBuffer, (short) 0, (short) (rm.MAX_EXP_LENGTH - len), (byte) 0);
                } else {
                    ISOException.throwIt(ReturnCodes.SW_ECPOINT_UNEXPECTED_KA_LEN);
                }
            }
            tmpMod.fromByteArray(tmpBuffer, (short) 0, rm.MAX_EXP_LENGTH);

            if (OperationSupport.getInstance().RSA_EXTRA_MOD) {
                tmpMod.mod(rm.fixedMod);
            }
            setSize(rm.fixedMod.length());
            copy(tmpMod);
        }

        /**
         * Computes (this ^ exp % mod) using RSA algorithm and store results into this.
         */
        public void modExp(BigNat exp, BigNat mod) {
            if (!OperationSupport.getInstance().RSA_EXP)
                ISOException.throwIt(ReturnCodes.SW_OPERATION_NOT_SUPPORTED);
            if (OperationSupport.getInstance().RSA_CHECK_EXP_ONE && exp.equals((byte) 1))
                return;
            if (!OperationSupport.getInstance().RSA_SQ && exp.equals((byte) 2)) {
                modMult(this, mod);
                return;
            }

            BigNat tmpMod = rm.BN_F; // modExp is called from modSqrt => requires BN_F not being locked when modExp is called
            byte[] tmpBuffer = rm.ARRAY_A;
            short modLength;

            tmpMod.setSize(rm.MAX_EXP_LENGTH);

            if (OperationSupport.getInstance().RSA_PUB) {
                // Verify if pre-allocated engine match the required values
                if (rm.expPub.getSize() < (short) (mod.length() * 8) || rm.expPub.getSize() < (short) (length() * 8)) {
                    ISOException.throwIt(ReturnCodes.SW_BIGNAT_MODULOTOOLARGE);
                }
                if (OperationSupport.getInstance().RSA_KEY_REFRESH) {
                    // Simulator fails when reusing the original object
                    rm.expPub = (RSAPublicKey) KeyBuilder.buildKey(KeyBuilder.TYPE_RSA_PUBLIC, rm.MAX_EXP_BIT_LENGTH, false);
                }
                short len = exp.copyToByteArray(tmpBuffer, (short) 0);
                rm.expPub.setExponent(tmpBuffer, (short) 0, len);
                if (OperationSupport.getInstance().RSA_RESIZE_MOD) {
                    if (OperationSupport.getInstance().RSA_APPEND_MOD) {
                        mod.appendZeros(rm.MAX_EXP_LENGTH, tmpBuffer, (short) 0);
                    } else {
                        mod.prependZeros(rm.MAX_EXP_LENGTH, tmpBuffer, (short) 0);
                    }
                    rm.expPub.setModulus(tmpBuffer, (short) 0, rm.MAX_EXP_LENGTH);
                    modLength = rm.MAX_EXP_LENGTH;
                } else {
                    modLength = mod.copyToByteArray(tmpBuffer, (short) 0);
                    rm.expPub.setModulus(tmpBuffer, (short) 0, modLength);
                }
                rm.expCiph.init(rm.expPub, Cipher.MODE_DECRYPT);
            } else {
                // Verify if pre-allocated engine match the required values
                if (rm.expPriv.getSize() < (short) (mod.length() * 8) || rm.expPriv.getSize() < (short) (length() * 8)) {
                    ISOException.throwIt(ReturnCodes.SW_BIGNAT_MODULOTOOLARGE);
                }
                if (OperationSupport.getInstance().RSA_KEY_REFRESH) {
                    // Simulator fails when reusing the original object
                    rm.expPriv = (RSAPrivateKey) KeyBuilder.buildKey(KeyBuilder.TYPE_RSA_PRIVATE, rm.MAX_EXP_BIT_LENGTH, false);
                }
                short len = exp.copyToByteArray(tmpBuffer, (short) 0);
                rm.expPriv.setExponent(tmpBuffer, (short) 0, len);
                if (OperationSupport.getInstance().RSA_RESIZE_MOD) {
                    if (OperationSupport.getInstance().RSA_APPEND_MOD) {
                        mod.appendZeros(rm.MAX_EXP_LENGTH, tmpBuffer, (short) 0);
                    } else {
                        mod.prependZeros(rm.MAX_EXP_LENGTH, tmpBuffer, (short) 0);

                    }
                    rm.expPriv.setModulus(tmpBuffer, (short) 0, rm.MAX_EXP_LENGTH);
                    modLength = rm.MAX_EXP_LENGTH;
                } else {
                    modLength = mod.copyToByteArray(tmpBuffer, (short) 0);
                    rm.expPriv.setModulus(tmpBuffer, (short) 0, modLength);
                }
                rm.expCiph.init(rm.expPriv, Cipher.MODE_DECRYPT);
            }

            prependZeros(modLength, tmpBuffer, (short) 0);
            short len = rm.expCiph.doFinal(tmpBuffer, (short) 0, modLength, tmpBuffer, (short) 0);

            if (len != rm.MAX_EXP_LENGTH) {
                if (OperationSupport.getInstance().RSA_PREPEND_ZEROS) {
                    // Decrypted length can be either tmp_size or less because of leading zeroes consumed by simulator engine implementation
                    // Move obtained value into proper position with zeroes prepended
                    Util.arrayCopyNonAtomic(tmpBuffer, (short) 0, tmpBuffer, (short) (rm.MAX_EXP_LENGTH - len), len);
                    Util.arrayFillNonAtomic(tmpBuffer, (short) 0, (short) (rm.MAX_EXP_LENGTH - len), (byte) 0);
                } else {
                    // real cards should keep whole length of block
                    ISOException.throwIt(ReturnCodes.SW_ECPOINT_UNEXPECTED_KA_LEN);
                }
            }
            tmpMod.fromByteArray(tmpBuffer, (short) 0, rm.MAX_EXP_LENGTH);

            if (OperationSupport.getInstance().RSA_EXTRA_MOD) {
                tmpMod.mod(mod);
            }
            setSize(mod.length());
            copy(tmpMod);
        }

        /**
         * Computes modular inversion. The result is stored into this.
         */
        public void modInv(BigNat mod) {
            BigNat tmp = rm.BN_B;
            tmp.clone(mod);
            tmp.decrement();
            tmp.decrement();

            modExp(tmp, mod);
        }

        /**
         * Multiplication of this and other modulo mod. The result is stored to this.
         */
        public void modMult(BigNat other, BigNat mod) {
            BigNat tmp = rm.BN_D;
            BigNat result = rm.BN_E;

            if (OperationSupport.getInstance().RSA_CHECK_ONE && equals((byte) 1)) {
                copy(other);
                return;
            }

            if (!OperationSupport.getInstance().RSA_SQ || OperationSupport.getInstance().RSA_EXTRA_MOD) {
                result.clone(this);
                result.mult(other);
                result.mod(mod);
            } else {
                result.setSize((short) (mod.length() + 1));
                result.copy(this);
                result.add(other);

                short carry = (byte) 0;
                if (result.isOdd()) {
                    if (result.isLesser(mod)) {
                        carry = result.add(mod);
                    } else {
                        result.subtract(mod);
                    }
                }
                result.shiftRight((short) 1, carry);
                result.resize(mod.length());

                tmp.clone(result);
                tmp.modSub(other, mod);

                result.modSq(mod);
                tmp.modSq(mod);

                result.modSub(tmp, mod);
            }
            setSize(mod.length());
            copy(result);
        }

        /**
         * Computes modulo square of this BigNat.
         */
        public void modSq(BigNat mod) {
            if (OperationSupport.getInstance().RSA_SQ) {
                if (rm.fixedMod != null && rm.fixedMod == mod) {
                    modSqFixed();
                } else {
                    modExp(ResourceManager.TWO, mod);
                }
            } else {
                modMult(this, mod);
            }
        }

        /**
         * Computes square root of provided BigNat which MUST be prime using Tonelli Shanks Algorithm. The result (one of
         * the two roots) is stored to this.
         */
        public void modSqrt(BigNat p) {
            BigNat exp = rm.BN_G;
            BigNat p1 = rm.BN_B;
            BigNat q = rm.BN_C;
            BigNat tmp = rm.BN_D;
            BigNat z = rm.BN_A;
            BigNat t = rm.BN_B;
            BigNat b = rm.BN_C;

            // 1. Find Q and S such that p - 1 = Q * 2^S and Q is odd
            p1.clone(p);
            p1.decrement();

            q.clone(p1);

            short s = 0;
            while (!q.isOdd()) {
                ++s;
                q.shiftRight((short) 1);
            }

            // 2. Find the first quadratic non-residue z by brute-force search
            exp.clone(p1);
            exp.shiftRight((short) 1);


            z.setSize(p.length());
            z.setValue((byte) 1);
            tmp.setSize(p.length());
            tmp.setValue((byte) 1);

            while (!tmp.equals(p1)) {
                z.increment();
                tmp.copy(z);
                tmp.modExp(exp, p); // Euler's criterion
            }

            // 3. Compute the first candidate
            exp.clone(q);
            exp.increment();
            exp.shiftRight((short) 1);

            t.clone(this);
            t.modExp(q, p);

            if (t.equals((byte) 0)) {
                zero();
                return;
            }

            mod(p);
            modExp(exp, p);

            if (t.equals((byte) 1)) {
                return;
            }

            // 4. Search for further candidates
            z.modExp(q, p);

            while(true) {
                tmp.clone(t);
                short i = 0;

                do {
                    tmp.modSq(p);
                    ++i;
                } while (!tmp.equals((byte) 1));


                b.clone(z);
                s -= i;
                --s;

                tmp.setSize((short) 1);
                tmp.setValue((byte) 1);
                while(s != 0) {
                    tmp.shiftLeft((short) 1);
                    --s;
                }
                b.modExp(tmp, p);
                s = i;
                z.clone(b);
                z.modSq(p);
                t.modMult(z, p);
                modMult(b, p);

                if(t.equals((byte) 0)) {
                    zero();
                    break;
                }
                if(t.equals((byte) 1)) {
                    break;
                }
            }
        }
    }

    /**
     * Based on BigNat library from <a href="https://ovchip.cs.ru.nl/OV-chip_2.0">OV-chip project.</a> by Radboud University Nijmegen
     *
     * @author Vasilios Mavroudis and Petr Svenda
     */
    public static class BigNatInternal {
        protected final ResourceManager rm;
        private static final short DIGIT_MASK = 0xff, DIGIT_LEN = 8, DOUBLE_DIGIT_LEN = 16, POSITIVE_DOUBLE_DIGIT_MASK = 0x7fff;

        private byte[] value;
        private short size; // The current size of internal representation in bytes.
        private short offset;

        /**
         * Construct a BigNat of at least a given size in bytes.
         */
        public BigNatInternal(short size, byte allocatorType, ResourceManager rm) {
            this.rm = rm;
            this.offset = 1;
            this.size = size;
            this.value = rm.memAlloc.allocateByteArray((short) (size + 1), allocatorType);
        }

        /**
         * Set value of this from a byte array representation.
         *
         * @param source the byte array
         * @param sourceOffset offset in the byte array
         * @param length length of the value representation
         * @return number of bytes read
         */
        public short fromByteArray(byte[] source, short sourceOffset, short length) {
            short read = length <= (short) value.length ? length : (short) value.length;
            setSize(read);
            Util.arrayCopyNonAtomic(source, sourceOffset, value, offset, size);
            return size;
        }

        /**
         * Serialize this BigNat value into a provided byte array.
         *
         * @param dst the byte array
         * @param dstOffset offset in the byte array
         * @return number of bytes written
         */
        public short copyToByteArray(byte[] dst, short dstOffset) {
            Util.arrayCopyNonAtomic(value, offset, dst, dstOffset, size);
            return size;
        }

        /**
         * Get size of this BigNat in bytes.
         *
         * @return size in bytes
         */
        public short length() {
            return size;
        }

        /**
         * Sets the size of this BigNat in bytes.
         *
         * Previous value is kept so value is either non-destructively trimmed or enlarged.
         *
         * @param newSize the new size
         */
        public void setSize(short newSize) {
            if (newSize < 0 || newSize > value.length) {
                ISOException.throwIt(ReturnCodes.SW_BIGNAT_RESIZETOLONGER);
            }
            size = newSize;
            offset = (short) (value.length - size);
        }

        /**
         * Set size of this BigNat to the maximum size given during object creation.
         *
         * @param erase flag indicating whether to set internal representation to zero
         */
        public void setSizeToMax(boolean erase) {
            setSize((short) value.length);
            if (erase) {
                erase();
            }
        }

        /**
         * Resize this BigNat value to given size in bytes. May result in truncation.
         *
         * @param newSize new size in bytes
         */
        public void resize(short newSize) {
            if (newSize > (short) value.length) {
                ISOException.throwIt(ReturnCodes.SW_BIGNAT_REALLOCATIONNOTALLOWED);
            }

            short diff = (short) (newSize - size);
            setSize(newSize);
            if (diff > 0) {
                Util.arrayFillNonAtomic(value, offset, diff, (byte) 0);
            }
        }

        /**
         * Append zeros to reach the defined byte length and store the result in an output buffer.
         *
         * @param targetLength required length including appended zeroes
         * @param outBuffer    output buffer for value with appended zeroes
         * @param outOffset    start offset inside outBuffer for write
         */
        public void appendZeros(short targetLength, byte[] outBuffer, short outOffset) {
            Util.arrayCopyNonAtomic(value, offset, outBuffer, outOffset, size);
            Util.arrayFillNonAtomic(outBuffer, (short) (outOffset + size), (short) (targetLength - size), (byte) 0);
        }

        /**
         * Prepend zeros to reach the defined byte length and store the result in an output buffer.
         *
         * @param targetLength required length including prepended zeroes
         * @param outBuffer    output buffer for value with prepended zeroes
         * @param outOffset    start offset inside outBuffer for write
         */
        public void prependZeros(short targetLength, byte[] outBuffer, short outOffset) {
            short start = (short) (targetLength - size);
            if (start > 0) {
                Util.arrayFillNonAtomic(outBuffer, outOffset, start, (byte) 0);
            }
            Util.arrayCopyNonAtomic(value, offset, outBuffer, (short) (outOffset + start), size);
        }

        /**
         * Remove leading zeroes from this BigNat and decrease its byte size accordingly.
         */
        public void shrink() {
            short i;
            for (i = offset; i < value.length; i++) { // Find first non-zero byte
                if (value[i] != 0) {
                    break;
                }
            }

            short newSize = (short) (value.length - i);
            if (newSize < 0) {
                ISOException.throwIt(ReturnCodes.SW_BIGNAT_INVALIDRESIZE);
            }
            resize(newSize);
        }

        /**
         * Set this BigNat value to zero. Previous size is kept.
         */
        public void zero() {
            Util.arrayFillNonAtomic(value, offset, size, (byte) 0);
        }

        /**
         * Erase the internal array of this BigNat.
         */
        public void erase() {
            Util.arrayFillNonAtomic(value, (short) 0, (short) value.length, (byte) 0);
        }

        /**
         * Set this BigNat to a given value. Previous size is kept.
         */
        public void setValue(byte newValue) {
            zero();
            value[(short) (value.length - 1)] = (byte) (newValue & DIGIT_MASK);
        }

        /**
         * Set this BigNat to a given value. Previous size is kept.
         */
        public void setValue(short newValue) {
            zero();
            value[(short) (value.length - 1)] = (byte) (newValue & DIGIT_MASK);
            value[(short) (value.length - 2)] = (byte) ((short) (newValue >> 8) & DIGIT_MASK);
        }

        /**
         * Copies a BigNat into this without changing size. May throw an exception if this is too small.
         */
        public void copy(BigNatInternal other) {
            short thisStart, otherStart, len;
            short diff = (short) (size - other.size);
            if (diff >= 0) {
                thisStart = (short) (diff + offset);
                otherStart = other.offset;
                len = other.size;

                if (diff > 0) {
                    Util.arrayFillNonAtomic(value, offset, diff, (byte) 0);
                }
            } else {
                thisStart = offset;
                otherStart = (short) (other.offset - diff);
                len = size;
                // Verify here that other have leading zeroes up to otherStart
                for (short i = other.offset; i < otherStart; i++) {
                    if (other.value[i] != 0) {
                        ISOException.throwIt(ReturnCodes.SW_BIGNAT_INVALIDCOPYOTHER);
                    }
                }
            }
            Util.arrayCopyNonAtomic(other.value, otherStart, value, thisStart, len);
        }

        /**
         * Copies a BigNat into this including its size. May require reallocation.
         */
        public void clone(BigNatInternal other) {
            if (other.size > (short) value.length) {
                ISOException.throwIt(ReturnCodes.SW_BIGNAT_REALLOCATIONNOTALLOWED);
            }

            short diff = (short) ((short) value.length - other.size);
            other.copyToByteArray(value, diff);
            if (diff > 0) {
                Util.arrayFillNonAtomic(value, (short) 0, diff, (byte) 0);
            }
            setSize(other.size);
        }

        /**
         * Check if stored BigNat is odd.
         */
        public boolean isOdd() {
            return (byte) (value[(short) (value.length - 1)] & (byte) 1) != (byte) 0;
        }

        /**
         * Returns true if this BigNat is lesser than the other.
         */
        public boolean isLesser(BigNatInternal other) {
            return isLesser(other, (short) 0, (short) 0);
        }

        /**
         * Returns true if this is lesser than other shifted by a given number of digits.
         */
        private boolean isLesser(BigNatInternal other, short shift, short start) {
            short j = (short) (other.size + shift - size + start + other.offset);

            for (short i = (short) (start + other.offset); i < j; ++i) {
                if (other.value[i] != 0) {
                    return true;
                }
            }

            for (short i = (short) (start + offset); i < (short) value.length; i++, j++) {
                short thisValue = (short) (value[i] & DIGIT_MASK);
                short otherValue = (j >= other.offset && j < (short) other.value.length) ? (short) (other.value[j] & DIGIT_MASK) : (short) 0;
                if (thisValue < otherValue) {
                    return true; // CTO
                }
                if (thisValue > otherValue) {
                    return false;
                }
            }
            return false;
        }

        /**
         * Value equality check.
         *
         * @param other BigNat to compare
         * @return true if this and other have the same value, false otherwise.
         */
        public boolean equals(BigNatInternal other) {
            short diff = (short) (size - other.size);

            if (diff == 0) {
                return Util.arrayCompare(value, offset, other.value, other.offset, size) == 0;
            }


            if (diff < 0) {
                short end = (short) (other.offset - diff);
                for (short i = other.offset; i < end; ++i) {
                    if (other.value[i] != (byte) 0) {
                        return false;
                    }
                }
                return Util.arrayCompare(value, (short) 0, other.value, end, size) == 0;
            }

            short end = diff;
            for (short i = (short) 0; i < end; ++i) {
                if (value[i] != (byte) 0) {
                    return false;
                }
            }
            return Util.arrayCompare(value, end, other.value, other.offset, other.size) == 0;
        }

        /**
         * Test equality with a byte.
         */
        public boolean equals(byte b) {
            for (short i = offset; i < (short) (value.length - 1); i++) {
                if (value[i] != 0) {
                    return false; // CTO
                }
            }
            return value[(short) (value.length - 1)] == b;
        }

        /**
         * Increment this BigNat.
         */
        public void increment() {
            for (short i = (short) (value.length - 1); i >= offset; i--) {
                short tmp = (short) (value[i] & 0xff);
                value[i] = (byte) (tmp + 1);
                if (tmp < 255) {
                    break; // CTO
                }
            }
        }

        /**
         * Decrement this BigNat.
         */
        public void decrement() {
            short tmp;
            for (short i = (short) (value.length - 1); i >= offset; i--) {
                tmp = (short) (value[i] & 0xff);
                value[i] = (byte) (tmp - 1);
                if (tmp != 0) {
                    break; // CTO
                }
            }
        }

        /**
         * Add short value to this BigNat
         *
         * @param other short value to add
         */
        public byte add(short other) {
            rm.BN_WORD.setValue(other);
            byte carry = add(rm.BN_WORD);
            return carry;
        }

        /**
         * Adds other to this. Outputs carry bit.
         *
         * @param other BigNat to add
         * @return true if carry occurs, false otherwise
         */
        public byte add(BigNatInternal other) {
            return add(other, (short) 0, (short) 1);
        }

        /**
         * Computes other * multiplier, shifts the results by shift and adds it to this.
         * Multiplier must be in range [0; 2^8 - 1].
         * This must be large enough to fit the results.
         */
        private byte add(BigNatInternal other, short shift, short multiplier) {
            short acc = 0;
            short i = (short) (other.size - 1 + other.offset);
            short j = (short) (size - 1 - shift + offset);
            for (; i >= other.offset && j >= offset; i--, j--) {
                acc += (short) ((short) (value[j] & DIGIT_MASK) + (short) (multiplier * (other.value[i] & DIGIT_MASK)));

                value[j] = (byte) (acc & DIGIT_MASK);
                acc = (short) ((acc >> DIGIT_LEN) & DIGIT_MASK);
            }

            for (; acc > 0 && j >= offset; --j) {
                acc += (short) (value[j] & DIGIT_MASK);
                value[j] = (byte) (acc & DIGIT_MASK);
                acc = (short) ((acc >> DIGIT_LEN) & DIGIT_MASK);
            }

            // output carry bit if present
            return (byte) (((byte) (((short) (acc | -acc) & (short) 0xFFFF) >>> 15) & 0x01) << 7);
        }

        /**
         * Subtract provided other BigNat from this BigNat.
         *
         * @param other BigNat to be subtracted from this
         */
        public void subtract(BigNatInternal other) {
            subtract(other, (short) 0, (short) 1);
        }

        /**
         * Computes other * multiplier, shifts the results by shift and subtract it from this.
         * Multiplier must be in range [0; 2^8 - 1].
         */
        private void subtract(BigNatInternal other, short shift, short multiplier) {
            short acc = 0;
            short i = (short) (size - 1 - shift + offset);
            short j = (short) (other.size - 1 + other.offset);
            for (; i >= offset && j >= other.offset; i--, j--) {
                acc += (short) (multiplier * (other.value[j] & DIGIT_MASK));
                short tmp = (short) ((value[i] & DIGIT_MASK) - (acc & DIGIT_MASK));

                value[i] = (byte) (tmp & DIGIT_MASK);
                acc = (short) ((acc >> DIGIT_LEN) & DIGIT_MASK);
                if (tmp < 0) {
                    acc++;
                }
            }

            // deal with carry as long as there are digits left in this
            for (; i >= offset && acc != 0; --i) {
                short tmp = (short) ((value[i] & DIGIT_MASK) - (acc & DIGIT_MASK));
                value[i] = (byte) (tmp & DIGIT_MASK);
                acc = (short) ((acc >> DIGIT_LEN) & DIGIT_MASK);
                if (tmp < 0) {
                    acc++;
                }
            }
        }

        /**
         * Multiplies this and other using software multiplications and stores results into this.
         */
        public void mult(BigNatInternal other) {
            BigNatInternal tmp = rm.BN_F;
            tmp.clone(this);
            setSizeToMax(true);
            for (short i = (short) (other.value.length - 1); i >= other.offset; i--) {
                add(tmp, (short) (other.value.length - 1 - i), (short) (other.value[i] & DIGIT_MASK));
            }
            shrink();
        }

        /**
         * Right bit shift with carry
         *
         * @param bits number of bits to shift by
         * @param carry ORed into the highest byte
         */
        protected void shiftRight(short bits, short carry) {
            // assumes 0 <= bits < 8
            short mask = (short) ((short) (1 << bits) - 1); // lowest `bits` bits set to 1
            for (short i = offset; i < (short) value.length; i++) {
                short current = (short) (value[i] & 0xff);
                short previous = current;
                current >>= bits;
                value[i] = (byte) (current | carry);
                carry = (short) (previous & mask);
                carry <<= (short) (8 - bits);
            }
        }

        /**
         * Right bit shift
         *
         * @param bits number of bits to shift by
         */
        public void shiftRight(short bits) {
            shiftRight(bits, (short) 0);
        }

        /**
         * Left bit shift with carry
         *
         * @param bits number of bits to shift by
         * @param carry ORed into the lowest byte
         */
        protected void shiftLeft(short bits, short carry) {
            // assumes 0 <= bits < 8
            short mask = (short) ((-1 << (8 - bits)) & 0xff); // highest `bits` bits set to 1
            for (short i = (short) (value.length - 1); i >= offset; --i) {
                short current = (short) (value[i] & 0xff);
                short previous = current;
                current <<= bits;
                value[i] = (byte) (current | carry);
                carry = (short) (previous & mask);
                carry >>= (8 - bits);
            }

            if (carry != 0) {
                setSize((short) (size + 1));
                value[offset] = (byte) carry;
            }
        }

        /**
         * Right bit shift
         *
         * @param bits number of bits to shift by
         */
        public void shiftLeft(short bits) {
            shiftLeft(bits, (short) 0);
        }

        /**
         * Divide this by divisor and store the remained in this and quotient in quotient.
         *
         * Quadratic complexity in digit difference of this and divisor.
         *
         * @param divisor non-zero number
         * @param quotient may be null
         */
        public void remainderDivide(BigNatInternal divisor, BigNatInternal quotient) {
            if (quotient != null) {
                quotient.zero();
            }

            short divisorIndex = divisor.offset;
            while (divisor.value[divisorIndex] == 0) {
                divisorIndex++;
            }

            short divisorShift = (short) (size - divisor.size + divisorIndex - divisor.offset);
            short divisionRound = 0;
            short firstDivisorDigit = (short) (divisor.value[divisorIndex] & DIGIT_MASK);
            short divisorBitShift = (short) (highestOneBit((short) (firstDivisorDigit + 1)) - 1);
            byte secondDivisorDigit = divisorIndex < (short) (divisor.value.length - 1) ? divisor.value[(short) (divisorIndex + 1)] : 0;
            byte thirdDivisorDigit = divisorIndex < (short) (divisor.value.length - 2) ? divisor.value[(short) (divisorIndex + 2)] : 0;

            while (divisorShift >= 0) {
                while (!isLesser(divisor, divisorShift, (short) (divisionRound > 0 ? divisionRound - 1 : 0))) {
                    short divisionRoundOffset = (short) (divisionRound + offset);
                    short dividentDigits = divisionRound == 0 ? 0 : (short) ((short) (value[(short) (divisionRoundOffset - 1)]) << DIGIT_LEN);
                    dividentDigits |= (short) (value[(short) (divisionRound + offset)] & DIGIT_MASK);

                    short divisorDigit;
                    if (dividentDigits < 0) {
                        dividentDigits = (short) ((dividentDigits >>> 1) & POSITIVE_DOUBLE_DIGIT_MASK);
                        divisorDigit = (short) ((firstDivisorDigit >>> 1) & POSITIVE_DOUBLE_DIGIT_MASK);
                    } else {
                        short dividentBitShift = (short) (highestOneBit(dividentDigits) - 1);
                        short bitShift = dividentBitShift <= divisorBitShift ? dividentBitShift : divisorBitShift;

                        dividentDigits = shiftBits(
                                dividentDigits, divisionRound < (short) (size - 1) ? value[(short) (divisionRoundOffset + 1)] : 0,
                                divisionRound < (short) (size - 2) ? value[(short) (divisionRoundOffset + 2)] : 0,
                                bitShift
                        );
                        divisorDigit = shiftBits(firstDivisorDigit, secondDivisorDigit, thirdDivisorDigit, bitShift);
                    }

                    short multiple = (short) (dividentDigits / (short) (divisorDigit + 1));
                    if (multiple < 1) {
                        multiple = 1;
                    }

                    subtract(divisor, divisorShift, multiple);

                    if (quotient != null) {
                        short divisorShiftOffset = (short) (divisorShift - quotient.offset);
                        short quotientDigit = (short) ((quotient.value[(short) (quotient.size - 1 - divisorShiftOffset)] & DIGIT_MASK) + multiple);
                        quotient.value[(short) (quotient.size - 1 - divisorShiftOffset)] = (byte) quotientDigit;
                    }
                }
                divisionRound++;
                divisorShift--;
            }
        }

        /**
         * Get the index of the highest bit set to 1. Used in remainderDivide.
         */
        private static short highestOneBit(short x) {
            for (short i = 0; i < DOUBLE_DIGIT_LEN; ++i) {
                if (x < 0) {
                    return i;
                }
                x <<= 1;
            }
            return DOUBLE_DIGIT_LEN;
        }

        /**
         * Shift to the left and fill. Used in remainderDivide.
         *
         * @param high most significant 16 bits
         * @param middle middle 8 bits
         * @param low least significant 8 bits
         * @param shift the left shift
         * @return most significant 16 bits as short
         */
        private static short shiftBits(short high, byte middle, byte low, short shift) {
            // shift high
            high <<= shift;

            // merge middle bits
            byte mask = (byte) (DIGIT_MASK << (shift >= DIGIT_LEN ? 0 : DIGIT_LEN - shift));
            short bits = (short) ((short) (middle & mask) & DIGIT_MASK);
            if (shift > DIGIT_LEN) {
                bits <<= shift - DIGIT_LEN;
            } else {
                bits >>>= DIGIT_LEN - shift;
            }
            high |= bits;

            if (shift <= DIGIT_LEN) {
                return high;
            }

            // merge low bits
            mask = (byte) (DIGIT_MASK << DOUBLE_DIGIT_LEN - shift);
            bits = (short) ((((short) (low & mask) & DIGIT_MASK) >> DOUBLE_DIGIT_LEN - shift));
            high |= bits;

            return high;
        }

    }

    /**
     * @author Vasilios Mavroudis and Petr Svenda
     */
    public static class ECCurve {
        public final short KEY_BIT_LENGTH, POINT_SIZE, COORD_SIZE;
        public ResourceManager rm;

        public byte[] p, a, b, G, r;
        public short k;
        public BigNat pBN, aBN, bBN, rBN;


        public KeyPair disposablePair;
        public ECPrivateKey disposablePriv;
        public ECPublicKey disposablePub;

        /**
         * Creates new curve object from provided parameters. Parameters are not copied, the
         * arrays must not be changed.
         *
         * @param p array with p
         * @param a array with a
         * @param b array with b
         * @param G array with base point G
         * @param r array with r
         */
        public ECCurve(byte[] p, byte[] a, byte[] b, byte[] G, byte[] r, short k, ResourceManager rm) {
            short bits = (short) (p.length * 8);
            if (OperationSupport.getInstance().EC_PRECISE_BITLENGTH) {
                for (short i = 0; i < (short) p.length; ++i) {
                    bits -= 8;
                    if (p[i] != (byte) 0x00) {
                        short tmp = (short) (p[i] & 0xff);
                        while (tmp != (short) 0x00) {
                            tmp >>= (short) 1;
                            ++bits;
                        }
                        break;
                    }
                }
            }
            KEY_BIT_LENGTH = bits;
            POINT_SIZE = (short) G.length;
            COORD_SIZE = (short) ((short) (G.length - 1) / 2);

            this.p = p;
            this.a = a;
            this.b = b;
            this.G = G;
            this.r = r;
            this.k = k;
            this.rm = rm;

            pBN = new BigNat(COORD_SIZE, JCSystem.MEMORY_TYPE_TRANSIENT_RESET, rm);
            pBN.fromByteArray(p, (short) 0, (short) p.length);
            aBN = new BigNat(COORD_SIZE, JCSystem.MEMORY_TYPE_PERSISTENT, rm);
            aBN.fromByteArray(a, (short) 0, (short) a.length);
            bBN = new BigNat(COORD_SIZE, JCSystem.MEMORY_TYPE_PERSISTENT, rm);
            bBN.fromByteArray(b, (short) 0, (short) b.length);
            rBN = new BigNat(COORD_SIZE, JCSystem.MEMORY_TYPE_TRANSIENT_RESET, rm);
            rBN.fromByteArray(r, (short) 0, (short) r.length);

            disposablePair = newKeyPair(null);
            disposablePriv = (ECPrivateKey) disposablePair.getPrivate();
            disposablePub = (ECPublicKey) disposablePair.getPublic();
        }

        /**
         * Refresh critical information stored in RAM for performance reasons after a card reset (RAM was cleared).
         */
        public void updateAfterReset() {
            pBN.fromByteArray(p, (short) 0, (short) p.length);
            aBN.fromByteArray(a, (short) 0, (short) a.length);
            bBN.fromByteArray(b, (short) 0, (short) b.length);
            rBN.fromByteArray(r, (short) 0, (short) r.length);
        }

        /**
         * Creates a new keyPair based on this curve parameters. KeyPair object is reused if provided. Fresh keyPair value is generated.
         * @param keyPair existing KeyPair object which is reused if required. If null, new KeyPair is allocated
         * @return new or existing object with fresh key pair value
         */
        KeyPair newKeyPair(KeyPair keyPair) {
            ECPublicKey pubKey;
            ECPrivateKey privKey;
            if (keyPair == null) {
                pubKey = (ECPublicKey) KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PUBLIC, KEY_BIT_LENGTH, false);
                privKey = (ECPrivateKey) KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE, KEY_BIT_LENGTH, false);
                keyPair = new KeyPair(pubKey, privKey);
            } else {
                pubKey = (ECPublicKey) keyPair.getPublic();
                privKey = (ECPrivateKey) keyPair.getPrivate();
            }

            privKey.setFieldFP(p, (short) 0, (short) p.length);
            privKey.setA(a, (short) 0, (short) a.length);
            privKey.setB(b, (short) 0, (short) b.length);
            privKey.setG(G, (short) 0, (short) G.length);
            privKey.setR(r, (short) 0, (short) r.length);
            privKey.setK(OperationSupport.getInstance().EC_SET_COFACTOR ? k : (short) 1);

            pubKey.setFieldFP(p, (short) 0, (short) p.length);
            pubKey.setA(a, (short) 0, (short) a.length);
            pubKey.setB(b, (short) 0, (short) b.length);
            pubKey.setG(G, (short) 0, (short) G.length);
            pubKey.setR(r, (short) 0, (short) r.length);
            pubKey.setK(OperationSupport.getInstance().EC_SET_COFACTOR ? k : (short) 1);

            if (OperationSupport.getInstance().EC_GEN) {
                keyPair.genKeyPair();
            } else {
                privKey.setS(ResourceManager.CONST_ONE, (short) 0, (short) 1);
                pubKey.setW(G, (short) 0, (short) G.length);
            }

            return keyPair;
        }
    }

    /**
     * @author Vasilios Mavroudis and Petr Svenda and Antonin Dufka
     */
    public static class ECPoint {
        private final ResourceManager rm;

        private ECPublicKey point;
        private KeyPair pointKeyPair;
        private final ECCurve curve;

        /**
         * Creates new ECPoint object for provided {@code curve}. Random initial point value is generated.
         *
         * @param curve point's elliptic curve
         */
        public ECPoint(ECCurve curve) {
            this.curve = curve;
            this.rm = curve.rm;
            updatePointObjects();
        }

        /**
         * Returns length of this point in bytes.
         *
         * @return length of this point in bytes
         */
        public short length() {
            return (short) (point.getSize() / 8);
        }

        /**
         * Properly updates all point values in case of a change of an underlying curve.
         * New random point value is generated.
         */
        public final void updatePointObjects() {
            pointKeyPair = curve.newKeyPair(pointKeyPair);
            point = (ECPublicKey) pointKeyPair.getPublic();
        }

        /**
         * Generates new random point value.
         */
        public void randomize() {
            if (OperationSupport.getInstance().EC_GEN) {
                pointKeyPair.genKeyPair(); // Fails for some curves on some cards
            } else {
                BigNat tmp = rm.EC_BN_A;
                rm.rng.generateData(rm.ARRAY_A, (short) 0, (short) (curve.KEY_BIT_LENGTH / 8 + 16));
                tmp.fromByteArray(rm.ARRAY_A, (short) 0, (short) (curve.KEY_BIT_LENGTH / 8 + 16));
                tmp.mod(curve.rBN);
                tmp.shrink();
                point.setW(curve.G, (short) 0, (short) curve.G.length);
                multiplication(tmp);
            }
        }

        /**
         * Copy value of provided point into this. This and other point must have
         * curve with same parameters, only length is checked.
         *
         * @param other point to be copied
         */
        public void copy(ECPoint other) {
            if (length() != other.length()) {
                ISOException.throwIt(ReturnCodes.SW_ECPOINT_INVALIDLENGTH);
            }
            byte[] pointBuffer = rm.POINT_ARRAY_A;

            short len = other.getW(pointBuffer, (short) 0);
            setW(pointBuffer, (short) 0, len);
        }

        /**
         * Set this point value (parameter W) from array with value encoded as per ANSI X9.62.
         * The uncompressed form is always supported. If underlying native JavaCard implementation
         * of {@code ECPublicKey} supports compressed points, then this method accepts also compressed points.
         *
         * @param buffer array with serialized point
         * @param offset start offset within input array
         * @param length length of point
         */
        public void setW(byte[] buffer, short offset, short length) {
            point.setW(buffer, offset, length);
        }

        /**
         * Returns current value of this point.
         *
         * @param buffer memory array where to store serailized point value
         * @param offset start offset for output serialized point
         * @return length of serialized point (number of bytes)
         */
        public short getW(byte[] buffer, short offset) {
            return point.getW(buffer, offset);
        }

        /**
         * Returns this point value as ECPublicKey object. No copy of point is made
         * before return, so change of returned object will also change this point value.
         *
         * @return point as ECPublicKey object
         */
        public ECPublicKey asPublicKey() {
            return point;
        }

        /**
         * Returns curve associated with this point. No copy of curve is made
         * before return, so change of returned object will also change curve for
         * this point.
         *
         * @return curve as ECCurve object
         */
        public ECCurve getCurve() {
            return curve;
        }

        /**
         * Returns the X coordinate of this point in uncompressed form.
         *
         * @param buffer output array for X coordinate
         * @param offset start offset within output array
         * @return length of X coordinate (in bytes)
         */
        public short getX(byte[] buffer, short offset) {
            byte[] pointBuffer = rm.POINT_ARRAY_A;

            point.getW(pointBuffer, (short) 0);
            Util.arrayCopyNonAtomic(pointBuffer, (short) 1, buffer, offset, curve.COORD_SIZE);
            return curve.COORD_SIZE;
        }

        /**
         * Returns the Y coordinate of this point in uncompressed form.
         *
         * @param buffer output array for Y coordinate
         * @param offset start offset within output array
         * @return length of Y coordinate (in bytes)
         */
        public short getY(byte[] buffer, short offset) {
            byte[] pointBuffer = rm.POINT_ARRAY_A;

            point.getW(pointBuffer, (short) 0);
            Util.arrayCopyNonAtomic(pointBuffer, (short) (1 + curve.COORD_SIZE), buffer, offset, curve.COORD_SIZE);
            return curve.COORD_SIZE;
        }

        /**
         * Double this point. Pure implementation without KeyAgreement.
         */
        public void swDouble() {
            byte[] pointBuffer = rm.POINT_ARRAY_A;
            BigNat pX = rm.EC_BN_B;
            BigNat pY = rm.EC_BN_C;
            BigNat lambda = rm.EC_BN_D;
            BigNat tmp = rm.EC_BN_E;

            getW(pointBuffer, (short) 0);

            pX.fromByteArray(pointBuffer, (short) 1, curve.COORD_SIZE);

            pY.fromByteArray(pointBuffer, (short) (1 + curve.COORD_SIZE), curve.COORD_SIZE);

            lambda.clone(pX);
            lambda.modSq(curve.pBN);
            lambda.modMult(ResourceManager.THREE, curve.pBN);
            lambda.modAdd(curve.aBN, curve.pBN);

            tmp.clone(pY);
            tmp.modAdd(tmp, curve.pBN);
            tmp.modInv(curve.pBN);
            lambda.modMult(tmp, curve.pBN);
            tmp.clone(lambda);
            tmp.modSq(curve.pBN);
            tmp.modSub(pX, curve.pBN);
            tmp.modSub(pX, curve.pBN);
            tmp.prependZeros(curve.COORD_SIZE, pointBuffer, (short) 1);

            tmp.modSub(pX, curve.pBN);
            tmp.modMult(lambda, curve.pBN);
            tmp.modAdd(pY, curve.pBN);
            tmp.modNegate(curve.pBN);
            tmp.prependZeros(curve.COORD_SIZE, pointBuffer, (short) (1 + curve.COORD_SIZE));

            setW(pointBuffer, (short) 0, curve.POINT_SIZE);
        }


        /**
         * Doubles the current value of this point.
         */
        public void makeDouble() {
            // doubling via add sometimes causes exception inside KeyAgreement engine
            // this.add(this);
            // Use bit slower, but more robust version via multiplication by 2
            this.multiplication(ResourceManager.TWO);
        }

        /**
         * Adds this (P) and provided (Q) point. Stores a resulting value into this point.
         *
         * @param other point to be added to this.
         */
        public void add(ECPoint other) {
            if (OperationSupport.getInstance().EC_HW_ADD) {
                hwAdd(other);
            } else {
                swAdd(other);
            }
        }

        /**
         * Implements adding of two points without ALG_EC_PACE_GM.
         *
         * @param other point to be added to this.
         */
        private void swAdd(ECPoint other) {
            boolean samePoint = this == other || isEqual(other);
            if (samePoint && OperationSupport.getInstance().EC_HW_XY) {
                multiplication(ResourceManager.TWO);
                return;
            }

            byte[] pointBuffer = rm.POINT_ARRAY_A;
            BigNat xR = rm.EC_BN_B;
            BigNat yR = rm.EC_BN_C;
            BigNat xP = rm.EC_BN_D;
            BigNat yP = rm.EC_BN_E;
            BigNat xQ = rm.EC_BN_F;
            BigNat nominator = rm.EC_BN_B;
            BigNat denominator = rm.EC_BN_C;
            BigNat lambda = rm.EC_BN_A;

            point.getW(pointBuffer, (short) 0);
            xP.setSize(curve.COORD_SIZE);
            xP.fromByteArray(pointBuffer, (short) 1, curve.COORD_SIZE);
            yP.setSize(curve.COORD_SIZE);
            yP.fromByteArray(pointBuffer, (short) (1 + curve.COORD_SIZE), curve.COORD_SIZE);


            // l = (y_q-y_p)/(x_q-x_p))
            // x_r = l^2 - x_p -x_q
            // y_r = l(x_p-x_r)-y_p

            // P + Q = R
            if (samePoint) {
                // lambda = (3(x_p^2)+a)/(2y_p)
                // (3(x_p^2)+a)
                nominator.clone(xP);
                nominator.modSq(curve.pBN);
                nominator.modMult(ResourceManager.THREE, curve.pBN);
                nominator.modAdd(curve.aBN, curve.pBN);
                // (2y_p)
                denominator.clone(yP);
                denominator.modMult(ResourceManager.TWO, curve.pBN);
                denominator.modInv(curve.pBN);

            } else {
                // lambda = (y_q-y_p) / (x_q-x_p) mod p
                other.point.getW(pointBuffer, (short) 0);
                xQ.setSize(curve.COORD_SIZE);
                xQ.fromByteArray(pointBuffer, (short) 1, other.curve.COORD_SIZE);
                nominator.setSize(curve.COORD_SIZE);
                nominator.fromByteArray(pointBuffer, (short) (1 + curve.COORD_SIZE), curve.COORD_SIZE);

                nominator.mod(curve.pBN);

                nominator.modSub(yP, curve.pBN);

                // (x_q-x_p)
                denominator.clone(xQ);
                denominator.mod(curve.pBN);
                denominator.modSub(xP, curve.pBN);
                denominator.modInv(curve.pBN);
            }

            lambda.clone(nominator);
            lambda.modMult(denominator, curve.pBN);

            // (x_p, y_p) + (x_q, y_q) = (x_r, y_r)
            // lambda = (y_q - y_p) / (x_q - x_p)

            // x_r = lambda^2 - x_p - x_q
            if (samePoint) {
                short len = multXKA(ResourceManager.TWO, pointBuffer, (short) 0);
                xR.fromByteArray(pointBuffer, (short) 0, len);
            } else {
                xR.clone(lambda);
                xR.modSq(curve.pBN);
                xR.modSub(xP, curve.pBN);
                xR.modSub(xQ, curve.pBN);
            }

            // y_r = lambda(x_p - x_r) - y_p
            yR.clone(xP);
            yR.modSub(xR, curve.pBN);
            yR.modMult(lambda, curve.pBN);
            yR.modSub(yP, curve.pBN);

            pointBuffer[0] = (byte) 0x04;
            // If x_r.length() and y_r.length() is smaller than curve.COORD_SIZE due to leading zeroes which were shrunk before, then we must add these back
            xR.prependZeros(curve.COORD_SIZE, pointBuffer, (short) 1);
            yR.prependZeros(curve.COORD_SIZE, pointBuffer, (short) (1 + curve.COORD_SIZE));
            setW(pointBuffer, (short) 0, curve.POINT_SIZE);
        }

        /**
         * Implements adding of two points via ALG_EC_PACE_GM.
         *
         * @param other point to be added to this.
         */
        private void hwAdd(ECPoint other) {
            byte[] pointBuffer = rm.POINT_ARRAY_A;

            setW(pointBuffer, (short) 0, multAndAddKA(ResourceManager.ONE_COORD, other, pointBuffer, (short) 0));
        }

        /**
         * Multiply value of this point by provided scalar. Stores the result into this point.
         *
         * @param scalarBytes value of scalar for multiplication
         */
        public void multiplication(byte[] scalarBytes, short scalarOffset, short scalarLen) {
            BigNat scalar = rm.EC_BN_F;

            scalar.setSize(scalarLen);
            scalar.fromByteArray(scalarBytes, scalarOffset, scalarLen);
            multiplication(scalar);
        }

        /**
         * Multiply value of this point by provided scalar. Stores the result into this point.
         *
         * @param scalar value of scalar for multiplication
         */
        public void multiplication(BigNat scalar) {
            if (OperationSupport.getInstance().EC_SW_DOUBLE && scalar.equals(ResourceManager.TWO)) {
                swDouble();
            // } else if (rm.ecMultKA.getAlgorithm() == KeyAgreement.ALG_EC_SVDP_DH_PLAIN_XY) {
            } else if (rm.ecMultKA.getAlgorithm() == (byte) 6) {
                multXY(scalar);
            //} else if (rm.ecMultKA.getAlgorithm() == KeyAgreement.ALG_EC_SVDP_DH_PLAIN) {
            } else if (rm.ecMultKA.getAlgorithm() == (byte) 3) {
                multX(scalar);
            } else {
                ISOException.throwIt(ReturnCodes.SW_OPERATION_NOT_SUPPORTED);
            }
        }

        /**
         * Multiply this point by a given scalar and add another point to the result.
         *
         * @param scalar value of scalar for multiplication
         * @param point the other point
         */
        public void multAndAdd(BigNat scalar, ECPoint point) {
            if (OperationSupport.getInstance().EC_HW_ADD) {
                byte[] pointBuffer = rm.POINT_ARRAY_A;

                setW(pointBuffer, (short) 0, multAndAddKA(scalar, point, pointBuffer, (short) 0));
            } else {
                multiplication(scalar);
                add(point);
            }
        }

        /**
         * Multiply this point by a given scalar and add another point to the result and store the result into outBuffer.
         *
         * @param scalar value of scalar for multiplication
         * @param point the other point
         * @param outBuffer output buffer
         * @param outBufferOffset offset in the output buffer
         */
        private short multAndAddKA(BigNat scalar, ECPoint point, byte[] outBuffer, short outBufferOffset) {
            byte[] pointBuffer = rm.POINT_ARRAY_B;

            short len = getW(pointBuffer, (short) 0);
            curve.disposablePriv.setG(pointBuffer, (short) 0, len);
            scalar.prependZeros((short) curve.r.length, pointBuffer, (short) 0);
            curve.disposablePriv.setS(pointBuffer, (short) 0, (short) curve.r.length);
            rm.ecAddKA.init(curve.disposablePriv);

            len = point.getW(pointBuffer, (short) 0);
            len = rm.ecAddKA.generateSecret(pointBuffer, (short) 0, len, outBuffer, outBufferOffset);
            return len;
        }

        /**
         * Multiply value of this point by provided scalar using XY key agreement. Stores the result into this point.
         *
         * @param scalar value of scalar for multiplication
         */
        public void multXY(BigNat scalar) {
            byte[] pointBuffer = rm.POINT_ARRAY_A;

            short len = multXYKA(scalar, pointBuffer, (short) 0);
            setW(pointBuffer, (short) 0, len);
        }

        /**
         * Multiplies this point value with provided scalar and stores result into
         * provided array. No modification of this point is performed.
         * Native XY KeyAgreement engine is used.
         *
         * @param scalar          value of scalar for multiplication
         * @param outBuffer       output array for resulting value
         * @param outBufferOffset offset within output array
         * @return length of resulting value (in bytes)
         */
        public short multXYKA(BigNat scalar, byte[] outBuffer, short outBufferOffset) {
            byte[] pointBuffer = rm.POINT_ARRAY_B;

            scalar.prependZeros((short) curve.r.length, pointBuffer, (short) 0);
            curve.disposablePriv.setS(pointBuffer, (short) 0, (short) curve.r.length);
            rm.ecMultKA.init(curve.disposablePriv);

            short len = getW(pointBuffer, (short) 0);
            len = rm.ecMultKA.generateSecret(pointBuffer, (short) 0, len, outBuffer, outBufferOffset);
            return len;
        }

        /**
         * Multiply value of this point by provided scalar using X-only key agreement. Stores the result into this point.
         *
         * @param scalar value of scalar for multiplication
         */
        private void multX(BigNat scalar) {
            byte[] pointBuffer = rm.POINT_ARRAY_A;
            byte[] pointBuffer2 = rm.POINT_ARRAY_B;
            byte[] resultBuffer = rm.ARRAY_A;
            BigNat x = rm.EC_BN_B;
            BigNat ySq = rm.EC_BN_C;
            BigNat y = rm.EC_BN_D;
            BigNat lambda = rm.EC_BN_E;
            BigNat tmp = rm.EC_BN_F;
            BigNat denominator = rm.EC_BN_D;

            short len = multXKA(scalar, pointBuffer, (short) 0);
            x.fromByteArray(pointBuffer, (short) 0, len);

            // Solve for Y in Weierstrass equation: Y^2 = X^3 + XA + B = x(x^2+A)+B
            ySq.clone(x);
            ySq.modExp(ResourceManager.TWO, curve.pBN);
            ySq.modAdd(curve.aBN, curve.pBN);
            ySq.modMult(x, curve.pBN);
            ySq.modAdd(curve.bBN, curve.pBN);
            y.clone(ySq);
            y.modSqrt(curve.pBN);

            // Construct public key with <x, y>
            pointBuffer[0] = 0x04;
            x.prependZeros(curve.COORD_SIZE, pointBuffer, (short) 1);
            y.prependZeros(curve.COORD_SIZE, pointBuffer, (short) (1 + curve.COORD_SIZE));

            boolean negate;
            if (OperationSupport.getInstance().EC_HW_X_ECDSA) {
                getW(pointBuffer2, (short) 0);
                curve.disposablePriv.setG(pointBuffer2, (short) 0, curve.POINT_SIZE);
                curve.disposablePub.setG(pointBuffer2, (short) 0, curve.POINT_SIZE);

                setW(pointBuffer, (short) 0, curve.POINT_SIZE);

                // Check if <x, y> corresponds to the "secret" (i.e., our scalar)
                scalar.prependZeros((short) curve.r.length, resultBuffer, (short) 0);
                curve.disposablePriv.setS(resultBuffer, (short) 0, (short) curve.r.length);
                curve.disposablePub.setW(pointBuffer, (short) 0, curve.POINT_SIZE);
                negate = !SignVerifyECDSA(curve.disposablePriv, curve.disposablePub, rm.verifyEcdsa, resultBuffer);
            } else {
                // Check that (<x, y> + P)_x == ((scalar + 1)P)_x
                scalar.increment();
                len = multXKA(scalar, resultBuffer, (short) 0);
                x.fromByteArray(resultBuffer, (short) 0, len);
                scalar.decrement(); // keep the original

                getW(pointBuffer2, (short) 0);
                setW(pointBuffer, (short) 0, curve.POINT_SIZE);

                // y_1 - y_2
                lambda.fromByteArray(pointBuffer2, (short) (1 + curve.COORD_SIZE), curve.COORD_SIZE);
                tmp.fromByteArray(pointBuffer, (short) (1 + curve.COORD_SIZE), curve.COORD_SIZE);
                lambda.modSub(tmp, curve.pBN);

                // (x_1 - x_2)^-1
                denominator.fromByteArray(pointBuffer2, (short) 1, curve.COORD_SIZE);
                tmp.fromByteArray(pointBuffer, (short) 1, curve.COORD_SIZE);
                denominator.modSub(tmp, curve.pBN);
                denominator.modInv(curve.pBN);

                // λ = (y_1 - y_2)/(x_1 - x_2)
                lambda.modMult(denominator, curve.pBN);

                // x_3 = λ^2 - x_1 - x_2
                lambda.modSq(curve.pBN);
                tmp.fromByteArray(pointBuffer2, (short) 1, curve.COORD_SIZE);
                lambda.modSub(tmp, curve.pBN);
                tmp.fromByteArray(pointBuffer, (short) 1, curve.COORD_SIZE);
                lambda.modSub(tmp, curve.pBN);

                // If <x, y> + P != (scalar + 1)P, negate the point
                negate = !lambda.equals(x);
            }
            if (negate)
                negate();
        }

        /**
         * Multiplies this point value with provided scalar and stores result into
         * provided array. No modification of this point is performed.
         * Native X-only KeyAgreement engine is used.
         *
         * @param scalar          value of scalar for multiplication
         * @param outBuffer       output array for resulting value
         * @param outBufferOffset offset within output array
         * @return length of resulting value (in bytes)
         */
        private short multXKA(BigNat scalar, byte[] outBuffer, short outBufferOffset) {
            byte[] pointBuffer = rm.POINT_ARRAY_B;
            // NOTE: potential problem on real cards (j2e) - when small scalar is used (e.g., BigNat.TWO), operation sometimes freezes
            scalar.prependZeros((short) curve.r.length, pointBuffer, (short) 0);
            curve.disposablePriv.setS(pointBuffer, (short) 0, (short) curve.r.length);

            rm.ecMultKA.init(curve.disposablePriv);

            short len = getW(pointBuffer, (short) 0);
            rm.ecMultKA.generateSecret(pointBuffer, (short) 0, len, outBuffer, outBufferOffset);
            // Return always length of whole coordinate X instead of len - some real cards returns shorter value equal to SHA-1 output size although PLAIN results is filled into buffer (GD60)
            return curve.COORD_SIZE;
        }

        /**
         * Computes negation of this point.
         * The operation will dump point into uncompressed_point_arr, negate Y and restore back
         */
        public void negate() {
            byte[] pointBuffer = rm.POINT_ARRAY_A;
            BigNat y = rm.EC_BN_C;

            point.getW(pointBuffer, (short) 0);
            y.setSize(curve.COORD_SIZE);
            y.fromByteArray(pointBuffer, (short) (1 + curve.COORD_SIZE), curve.COORD_SIZE);
            y.modNegate(curve.pBN);
            y.prependZeros(curve.COORD_SIZE, pointBuffer, (short) (1 + curve.COORD_SIZE));
            setW(pointBuffer, (short) 0, curve.POINT_SIZE);
        }

        /**
         * Restore point from X coordinate. Stores one of the two results into this point.
         *
         * @param xCoord  byte array containing the X coordinate
         * @param xOffset offset in the byte array
         * @param xLen    length of the X coordinate
         */
        public void fromX(byte[] xCoord, short xOffset, short xLen) {
            BigNat x = rm.EC_BN_F;

            x.setSize(xLen);
            x.fromByteArray(xCoord, xOffset, xLen);
            fromX(x);
        }

        /**
         * Restore point from X coordinate. Stores one of the two results into this point.
         *
         * @param x the x coordinate
         */
        private void fromX(BigNat x) {
            BigNat ySq = rm.EC_BN_C;
            BigNat y = rm.EC_BN_D;
            byte[] pointBuffer = rm.POINT_ARRAY_A;

            //Y^2 = X^3 + XA + B = x(x^2+A)+B
            ySq.clone(x);
            ySq.modSq(curve.pBN);
            ySq.modAdd(curve.aBN, curve.pBN);
            ySq.modMult(x, curve.pBN);
            ySq.modAdd(curve.bBN, curve.pBN);
            y.clone(ySq);
            y.modSqrt(curve.pBN);

            // Construct public key with <x, y_1>
            pointBuffer[0] = 0x04;
            x.prependZeros(curve.COORD_SIZE, pointBuffer, (short) 1);
            y.prependZeros(curve.COORD_SIZE, pointBuffer, (short) (1 + curve.COORD_SIZE));
            setW(pointBuffer, (short) 0, curve.POINT_SIZE);
        }

        /**
         * Returns true if Y coordinate is even; false otherwise.
         *
         * @return true if Y coordinate is even; false otherwise
         */
        public boolean isYEven() {
            byte[] pointBuffer = rm.POINT_ARRAY_A;

            point.getW(pointBuffer, (short) 0);
            boolean result = pointBuffer[(short) (curve.POINT_SIZE - 1)] % 2 == 0;
            return result;
        }

        /**
         * Compares this and provided point for equality. The comparison is made using hash of both values to prevent leak of position of mismatching byte.
         *
         * @param other second point for comparison
         * @return true if both point are exactly equal (same length, same value), false otherwise
         */
        public boolean isEqual(ECPoint other) {
            if (length() != other.length()) {
                return false;
            }
            // The comparison is made with hash of point values instead of directly values.
            // This way, offset of first mismatching byte is not leaked via timing side-channel.
            // Additionally, only single array is required for storage of plain point values thus saving some RAM.
            byte[] pointBuffer = rm.POINT_ARRAY_A;
            byte[] hashBuffer = rm.HASH_ARRAY;

            short len = getW(pointBuffer, (short) 0);
            rm.hashEngine.doFinal(pointBuffer, (short) 0, len, hashBuffer, (short) 0);
            len = other.getW(pointBuffer, (short) 0);
            len = rm.hashEngine.doFinal(pointBuffer, (short) 0, len, pointBuffer, (short) 0);
            boolean bResult = Util.arrayCompare(hashBuffer, (short) 0, pointBuffer, (short) 0, len) == 0;

            return bResult;
        }

        static byte[] msg = {(byte) 0x01, (byte) 0x01, (byte) 0x02, (byte) 0x03};

        public static boolean SignVerifyECDSA(ECPrivateKey privateKey, ECPublicKey publicKey, Signature signEngine, byte[] tmpSignArray) {
            signEngine.init(privateKey, Signature.MODE_SIGN);
            short signLen = signEngine.sign(msg, (short) 0, (short) msg.length, tmpSignArray, (short) 0);
            signEngine.init(publicKey, Signature.MODE_VERIFY);
            return signEngine.verify(msg, (short) 0, (short) msg.length, tmpSignArray, (short) 0, signLen);
        }


        /**
         * Decode SEC1-encoded point and load it into this.
         *
         * @param point array containing SEC1-encoded point
         * @param offset offset within the output buffer
         * @param length length of the encoded point
         * @return true if the point was compressed; false otherwise
         */
        public boolean decode(byte[] point, short offset, short length) {
            if(length == (short) (1 + 2 * curve.COORD_SIZE) && point[offset] == 0x04) {
                setW(point, offset, length);
                return false;
            }
            if (length == (short) (1 + curve.COORD_SIZE)) {
                BigNat y = rm.EC_BN_C;
                BigNat x = rm.EC_BN_D;
                BigNat p = rm.EC_BN_E;
                byte[] pointBuffer = rm.POINT_ARRAY_A;

                x.fromByteArray(point, (short) (offset + 1), curve.COORD_SIZE);

                //Y^2 = X^3 + XA + B = x(x^2+A)+B
                y.clone(x);
                y.modSq(curve.pBN);
                y.modAdd(curve.aBN, curve.pBN);
                y.modMult(x, curve.pBN);
                y.modAdd(curve.bBN, curve.pBN);
                y.modSqrt(curve.pBN);

                pointBuffer[0] = 0x04;
                x.prependZeros(curve.COORD_SIZE, pointBuffer, (short) 1);

                boolean odd = y.isOdd();
                if ((!odd && point[offset] != (byte) 0x02) || (odd && point[offset] != (byte) 0x03)) {
                    p.clone(curve.pBN);
                    p.subtract(y);
                    p.prependZeros(curve.COORD_SIZE, pointBuffer, (short) (curve.COORD_SIZE + 1));
                } else {
                    y.prependZeros(curve.COORD_SIZE, pointBuffer, (short) (curve.COORD_SIZE + 1));
                }
                setW(pointBuffer, (short) 0, curve.POINT_SIZE);
                return true;
            }
            ISOException.throwIt(ReturnCodes.SW_ECPOINT_INVALID);
            return true; // unreachable
        }

        /**
         * Encode this point into the output buffer.
         *
         * @param output output buffer; MUST be able to store offset + uncompressed size bytes
         * @param offset offset within the output buffer
         * @param compressed output compressed point if true; uncompressed otherwise
         * @return length of output point
         */
        public short encode(byte[] output, short offset, boolean compressed) {
            getW(output, offset);

            if(compressed) {
                if(output[offset] == (byte) 0x04) {
                    output[offset] = (byte) (((output[(short) (offset + 2 * curve.COORD_SIZE)] & 0xff) % 2) == 0 ? 2 : 3);
                }
                return (short) (curve.COORD_SIZE + 1);
            }

            if(output[offset] != (byte) 0x04) {
                BigNat y = rm.EC_BN_C;
                BigNat x = rm.EC_BN_D;
                BigNat p = rm.EC_BN_E;
                x.fromByteArray(output, (short) (offset + 1), curve.COORD_SIZE);

                //Y^2 = X^3 + XA + B = x(x^2+A)+B
                y.clone(x);
                y.modSq(curve.pBN);
                y.modAdd(curve.aBN, curve.pBN);
                y.modMult(x, curve.pBN);
                y.modAdd(curve.bBN, curve.pBN);
                y.modSqrt(curve.pBN);
                boolean odd = y.isOdd();
                if ((!odd && output[offset] != (byte) 0x02) || (odd && output[offset] != (byte) 0x03)) {
                    p.clone(curve.pBN);
                    p.subtract(y);
                    p.prependZeros(curve.COORD_SIZE, output, (short) (offset + curve.COORD_SIZE + 1));
                } else {
                    y.prependZeros(curve.COORD_SIZE, output, (short) (offset + curve.COORD_SIZE + 1));
                }
                output[offset] = (byte) 0x04;
            }
            return (short) (2 * curve.COORD_SIZE + 1);
        }



        //
        // ECKey methods
        //
        public void setFieldFP(byte[] bytes, short s, short s1) throws CryptoException {
            point.setFieldFP(bytes, s, s1);
        }

        public void setFieldF2M(short s) throws CryptoException {
            point.setFieldF2M(s);
        }

        public void setFieldF2M(short s, short s1, short s2) throws CryptoException {
            point.setFieldF2M(s, s1, s2);
        }

        public void setA(byte[] bytes, short s, short s1) throws CryptoException {
            point.setA(bytes, s, s1);
        }

        public void setB(byte[] bytes, short s, short s1) throws CryptoException {
            point.setB(bytes, s, s1);
        }

        public void setG(byte[] bytes, short s, short s1) throws CryptoException {
            point.setG(bytes, s, s1);
        }

        public void setR(byte[] bytes, short s, short s1) throws CryptoException {
            point.setR(bytes, s, s1);
        }

        public void setK(short s) {
            point.setK(s);
        }

        public short getField(byte[] bytes, short s) throws CryptoException {
            return point.getField(bytes, s);
        }

        public short getA(byte[] bytes, short s) throws CryptoException {
            return point.getA(bytes, s);
        }

        public short getB(byte[] bytes, short s) throws CryptoException {
            return point.getB(bytes, s);
        }

        public short getG(byte[] bytes, short s) throws CryptoException {
            return point.getG(bytes, s);
        }

        public short getR(byte[] bytes, short s) throws CryptoException {
            return point.getR(bytes, s);
        }

        public short getK() throws CryptoException {
            return point.getK();
        }
    }

    /**
     * The control point for unified allocation of arrays and objects with customable
     * specification of allocator type (RAM/EEPROM) for particular array. Allows for
     * quick personalization and optimization of memory use when compiling for cards
     * with more/less available memory.
     *
    * @author Petr Svenda
     */
    public static class ObjectAllocator {
        short allocatedInRAM = 0;
        short allocatedInEEPROM = 0;
        byte[] ALLOCATOR_TYPE_ARRAY;

        public static final byte ARRAY_A = 0;
        public static final byte ARRAY_B = 1;
        public static final byte BN_WORD = 2;
        public static final byte BN_A = 3;
        public static final byte BN_B = 4;
        public static final byte BN_C = 5;
        public static final byte BN_D = 6;
        public static final byte BN_E = 7;
        public static final byte BN_F = 8;
        public static final byte BN_G = 9;

        public static final byte EC_BN_A = 10;
        public static final byte EC_BN_B = 11;
        public static final byte EC_BN_C = 12;
        public static final byte EC_BN_D = 13;
        public static final byte EC_BN_E = 14;
        public static final byte EC_BN_F = 15;
        public static final byte POINT_ARRAY_A = 16;
        public static final byte POINT_ARRAY_B = 17;
        public static final byte HASH_ARRAY = 18;

        public static final short ALLOCATOR_TYPE_ARRAY_LENGTH = (short) (HASH_ARRAY + 1);

        /**
         * Creates new allocator control object, resets performance counters
         */
        public ObjectAllocator() {
            ALLOCATOR_TYPE_ARRAY = new byte[ALLOCATOR_TYPE_ARRAY_LENGTH];
            setAllAllocatorsRAM();
            resetAllocatorCounters();
        }
        /**
         * All type of allocator for all object as EEPROM
         */
        public final void setAllAllocatorsEEPROM() {
            Util.arrayFillNonAtomic(ALLOCATOR_TYPE_ARRAY, (short) 0, (short) ALLOCATOR_TYPE_ARRAY.length, JCSystem.MEMORY_TYPE_PERSISTENT);
        }
        /**
         * All type of allocator for all object as RAM
         */
        public void setAllAllocatorsRAM() {
            Util.arrayFillNonAtomic(ALLOCATOR_TYPE_ARRAY, (short) 0, (short) ALLOCATOR_TYPE_ARRAY.length, JCSystem.MEMORY_TYPE_TRANSIENT_RESET);
        }
        /**
         * All type of allocator for selected object as RAM (faster), rest EEPROM (saving RAM)
         * The current settings is heuristically obtained from measurements of performance of Bignat and ECPoint operations
         */
        public void setAllocatorsTradeoff() {
            // Set initial allocators into EEPROM
            setAllAllocatorsEEPROM();

            // Put only the most perfromance relevant ones into RAM
            ALLOCATOR_TYPE_ARRAY[ARRAY_A] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
            ALLOCATOR_TYPE_ARRAY[ARRAY_B] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
            ALLOCATOR_TYPE_ARRAY[BN_WORD] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
            ALLOCATOR_TYPE_ARRAY[BN_A] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
            ALLOCATOR_TYPE_ARRAY[BN_B] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
            ALLOCATOR_TYPE_ARRAY[BN_C] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
            ALLOCATOR_TYPE_ARRAY[BN_D] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
            ALLOCATOR_TYPE_ARRAY[BN_E] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
            ALLOCATOR_TYPE_ARRAY[BN_F] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
            ALLOCATOR_TYPE_ARRAY[BN_G] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
            ALLOCATOR_TYPE_ARRAY[EC_BN_B] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
            ALLOCATOR_TYPE_ARRAY[EC_BN_C] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
            ALLOCATOR_TYPE_ARRAY[POINT_ARRAY_A] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
            ALLOCATOR_TYPE_ARRAY[POINT_ARRAY_B] = JCSystem.MEMORY_TYPE_TRANSIENT_RESET;
        }

        /**
         * Allocates new byte[] array with provided length either in RAM or EEPROM based on an allocator type.
         * Method updates internal counters of bytes allocated with specific allocator. Use {@code getAllocatedInRAM()}
         * or {@code getAllocatedInEEPROM} for counters readout.
         * @param length    length of array
         * @param allocatorType type of allocator
         * @return allocated array
         */
        public byte[] allocateByteArray(short length, byte allocatorType) {
            switch (allocatorType) {
                case JCSystem.MEMORY_TYPE_PERSISTENT:
                    allocatedInEEPROM += length;
                    return new byte[length];
                case JCSystem.MEMORY_TYPE_TRANSIENT_RESET:
                    allocatedInRAM += length;
                    return JCSystem.makeTransientByteArray(length, JCSystem.CLEAR_ON_RESET);
                case JCSystem.MEMORY_TYPE_TRANSIENT_DESELECT:
                    allocatedInRAM += length;
                    return JCSystem.makeTransientByteArray(length, JCSystem.CLEAR_ON_DESELECT);
            }
            return null;
        }

        /**
         * Allocates new short[] array with provided length either in RAM or EEPROM based on an allocator type.
         * Method updates internal counters of bytes allocated with specific allocator. Use {@code getAllocatedInRAM()}
         * or {@code getAllocatedInEEPROM} for counters readout.
         * @param length length of array
         * @param allocatorType type of allocator
         * @return allocated array
         */
        public short[] allocateShortArray(short length, byte allocatorType) {
            switch (allocatorType) {
                case JCSystem.MEMORY_TYPE_PERSISTENT:
                    allocatedInEEPROM += (short) (2 * length);
                    return new short[length];
                case JCSystem.MEMORY_TYPE_TRANSIENT_RESET:
                    allocatedInRAM += (short) (2 * length);
                    return JCSystem.makeTransientShortArray(length, JCSystem.CLEAR_ON_RESET);
                case JCSystem.MEMORY_TYPE_TRANSIENT_DESELECT:
                    allocatedInRAM += (short) (2 * length);
                    return JCSystem.makeTransientShortArray(length, JCSystem.CLEAR_ON_DESELECT);
            }
            return null;
        }

        /**
         * Returns pre-set allocator type for provided object identified by unique objectAllocatorID
         * @param objectAllocatorID unique id of target object
         * @return allocator type
         */
        public byte getAllocatorType(short objectAllocatorID) {
            if (objectAllocatorID >= 0 && objectAllocatorID <= (short) ALLOCATOR_TYPE_ARRAY.length) {
                return ALLOCATOR_TYPE_ARRAY[objectAllocatorID];
            } else {
                ISOException.throwIt(ReturnCodes.SW_ALLOCATOR_INVALIDOBJID);
                return -1;
            }
        }

        /**
         * Returns number of bytes allocated in RAM via {@code allocateByteArray()} since last reset of counters.
         * @return number of bytes allocated in RAM via this control object
         */
        public short getAllocatedInRAM() {
            return allocatedInRAM;
        }
        /**
         * Returns number of bytes allocated in EEPROM via {@code allocateByteArray()}
         * since last reset of counters.
         *
         * @return number of bytes allocated in EEPROM via this control object
         */
        public short getAllocatedInEEPROM() {
            return allocatedInEEPROM;
        }
        /**
         * Resets counters of allocated bytes in RAM and EEPROM
         */
        public final void resetAllocatorCounters() {
            allocatedInRAM = 0;
            allocatedInEEPROM = 0;
        }
    }

    /**
     * OperationSupport class
     *
     * @author Antonin Dufka
     */
    public static class OperationSupport {
        private static OperationSupport instance;

        public static final short SIMULATOR = 0x0000;   // jCardSim.org simulator
        public static final short JCOP21 = 0x0001;      // NXP J2E145G
        public static final short JCOP3_P60 = 0x0002;   // NXP JCOP3 J3H145 P60
        public static final short JCOP4_P71 = 0x0003;   // NXP JCOP4 J3Rxxx P71
        public static final short GD60 = 0x0004;        // G+D Sm@rtcafe 6.0
        public static final short GD70 = 0x0005;        // G+D Sm@rtcafe 7.0
        public static final short SECORA = 0x0006;      // Infineon Secora ID S

        public short MIN_RSA_BIT_LENGTH = 512;
        public boolean DEFERRED_INITIALIZATION = false;

        public boolean RSA_EXP = true;
        public boolean RSA_SQ = true;
        public boolean RSA_PUB = false;
        public boolean RSA_CHECK_ONE = false;
        public boolean RSA_CHECK_EXP_ONE = false;
        public boolean RSA_KEY_REFRESH = false;
        public boolean RSA_PREPEND_ZEROS = false;
        public boolean RSA_EXTRA_MOD = false;
        public boolean RSA_RESIZE_MOD = true;
        public boolean RSA_APPEND_MOD = false;

        public boolean EC_HW_XY = false;
        public boolean EC_HW_X = true;
        public boolean EC_HW_ADD = false;
        public boolean EC_SW_DOUBLE = false;
        public boolean EC_PRECISE_BITLENGTH = true;
        public boolean EC_SET_COFACTOR = false;
        public boolean EC_GEN = true;
        public boolean EC_HW_X_ECDSA = true;

        private OperationSupport() {
        }

        public static OperationSupport getInstance() {
            if (OperationSupport.instance == null) OperationSupport.instance = new OperationSupport();
            return OperationSupport.instance;
        }

        public void setCard(short card_identifier) {
            switch (card_identifier) {
                case SIMULATOR:
                    RSA_KEY_REFRESH = true;
                    RSA_PREPEND_ZEROS = true;
                    RSA_RESIZE_MOD = false;
                    EC_HW_XY = true;
                    EC_HW_ADD = true;
                    EC_SW_DOUBLE = true;
                    EC_PRECISE_BITLENGTH = false;
                    break;
                case JCOP21:
                    RSA_PUB = true;
                    RSA_EXTRA_MOD = true;
                    RSA_APPEND_MOD = true;
                    EC_SW_DOUBLE = true;
                    EC_GEN = false; // required by Wei25519
                    EC_HW_X_ECDSA = false; // required by Wei25519
                    break;
                case GD60:
                    RSA_PUB = true;
                    RSA_EXTRA_MOD = true;
                    RSA_APPEND_MOD = true;
                    break;
                case GD70:
                    RSA_PUB = true;
                    RSA_CHECK_ONE = true;
                    RSA_EXTRA_MOD = true;
                    RSA_APPEND_MOD = true;
                    break;
                case JCOP3_P60:
                    DEFERRED_INITIALIZATION = true;
                    RSA_PUB = true;
                    EC_HW_XY = true;
                    EC_HW_ADD = true;
                    break;
                case JCOP4_P71:
                    DEFERRED_INITIALIZATION = true;
                    EC_HW_XY = true;
                    EC_HW_ADD = true;
                    break;
                case SECORA:
                    MIN_RSA_BIT_LENGTH = 1024;
                    RSA_SQ = false;
                    RSA_CHECK_EXP_ONE = true;
                    RSA_PUB = true;
                    RSA_EXTRA_MOD = true;
                    RSA_APPEND_MOD = true;
                    EC_HW_XY = true;
                    EC_PRECISE_BITLENGTH = false;
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * @author Petr Svenda
     */
    public static class ResourceManager {
        public ObjectAllocator memAlloc;

        RandomData rng;
        MessageDigest hashEngine;
        KeyAgreement ecMultKA;
        KeyAgreement ecAddKA;
        Signature verifyEcdsa;
        Cipher sqCiph, modSqCiph, expCiph;
        RSAPublicKey sqPub, modSqPub, expPub;
        RSAPrivateKey sqPriv, modSqPriv, expPriv;
        BigNat fixedMod;

        byte[] ARRAY_A, ARRAY_B, POINT_ARRAY_A, POINT_ARRAY_B, HASH_ARRAY;

        static byte[] CONST_ONE = {0x01};
        static byte[] CONST_TWO = {0x02};

        BigNat BN_WORD;
        BigNat BN_A, BN_B, BN_C, BN_D, BN_E, BN_F, BN_G;
        BigNat EC_BN_A, EC_BN_B, EC_BN_C, EC_BN_D, EC_BN_E, EC_BN_F;
        public static BigNat TWO, THREE, ONE_COORD;

        public final short MAX_EXP_BIT_LENGTH;
        public final short MAX_EXP_LENGTH;
        public final short MAX_SQ_BIT_LENGTH;
        public final short MAX_SQ_LENGTH;
        public final short MAX_BIGNAT_SIZE;
        public final short MAX_POINT_SIZE;
        public final short MAX_COORD_SIZE;

        public ResourceManager(short maxEcLength) {
            short min = OperationSupport.getInstance().MIN_RSA_BIT_LENGTH;
            if (maxEcLength <= (short) 256) {
                MAX_EXP_BIT_LENGTH = (short) 512 < min ? min : (short) 512;
                MAX_SQ_BIT_LENGTH = (short) 768 < min ? min : (short) 768;
                MAX_POINT_SIZE = (short) 64;
            }
            else if (maxEcLength <= (short) 384) {
                MAX_EXP_BIT_LENGTH = (short) 768 < min ? min : (short) 768;
                MAX_SQ_BIT_LENGTH = (short) 1024 < min ? min : (short) 1024;
                MAX_POINT_SIZE = (short) 96;
            }
            else if (maxEcLength <= (short) 512) {
                MAX_EXP_BIT_LENGTH = (short) 1024 < min ? min : (short) 1024;
                MAX_SQ_BIT_LENGTH = (short) 1280 < min ? min : (short) 1280;
                MAX_POINT_SIZE = (short) 128;
            }
            else {
                MAX_EXP_BIT_LENGTH = (short) 0;
                MAX_SQ_BIT_LENGTH = (short) 0;
                MAX_POINT_SIZE = (short) 0;
                ISOException.throwIt(ReturnCodes.SW_ECPOINT_INVALIDLENGTH);
            }
            MAX_SQ_LENGTH = (short) (MAX_SQ_BIT_LENGTH / 8);
            MAX_EXP_LENGTH = (short) (MAX_EXP_BIT_LENGTH / 8);
            MAX_BIGNAT_SIZE = (short) (MAX_EXP_BIT_LENGTH / 8);
            MAX_COORD_SIZE = (short) (MAX_POINT_SIZE / 2);

            memAlloc = new ObjectAllocator();
            memAlloc.setAllAllocatorsRAM();
            // if required, memory for helper objects and arrays can be in persistent memory to save RAM (or some tradeoff)
            // ObjectAllocator.setAllAllocatorsEEPROM();
            // ObjectAllocator.setAllocatorsTradeoff();


            ARRAY_A = memAlloc.allocateByteArray(MAX_SQ_LENGTH, memAlloc.getAllocatorType(ObjectAllocator.ARRAY_A));
            ARRAY_B = memAlloc.allocateByteArray(MAX_SQ_LENGTH, memAlloc.getAllocatorType(ObjectAllocator.ARRAY_B));
            POINT_ARRAY_A = memAlloc.allocateByteArray((short) (MAX_POINT_SIZE + 1), memAlloc.getAllocatorType(ObjectAllocator.POINT_ARRAY_A));
            POINT_ARRAY_B = memAlloc.allocateByteArray((short) (MAX_POINT_SIZE + 1), memAlloc.getAllocatorType(ObjectAllocator.POINT_ARRAY_B));
            hashEngine = MessageDigest.getInstance(MessageDigest.ALG_SHA_256, false);
            HASH_ARRAY = memAlloc.allocateByteArray(hashEngine.getLength(), memAlloc.getAllocatorType(ObjectAllocator.HASH_ARRAY));

            BN_WORD = new BigNat((short) 2, memAlloc.getAllocatorType(ObjectAllocator.BN_WORD), this);

            BN_A = new BigNat(MAX_BIGNAT_SIZE, memAlloc.getAllocatorType(ObjectAllocator.BN_A), this);
            BN_B = new BigNat(MAX_BIGNAT_SIZE, memAlloc.getAllocatorType(ObjectAllocator.BN_B), this);
            BN_C = new BigNat(MAX_BIGNAT_SIZE, memAlloc.getAllocatorType(ObjectAllocator.BN_C), this);
            BN_D = new BigNat(MAX_BIGNAT_SIZE, memAlloc.getAllocatorType(ObjectAllocator.BN_D), this);
            BN_E = new BigNat(MAX_BIGNAT_SIZE, memAlloc.getAllocatorType(ObjectAllocator.BN_E), this);
            BN_F = new BigNat(MAX_SQ_LENGTH, memAlloc.getAllocatorType(ObjectAllocator.BN_F), this);
            BN_G = new BigNat(MAX_SQ_LENGTH, memAlloc.getAllocatorType(ObjectAllocator.BN_G), this);

            EC_BN_A = new BigNat(MAX_POINT_SIZE, memAlloc.getAllocatorType(ObjectAllocator.EC_BN_A), this);
            EC_BN_B = new BigNat(MAX_COORD_SIZE, memAlloc.getAllocatorType(ObjectAllocator.EC_BN_B), this);
            EC_BN_C = new BigNat(MAX_COORD_SIZE, memAlloc.getAllocatorType(ObjectAllocator.EC_BN_C), this);
            EC_BN_D = new BigNat(MAX_COORD_SIZE, memAlloc.getAllocatorType(ObjectAllocator.EC_BN_D), this);
            EC_BN_E = new BigNat(MAX_COORD_SIZE, memAlloc.getAllocatorType(ObjectAllocator.EC_BN_E), this);
            EC_BN_F = new BigNat(MAX_COORD_SIZE, memAlloc.getAllocatorType(ObjectAllocator.EC_BN_F), this);

            // Allocate BN constants always in EEPROM (only reading)
            TWO = new BigNat((short) 1, JCSystem.MEMORY_TYPE_PERSISTENT, this);
            TWO.setValue((byte) 2);
            THREE = new BigNat((short) 1, JCSystem.MEMORY_TYPE_PERSISTENT, this);
            THREE.setValue((byte) 3);
            ONE_COORD = new BigNat(MAX_COORD_SIZE, JCSystem.MEMORY_TYPE_PERSISTENT, this);
            ONE_COORD.setValue((byte) 1);
            // ECC Helpers
            if (OperationSupport.getInstance().EC_HW_XY) {
                // ecMultKA = KeyAgreement.getInstance(KeyAgreement.ALG_EC_SVDP_DH_PLAIN_XY, false);
                ecMultKA = KeyAgreement.getInstance((byte) 6, false);
            } else if (OperationSupport.getInstance().EC_HW_X) {
                // ecMultKA = KeyAgreement.getInstance(KeyAgreement.ALG_EC_SVDP_DH_PLAIN, false);
                ecMultKA = KeyAgreement.getInstance((byte) 3, false);
            }
            // verifyEcdsa = Signature.getInstance(Signature.ALG_ECDSA_SHA_256, false);
            verifyEcdsa = Signature.getInstance((byte) 33, false);
            if (OperationSupport.getInstance().EC_HW_ADD) {
                // ecAddKA = KeyAgreement.getInstance(KeyAgreement.ALG_EC_PACE_GM, false);
                ecAddKA = KeyAgreement.getInstance((byte) 5, false);
            }

            // RSA Sq Helpers
            if (OperationSupport.getInstance().RSA_SQ) {
                Util.arrayFillNonAtomic(ARRAY_A, (short) 0, MAX_SQ_LENGTH, (byte) 0xff);
                sqCiph = Cipher.getInstance(Cipher.ALG_RSA_NOPAD, false);
                modSqCiph = Cipher.getInstance(Cipher.ALG_RSA_NOPAD, false);
                if (OperationSupport.getInstance().RSA_PUB) {
                    modSqPub = (RSAPublicKey) KeyBuilder.buildKey(KeyBuilder.TYPE_RSA_PUBLIC, MAX_EXP_BIT_LENGTH, false);
                    sqPub = (RSAPublicKey) KeyBuilder.buildKey(KeyBuilder.TYPE_RSA_PUBLIC, MAX_SQ_BIT_LENGTH, false);
                    sqPub.setExponent(CONST_TWO, (short) 0, (short) CONST_TWO.length);
                    sqPub.setModulus(ARRAY_A, (short) 0, MAX_SQ_LENGTH);
                    sqCiph.init(sqPub, Cipher.MODE_ENCRYPT);
                } else {
                    modSqPriv = (RSAPrivateKey) KeyBuilder.buildKey(KeyBuilder.TYPE_RSA_PRIVATE, MAX_EXP_BIT_LENGTH, false);
                    sqPriv = (RSAPrivateKey) KeyBuilder.buildKey(KeyBuilder.TYPE_RSA_PRIVATE, MAX_SQ_BIT_LENGTH, false);
                    sqPriv.setExponent(CONST_TWO, (short) 0, (short) CONST_TWO.length);
                    sqPriv.setModulus(ARRAY_A, (short) 0, MAX_SQ_LENGTH);
                    sqCiph.init(sqPriv, Cipher.MODE_DECRYPT);
                }
            }

            // RSA Exp Helpers
            expPub = (RSAPublicKey) KeyBuilder.buildKey(KeyBuilder.TYPE_RSA_PUBLIC, MAX_EXP_BIT_LENGTH, false);
            expPriv = (RSAPrivateKey) KeyBuilder.buildKey(KeyBuilder.TYPE_RSA_PRIVATE, MAX_EXP_BIT_LENGTH, false);
            expCiph = Cipher.getInstance(Cipher.ALG_RSA_NOPAD, false);

            rng = RandomData.getInstance(RandomData.ALG_SECURE_RANDOM);
        }

        /**
         * Preloads modSq engine with a given mod. Can increase performance when the same mod is used repeatedly. The
         * provided mod is assumed to be fixed.
         */
        public void fixModSqMod(BigNat mod) {
            if (!OperationSupport.getInstance().RSA_SQ) {
                return; // modSq engine is not used
            }
            fixedMod = mod;
            if (mod == null) {
                return;
            }
            BigNat tmpMod = BN_F;
            byte[] tmpBuffer = ARRAY_A;

            tmpMod.setSize(MAX_EXP_LENGTH);
            if (OperationSupport.getInstance().RSA_PUB) {
                if (OperationSupport.getInstance().RSA_KEY_REFRESH) {
                    modSqPub = (RSAPublicKey) KeyBuilder.buildKey(KeyBuilder.TYPE_RSA_PUBLIC, MAX_EXP_BIT_LENGTH, false);
                }
                modSqPub.setExponent(ResourceManager.CONST_TWO, (short) 0, (short) ResourceManager.CONST_TWO.length);
                if (OperationSupport.getInstance().RSA_RESIZE_MOD) {
                    if (OperationSupport.getInstance().RSA_APPEND_MOD) {
                        mod.appendZeros(MAX_EXP_LENGTH, tmpBuffer, (short) 0);
                    } else {
                        mod.prependZeros(MAX_EXP_LENGTH, tmpBuffer, (short) 0);
                    }
                    modSqPub.setModulus(tmpBuffer, (short) 0, MAX_EXP_LENGTH);
                } else {
                    short modLength = mod.copyToByteArray(tmpBuffer, (short) 0);
                    modSqPub.setModulus(tmpBuffer, (short) 0, modLength);
                }
                modSqCiph.init(modSqPub, Cipher.MODE_DECRYPT);
            } else {
                if (OperationSupport.getInstance().RSA_KEY_REFRESH) {
                    modSqPriv = (RSAPrivateKey) KeyBuilder.buildKey(KeyBuilder.TYPE_RSA_PRIVATE, MAX_EXP_BIT_LENGTH, false);
                }
                modSqPriv.setExponent(ResourceManager.CONST_TWO, (short) 0, (short) ResourceManager.CONST_TWO.length);
                if (OperationSupport.getInstance().RSA_RESIZE_MOD) {
                    if (OperationSupport.getInstance().RSA_APPEND_MOD) {
                        mod.appendZeros(MAX_EXP_LENGTH, tmpBuffer, (short) 0);
                    } else {
                        mod.prependZeros(MAX_EXP_LENGTH, tmpBuffer, (short) 0);

                    }
                    modSqPriv.setModulus(tmpBuffer, (short) 0, MAX_EXP_LENGTH);
                } else {
                    short modLength = mod.copyToByteArray(tmpBuffer, (short) 0);
                    modSqPriv.setModulus(tmpBuffer, (short) 0, modLength);
                }
                modSqCiph.init(modSqPriv, Cipher.MODE_DECRYPT);
            }
        }

        /**
         * Erase all values stored in helper objects
         */
        void erase() {
            BN_WORD.erase();

            BN_A.erase();
            BN_B.erase();
            BN_C.erase();
            BN_D.erase();
            BN_E.erase();
            BN_F.erase();
            BN_G.erase();

            EC_BN_A.erase();
            EC_BN_B.erase();
            EC_BN_C.erase();
            EC_BN_D.erase();
            EC_BN_E.erase();
            EC_BN_F.erase();

            Util.arrayFillNonAtomic(ARRAY_A, (short) 0, (short) ARRAY_A.length, (byte) 0);
            Util.arrayFillNonAtomic(ARRAY_B, (short) 0, (short) ARRAY_B.length, (byte) 0);
            Util.arrayFillNonAtomic(POINT_ARRAY_A, (short) 0, (short) POINT_ARRAY_A.length, (byte) 0);
        }

    }

    /**
     *
    * @author Vasilios Mavroudis and Petr Svenda
     */
    public static class ReturnCodes {
        // Custom error response codes
        public static final short SW_BIGNAT_RESIZETOLONGER          = (short) 0x7000;
        public static final short SW_BIGNAT_REALLOCATIONNOTALLOWED  = (short) 0x7001;
        public static final short SW_BIGNAT_MODULOTOOLARGE          = (short) 0x7002;
        public static final short SW_BIGNAT_INVALIDCOPYOTHER        = (short) 0x7003;
        public static final short SW_BIGNAT_INVALIDRESIZE           = (short) 0x7004;
        public static final short SW_BIGNAT_INVALIDMULT             = (short) 0x7005;
        public static final short SW_BIGNAT_INVALIDSQ               = (short) 0x7006;
        public static final short SW_LOCK_ALREADYLOCKED             = (short) 0x7010;
        public static final short SW_LOCK_NOTLOCKED                 = (short) 0x7011;
        public static final short SW_LOCK_OBJECT_NOT_FOUND          = (short) 0x7012;
        public static final short SW_LOCK_NOFREESLOT                = (short) 0x7013;
        public static final short SW_LOCK_OBJECT_MISMATCH           = (short) 0x7014;
        public static final short SW_ECPOINT_INVALIDLENGTH          = (short) 0x7020;
        public static final short SW_ECPOINT_UNEXPECTED_KA_LEN      = (short) 0x7021;
        public static final short SW_ECPOINT_INVALID                = (short) 0x7022;
        public static final short SW_ALLOCATOR_INVALIDOBJID         = (short) 0x7030;
        public static final short SW_OPERATION_NOT_SUPPORTED        = (short) 0x7040;
    }

    public static class Wei25519 {
        public final static short k = 8;

        public final static byte[] p = {
                (byte) 0x7f, (byte) 0xff, (byte) 0xff, (byte) 0xff,
                (byte) 0xff, (byte) 0xff, (byte) 0xff, (byte) 0xff,
                (byte) 0xff, (byte) 0xff, (byte) 0xff, (byte) 0xff,
                (byte) 0xff, (byte) 0xff, (byte) 0xff, (byte) 0xff,
                (byte) 0xff, (byte) 0xff, (byte) 0xff, (byte) 0xff,
                (byte) 0xff, (byte) 0xff, (byte) 0xff, (byte) 0xff,
                (byte) 0xff, (byte) 0xff, (byte) 0xff, (byte) 0xff,
                (byte) 0xff, (byte) 0xff, (byte) 0xff, (byte) 0xed
        };


        public final static byte[] a = {
                (byte) 0x2a, (byte) 0xaa, (byte) 0xaa, (byte) 0xaa,
                (byte) 0xaa, (byte) 0xaa, (byte) 0xaa, (byte) 0xaa,
                (byte) 0xaa, (byte) 0xaa, (byte) 0xaa, (byte) 0xaa,
                (byte) 0xaa, (byte) 0xaa, (byte) 0xaa, (byte) 0xaa,
                (byte) 0xaa, (byte) 0xaa, (byte) 0xaa, (byte) 0xaa,
                (byte) 0xaa, (byte) 0xaa, (byte) 0xaa, (byte) 0xaa,
                (byte) 0xaa, (byte) 0xaa, (byte) 0xaa, (byte) 0x98,
                (byte) 0x49, (byte) 0x14, (byte) 0xa1, (byte) 0x44
        };

        public final static byte[] b = {
                (byte) 0x7b, (byte) 0x42, (byte) 0x5e, (byte) 0xd0,
                (byte) 0x97, (byte) 0xb4, (byte) 0x25, (byte) 0xed,
                (byte) 0x09, (byte) 0x7b, (byte) 0x42, (byte) 0x5e,
                (byte) 0xd0, (byte) 0x97, (byte) 0xb4, (byte) 0x25,
                (byte) 0xed, (byte) 0x09, (byte) 0x7b, (byte) 0x42,
                (byte) 0x5e, (byte) 0xd0, (byte) 0x97, (byte) 0xb4,
                (byte) 0x26, (byte) 0x0b, (byte) 0x5e, (byte) 0x9c,
                (byte) 0x77, (byte) 0x10, (byte) 0xc8, (byte) 0x64
        };

        public final static byte[] G = {
                (byte) 0x04,

                (byte) 0x2a, (byte) 0xaa, (byte) 0xaa, (byte) 0xaa,
                (byte) 0xaa, (byte) 0xaa, (byte) 0xaa, (byte) 0xaa,
                (byte) 0xaa, (byte) 0xaa, (byte) 0xaa, (byte) 0xaa,
                (byte) 0xaa, (byte) 0xaa, (byte) 0xaa, (byte) 0xaa,
                (byte) 0xaa, (byte) 0xaa, (byte) 0xaa, (byte) 0xaa,
                (byte) 0xaa, (byte) 0xaa, (byte) 0xaa, (byte) 0xaa,
                (byte) 0xaa, (byte) 0xaa, (byte) 0xaa, (byte) 0xaa,
                (byte) 0xaa, (byte) 0xad, (byte) 0x24, (byte) 0x5a,

                (byte) 0x20, (byte) 0xae, (byte) 0x19, (byte) 0xa1,
                (byte) 0xb8, (byte) 0xa0, (byte) 0x86, (byte) 0xb4,
                (byte) 0xe0, (byte) 0x1e, (byte) 0xdd, (byte) 0x2c,
                (byte) 0x77, (byte) 0x48, (byte) 0xd1, (byte) 0x4c,
                (byte) 0x92, (byte) 0x3d, (byte) 0x4d, (byte) 0x7e,
                (byte) 0x6d, (byte) 0x7c, (byte) 0x61, (byte) 0xb2,
                (byte) 0x29, (byte) 0xe9, (byte) 0xc5, (byte) 0xa2,
                (byte) 0x7e, (byte) 0xce, (byte) 0xd3, (byte) 0xd9
        };

        public final static byte[] r = {
                (byte) 0x10, (byte) 0x00, (byte) 0x00, (byte) 0x00,
                (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00,
                (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00,
                (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00,
                (byte) 0x14, (byte) 0xde, (byte) 0xf9, (byte) 0xde,
                (byte) 0xa2, (byte) 0xf7, (byte) 0x9c, (byte) 0xd6,
                (byte) 0x58, (byte) 0x12, (byte) 0x63, (byte) 0x1a,
                (byte) 0x5c, (byte) 0xf5, (byte) 0xd3, (byte) 0xed
        };
    }
}
