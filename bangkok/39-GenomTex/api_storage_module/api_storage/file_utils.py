import os


cache_dir_filename ='client_data'

def read_as_bytes(fpath: str) -> bytes:
    with open(fpath, 'rb') as fp:
        return fp.read()


def get_filepath(filename):
    current_dir = os.path.dirname(__file__)
    file_path = os.path.join(current_dir, '..', cache_dir_filename, filename)
    file_path = os.path.abspath(file_path)
    return file_path