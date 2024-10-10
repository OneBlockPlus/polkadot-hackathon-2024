# Keyring Applets

Hardware wallet running on Javacard 3.0.4+ (see implementation notes)

It supports among others
- key generation, derivation and signing
- BIP32, BIP39, BIP44, SLIP-10 for ED25519

Communication with the card happens through a simple APDU interface, together with a Secure Channel guaranteeing confidentiality, authentication and integrity of all commands. It supports both NFC and ISO7816 physical interfaces, meaning that it is compatible with any Android phone equipped with NFC, and all USB Smartcard readers.


# How to build the project?

The project is built using Gradle with the [Fidesmo Javacard Gradle plugin](https://github.com/fidesmo/gradle-javacard).
You can set the JavaCard HOME not only through the environment but also creating a gradle.properties file with the 
property "com.fidesmo.gradle.javacard.home" set to the correct path.

Testing is done with JUnit and performed either on a real card or on [jCardSim](https://github.com/status-im/jcardsim). 
Although the tests are comprehensive, debugging on the real card is not easy because raw APDUs are not shown in the test 
log and there is no way to set breakpoints in the applet. 

In order to test with the simulator with an IDE, you need to pass these additional parameters to the JVM

```-noverify -Dso.keyring.card.test.target=simulator```

## Compilation
1. Download and install the JavaCard 3.0.4 SDK from [Oracle](http://www.oracle.com/technetwork/java/javasebusiness/downloads/java-archive-downloads-javame-419430.html#java_card_kit-classic-3_0_4-rr-bin-do)
2. Clone the Github repo of [jCardSim](https://github.com/status-im/jcardsim)
3. Create a gradle.properties (see below for an example)
4. Run `./gradlew convertJavacard`

## Installation
1. Follow all steps from the Compilation phase (except the last one)
2. Disconnect all card reader terminals from the system, except the one with the card where you want to install the applet
3. Run `./gradlew install`

## Testing
1. Follow all steps from the Installation phase (except the last one)
2. Make sure your JRE has the [JCE Unlimited Strength Jurisdiction Policy Files](http://www.oracle.com/technetwork/java/javase/downloads/jce8-download-2133166.html)
   installed. For more information check [here](https://stackoverflow.com/questions/41580489/how-to-install-unlimited-strength-jurisdiction-policy-files).
3. Run `./gradlew test`

# What kind of smartcards can I use? 

* The applet requires JavaCard 3.0.4 (with the addition of KeyAgreement.ALG_EC_SVDP_DH_PLAIN_XY
) or later.
* The class byte of the APDU is not checked since there are no conflicting INS code.
* The GlobalPlatform ISD keys are set to c212e073ff8b4bbfaff4de8ab655221f.

The algorithms the card must support are at least:
* Cipher.ALG_AES_BLOCK_128_CBC_NOPAD
* Cipher.ALG_AES_CBC_ISO9797_M2
* KeyAgreement.ALG_EC_SVDP_DH_PLAIN
* KeyAgreement.ALG_EC_SVDP_DH_PLAIN_XY
* KeyPair.ALG_EC_FP (generation of 256-bit keys)
* MessageDigest.ALG_SHA_256
* MessageDigest.ALG_SHA_512
* RandomData.ALG_SECURE_RANDOM
* Signature.ALG_AES_MAC_128_NOPAD
* Signature.ALG_ECDSA_SHA_256

Best performance is achieved if the card supports:
* Signature.ALG_HMAC_SHA_512
