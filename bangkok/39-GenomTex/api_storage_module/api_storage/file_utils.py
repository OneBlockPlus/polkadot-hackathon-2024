import os
import tarfile


cache_dir_filename ='client_data'

def make_tarfile(filepath):
    name, _extension = os.path.splitext(filepath)
    outfilename = f"{name}.tar.gz"

    print(f"FILEPATH {filepath}")
    
    with tarfile.open(outfilename, "w:gz") as tar:
        tar.add(filepath, arcname=os.path.basename(filepath))
        return outfilename

def read_as_bytes(fpath: str) -> bytes:
    with open(fpath, 'rb') as fp:
        return fp.read()


def get_filepath(filename):
    current_dir = os.path.dirname(__file__)
    file_path = os.path.join(current_dir, '..', cache_dir_filename, filename)
    file_path = os.path.abspath(file_path)
    return file_path