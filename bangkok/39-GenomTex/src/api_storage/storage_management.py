import os
from .api_storage import is_file_uploaded, get_file_details
from .file_utils import get_filepath, read_as_bytes, make_tarfile, extract_tarfile, get_cache_path, store_decrypted_tar_file
from .encryption import encryption, decryption, encrypted_bytes_to_json
import datetime
from .api_storage import create_upload_session, put_file_data, end_session, Result, download_data


def handle_cache_exists(filename):
    # 0. compress
    tar_filepath = make_tarfile(get_filepath(filename))
    # 1. encrypt
    formatted_date = datetime.datetime.now().strftime("%Y/%m/%d %H:%M:%S.%f")
    header = f"DNA Diff Data {formatted_date}".encode()
    
    data_to_encrypt = read_as_bytes(fpath=tar_filepath)
    encrypted_dict = encryption(data_to_encrypt, header)
    
    # 2. upload
    # create session
    response = create_upload_session(os.path.basename(tar_filepath))

    file_uuid = response['data']['files'][0]['fileUuid']
    session_uuid = response['data']['sessionUuid']
    upload_url = response['data']['files'][0]['url']
    
    # upload file
    result, message = put_file_data(upload_url, data=encrypted_dict)
    
    if result != Result.OK:
        print(result, message)

    # tar tmp file cleanup
    if os.path.exists(tar_filepath):
        os.remove(tar_filepath)
    
    # end session & (triggers upload IPFS)
    result, message = end_session(session_uuid)
    
    print(result, message)

    return file_uuid


def sync_file(filename, uuid):
    
    filepath = get_filepath(filename)
    filedetails = get_file_details(uuid)
    cache_stored = filepath and os.path.isfile(filepath)
    if cache_stored is None:
        cache_stored = False
    ipfs_stored = uuid is not None and filedetails["status"] and  filedetails["status"] == 200

    match cache_stored, ipfs_stored:
        case True, True:
            pass # file synced, just smile :)
        case True, False:
            return handle_cache_exists(filename)
        case False, True:

            filename = filedetails['data']['name']
            link = filedetails['data']['link']
            print(link)
            destination_path = get_filepath(filename)
            
            encrypted_bytes = download_data(link)
            encrypted_json = encrypted_bytes_to_json(encrypted_bytes)

            data = decryption(encrypted_json)
            store_decrypted_tar_file(data, destination_path) # this stores file archive
            
            return uuid
        case False, False:
            raise FileNotFoundError(f'file \'{filename}\' is not present (bot ipfs and cache)')
            

    
if __name__=='__main__':
    filename = "8f0fd05f.diff"
    sync_file(filename, None)
    
    # uuid = '29cb0c61-1d4d-4848-9cf6-2498be1f19f0'
    # sync_file(None, uuid)

    