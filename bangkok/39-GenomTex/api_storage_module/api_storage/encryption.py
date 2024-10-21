from Crypto.Cipher import AES
from base64 import b64decode, b64encode
from .file_utils import read_as_bytes, get_filepath
from dotenv import load_dotenv
import os

load_dotenv()
secret_key = b64decode(os.getenv('ENCODED_ENCRYPTION_SECRET_KEY'))

def encryption(data_to_encrypt: bytes, header: bytes, secret_key: bytes=secret_key):
    cipher = AES.new(secret_key, AES.MODE_GCM)

    # Adding header to the cipher for authentication
    cipher.update(header)

    # Encrypting the data and generating a tag for integrity and authenticity
    ciphertext, tag = cipher.encrypt_and_digest(data_to_encrypt)

    # Preparing JSON output
    json_k = ['nonce', 'header', 'ciphertext', 'tag']
    json_v = [b64encode(x).decode('utf-8') for x in (cipher.nonce, header, ciphertext, tag)]
    result = dict(zip(json_k, json_v))

    return result


def decryption(data: dict, secret_key: bytes=secret_key):
    try:
        json_k = [ 'nonce', 'header', 'ciphertext', 'tag' ]
        jv = {k:b64decode(data[k]) for k in json_k}

        cipher = AES.new(secret_key, AES.MODE_GCM, nonce=jv['nonce'])
        cipher.update(jv['header'])
        plaintext = cipher.decrypt_and_verify(jv['ciphertext'], jv['tag'])

        return plaintext
    except (ValueError, KeyError):
        print("Incorrect decryption")


    
if __name__=='__main__':
    original_data_fpath=get_filepath('8f0fd05f.diff')
    data_to_encrypt = read_as_bytes(fpath=original_data_fpath)

    # Example header (e.g., metadata like data type, collection date)
    header = b"DNA Sequence Data 2024-12-10"
    
    encrypted_dict = encryption(data_to_encrypt, header)

    result = decryption(encrypted_dict)
    assert result == data_to_encrypt
    print('suc lulw')
    print(result == data_to_encrypt)