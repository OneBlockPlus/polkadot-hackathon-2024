import os
from api_storage import is_file_uploaded
from file_utils import get_filepath
from file_utils import read_as_bytes
from encryption import encryption, decryption

def sync_file(filename, cid):
    filepath = get_filepath(filename)

    cache_stored = os.path.isfile(filepath)
    ipfs_stored = cid is not None and is_file_uploaded(cid)

    match cache_stored, ipfs_stored:
        case True, True:
            pass # file synced, just smile :)
        case True, False:
            pass 
            # TODO
            # 1. encrypt
            data_to_encrypt = read_as_bytes(fpath=filepath)

            header = b"DNA Sequence Data 2024-12-10" # TODO tweak the header
            encrypted_dict = encryption(data_to_encrypt, header)
            
            # 2. upload
            # 3. store cid to db (alter the record col)
        case False, True:
            pass 
            # TODO
            # 1. download
            # 2. decrypt
            # 3. store db
            # 4. cache (filename get from ipfs i guess)
        case False, False:
            pass
            # TODO raise && get upset >_<

    
if __name__=='__main__':
    filename = "8f0fd05f.diff"
    sync_file(filename, None)