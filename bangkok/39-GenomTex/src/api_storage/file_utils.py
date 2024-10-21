import os
import tarfile


cache_dir_filename ='client_data'

def make_tarfile(filepath):
    name, _extension = os.path.splitext(filepath)
    outfilename = f"{name}.tar.gz"

    with tarfile.open(outfilename, "w:gz") as tar:
        tar.add(filepath, arcname=os.path.basename(filepath))
        return outfilename

def read_as_bytes(fpath: str) -> bytes:
    with open(fpath, 'rb') as fp:
        return fp.read()

def extract_tarfile(tar_filepath, extract_to_filepath):
    if not os.path.exists(extract_to_filepath):
        os.makedirs(extract_to_filepath)

    with tarfile.open(tar_filepath, "r:gz") as tar:
        tar.extractall(path=extract_to_filepath)

    return extract_to_filepath


def store_decrypted_tar_file(decrypted_data, destination_path):
    with open(destination_path, 'wb') as f:
        f.write(decrypted_data)
    print(f"Decrypted file stored at: {destination_path}")


def get_filepath(filename):
    try:
        current_dir = os.path.dirname(__file__)
        file_path = os.path.join(current_dir, '..', cache_dir_filename, filename)
        file_path = os.path.abspath(file_path)
        return file_path
    except TypeError:
        return None
    
def get_cache_path():
    current_dir = os.path.dirname(__file__)
    return os.path.join(current_dir, '..', cache_dir_filename)