from api_storage_module.api_storage.encryption import encryption, decryption
from Crypto.Random import get_random_bytes

def test_encrypt_decrypt_eq_rand_data():
    
    for i in range(5):
        header = f"Sample header {i}".encode()
        data_to_encrypt = get_random_bytes(1000)

        encrypted_dict = encryption(data_to_encrypt, header)
        decrypted_date = decryption(encrypted_dict)

        assert decrypted_date == data_to_encrypt