import logging
import os
import shutil
import subprocess
from typing import List, Tuple

logger = logging.getLogger(__name__)


def make_patch_from_files(filepath1: str, filepath2: str) -> Tuple[str, str]:
    """
    Use this function to store differences between two .vcf files,
    which are already differentials to the reference genomic sequence.

    Example: make_patch_from_files("8f0fd05f.vcf", "8f0fd05f.v2.vcf")

    :return: Stored diff filename
    """

    if not os.path.exists(filepath1):
        raise FileNotFoundError(filepath1)
    if not os.path.exists(filepath2):
        raise FileNotFoundError(filepath2)

    basename = ".".join(filepath2.split(".")[:-1])
    outfilename = f"{basename}.diff"
    with open(outfilename, 'w') as file:
        p = subprocess.run(['diff', filepath1, filepath2], stdout=file)

    err = None
    if p.returncode == 2:
        err = p.stderr.decode()

    return outfilename, err


def apply_patch_to_file(filepath_src: str, filepath_diff: str) -> Tuple[str, str]:
    """
    Use this function to apply a patch to .vcf file to reconstruct its sequential version.

    :return: Reconstructed sequential .vcf file.
    """

    if not os.path.exists(filepath_src):
        raise FileNotFoundError(filepath_src)
    if not os.path.exists(filepath_diff):
        raise FileNotFoundError(filepath_diff)

    basename = ".".join(filepath_diff.split(".")[:-1])
    outfilename = f"{basename}.vcf"
    shutil.copyfile(filepath_src, outfilename)
    p = subprocess.run(['patch', outfilename, filepath_diff], capture_output=True)

    err = None
    if p.returncode != 0:
        err = p.stderr.decode()

    return outfilename, err


def reconstruct_dna_from_diff(ref_genome_f: str, diff_genome_f: str) -> List[str]:
    """
    Reconstruct the entire DNA sequence from a reference genome in .fa format and diff in .vcf format.

    :return: 6 billion long string made of ACGT characters
    """

    # TODO

    pass


def test_make_and_apply_patch_from_files():
    os.chdir('/Users/Kuba/Projects/polkadot-hackathon-2024/bangkok/39-GenomTex/api_storage_module/client_data')
    diff_filename, err = make_patch_from_files("8f0fd05f.vcf", "8f0fd05f.v2.vcf")
    assert err is None
    shutil.move("8f0fd05f.v2.vcf", "_8f0fd05f.v2.vcf")
    patched_filename, err = apply_patch_to_file("8f0fd05f.vcf", diff_filename)
    assert patched_filename == "8f0fd05f.v2.vcf"
    assert err is None

    # no diff between original v2 and patched v1 -> v2 file
    diff_filename, err = make_patch_from_files("_8f0fd05f.v2.vcf", "8f0fd05f.v2.vcf")
    stats = os.stat(diff_filename)
    assert stats.st_size == 0
    assert err is None
    os.remove(diff_filename)


if __name__ == "__main__":
    test_make_and_apply_patch_from_files()
