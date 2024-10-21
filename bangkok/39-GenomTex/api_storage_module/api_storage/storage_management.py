import os
from .api_storage import is_file_uploaded
from .file_utils import get_filepath, read_as_bytes
from .encryption import encryption, decryption
import datetime
from .api_storage import create_upload_session, put_file_data, end_session, Result


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
            formatted_date = datetime.datetime.now().strftime("%Y/%m/%d %H:%M:%S.%f")
            header = f"DNA Diff Data {formatted_date}".encode()
            
            data_to_encrypt = read_as_bytes(fpath=filepath)

            encrypted_dict = encryption(data_to_encrypt, header)
            
            # 2. upload
            # create session
            response = create_upload_session(filename)

            file_uuid = response['data']['files'][0]['fileUuid']
            session_uuid = response['data']['sessionUuid']
            upload_url = response['data']['files'][0]['url']
            
            # upload file
            result, message = put_file_data(upload_url, data=encrypted_dict)
            
            if result != Result.OK:
                print(result, message)
            
            # end session & (triggers upload IPFS)
            result, message = end_session(session_uuid)
            
            if result != Result.OK:
                print(result, message)
            
            # 3. store uuid to db (alter the record col)
            # TODO @Vonsovsky store (db) uuid 'ee433f65-ea35-48bb-9ae1-4b364bacf6a1' to reference diff in cache
            # TODO process(file_uuid) for future uploads
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