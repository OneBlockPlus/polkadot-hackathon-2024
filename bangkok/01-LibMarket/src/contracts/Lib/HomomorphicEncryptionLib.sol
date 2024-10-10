// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library HomomorphicEncryptionLib {
    struct EncryptedData {
        uint256 cipher; // 存储加密后的数据
    }

    struct KeyPair {
        uint256 n; // 模数
        uint256 g; // 基数
        uint256 lambda; // ϕ(n)的值
        uint256 mu; // 私钥
    }

    function generateKeyPair() internal pure returns (KeyPair memory) {
        uint256 n = 221; // 示例模数
        uint256 g = n + 1; // 示例基数
        uint256 lambda = 110; // 示例λ(n)
        uint256 mu = 1; // 示例μ值
        return KeyPair(n, g, lambda, mu);
    }

    function encrypt(uint256 plaintext, KeyPair memory key) internal view returns (EncryptedData memory) {
        require(plaintext > 0, "Plaintext must be positive");
        uint256 r = uint256(keccak256(abi.encodePacked(block.timestamp))) % key.n;
        uint256 cipher = (modExp(key.g, plaintext, key.n * key.n) * modExp(r, key.n, key.n * key.n)) % (key.n * key.n);
        return EncryptedData(cipher);
    }

    function decrypt(EncryptedData memory encryptedData, KeyPair memory key) internal view returns (uint256) {
        uint256 nSquared = key.n * key.n;
        uint256 u = modExp(encryptedData.cipher, key.lambda, nSquared); // u = c^λ mod n^2
        uint256 plaintext = (u - 1) / key.n * key.mu % key.n; 
        return plaintext;
    }

    function verify(uint256 preimage, EncryptedData memory encryptedData, KeyPair memory key) internal view returns (bool) {
        uint256 decryptedValue = decrypt(encryptedData, key);
        return decryptedValue == preimage;
    }

    function modExp(uint256 base, uint256 exponent, uint256 modulus) internal pure returns (uint256 result) {
        result = 1;
        base = base % modulus;
        while (exponent > 0) {
            if (exponent % 2 == 1) { // 如果指数是奇数
                result = (result * base) % modulus;
            }
            exponent = exponent >> 1; // 指数除以2
            base = (base * base) % modulus;
        }
    }
}
