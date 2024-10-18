import difflib
import logging
from time import time
from typing import List

logger = logging.getLogger(__name__)


def make_patch_from_files(filepath1: str, filepath2: str, seq_num: int) -> str:
    """
    Use this function to store differences between two .vcf files,
    which are already differentials to the reference genomic sequence.

    :return: Stored diff filename
    """

    with open(filepath1, "r") as fr:
        dna1 = fr.readlines()

    with open(filepath2, "r") as fr:
        dna2 = fr.readlines()

    start = time()
    diff = difflib.unified_diff(dna1, dna2, lineterm='')
    logger.info(f"Finished in {time() - start} seconds")

    basename = filepath1.split(".")[0]
    outfilename = f"{basename}.{seq_num}.diff"
    with open(outfilename, 'w') as fw:
        fw.write('\n'.join(diff))

    return outfilename


def apply_patch_to_file(filepath_src: str, filepath_diff: str) -> str:
    """
    Use this function to apply a patch to .vcf file to reconstruct its sequential version.

    :return: Reconstructed sequential .vcf file.
    """

    # TODO

    pass


def reconstruct_dna_from_diff(ref_genome_f: str, diff_genome_f: str) -> List[str]:
    """
    Reconstruct the entire DNA sequence from a reference genome in .fa format and diff in .vcf format.

    :return: 6 billion long string made of ACGT characters
    """

    # TODO

    pass
