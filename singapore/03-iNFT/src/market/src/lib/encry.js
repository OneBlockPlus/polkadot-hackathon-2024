import CryptoJS from "crypto-js";

let key = null;
let iv = null;

const self = {
  auto: (md5) => {
    self.setKey(md5.substring(0, 16));
    self.setIV(md5.substring(16, 32));
    return true;
  },
  setKey: (salt) => {
    key = CryptoJS.enc.Utf8.parse(salt);
  },
  setIV: (salt) => {
    iv = CryptoJS.enc.Utf8.parse(salt);
  },
  decrypt: (word) => {
    try {
      const encryptedHexStr = CryptoJS.enc.Hex.parse(word);
      const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
      const decrypt = CryptoJS.AES.decrypt(srcs, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
      //let decryptedStr = decrypt.toString(CryptoJS.enc.Base64);
      return decryptedStr.toString();
    } catch (error) {
      return false;
    }
  },
  encrypt: (word) => {
    const srcs = CryptoJS.enc.Utf8.parse(word);
    const encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    //return encrypted.ciphertext.toString().toBase64();
    return encrypted.ciphertext.toString().toUpperCase();
  },
  md5: (str) => {
    return CryptoJS.MD5(str).toString();
  },
  sha256:(str)=>{
    return CryptoJS.SHA256(str).toString();
  },
};

//put test on every lib, can be run in self.
const test={

};

export default self;
