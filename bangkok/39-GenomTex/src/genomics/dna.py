import logging
import os.path
import random
from time import time

import numpy as np
from pysam import VariantFile

from similarity import dna_to_vector, cosine_distance
from strings import fill_to_len


logger = logging.getLogger(__name__)

REF_FILENAME = "Homo_sapiens.GRCh38.dna.primary_assembly.fa"
BASE_CHROMOSOMES = [str(x) for x in range(1, 23)]
BASE_CHROMOSOMES.extend(["X", "Y", "MT"])
COMPUTATIONS_DIR = "computations/"


def split_ref_genome_to_chr_files(filepath: str):
    fwrite = None
    if not os.path.exists("ref_chromosomes/"):
        os.makedirs("ref_chromosomes/")

    with open(filepath, 'r') as fread:
        for line in fread:
            if line.startswith('>'):
                chr_index = line.split(" ")[0][1:]
                if fwrite is not None:
                    fwrite.close()
                fwrite = open(f"ref_chromosomes/{filepath}.chr{chr_index}", "w")
                continue

            if len(line.strip()) == 0:
                continue

            fwrite.write(line)

    if fwrite is not None:
        fwrite.close()


def compute_chromosomes_similarity_from_cache(vcf_genome_filepath: str):
    basename = vcf_genome_filepath.split(".")[0]

    dists = []
    for chr_id in BASE_CHROMOSOMES:
        if chr_id == "MT":
            continue

        fa_filepath = os.path.join(COMPUTATIONS_DIR, f"{basename}_chr{chr_id}.fa")
        if not os.path.exists(fa_filepath):
            raise FileNotFoundError(f"File {fa_filepath} not found. Run align_chromosomes() first.")

        ref_chr = []
        alt_chr = []
        start = time()
        with open(fa_filepath, 'r') as fread:
            current_pointer = "ref"
            for i, line in enumerate(fread):
                if line.startswith('>'):
                    current_pointer = line.split("_")[0][1:]
                    continue

                if current_pointer == "ref":
                    ref_chr.append(line.strip())
                if current_pointer == "alt":
                    alt_chr.append(line.strip())

        ref_chr = "".join(ref_chr)
        alt_chr = "".join(alt_chr)

        print(f"File {fa_filepath} loaded in {time() - start} seconds")
        start = time()
        vec1 = dna_to_vector(ref_chr)
        vec2 = dna_to_vector(alt_chr)
        print(f"Vectorization finished in {time() - start} seconds")
        dist = cosine_distance(vec1, vec2)
        dists.append(dist)

    dists = np.array(dists)
    return np.mean(dists)


def read_ref_chromosome(chr_id: str) -> str:
    filepath = f"ref_chromosomes/{REF_FILENAME}.chr{chr_id}"
    with open(filepath, "r") as fread:
        return "".join([x.strip() for x in fread.readlines()])


def reconstruct_specific_chromosome(chr_ref: str, chr_id: str, vcf_genome_filepath: str) -> str:
    vcf_file = VariantFile(vcf_genome_filepath)
    seek_chr = "chr" + chr_id

    inserts = []
    for record in vcf_file:
        # TODO use index files instead
        if record.chrom != seek_chr:
            continue

        # what, where, how many to delete from reference
        inserts.append((record.alts, record.pos - 1, len(record.ref)))

    inserts = sorted(inserts, reverse=True)  # go from backwards, so we don't move positions for uneven insertions
    reconstructed = list(chr_ref)
    for i, (repl_with, pos, length) in enumerate(inserts):
        reconstructed[pos:pos + length] = list(repl_with[0].upper())
        if i % 1000 == 0:
            print(i)

    return ''.join(reconstructed)


def check_alignment_integrity(ref_bases, alt_bases):
    assert len(ref_bases) == len(alt_bases)
    same = 0
    for i in range(100):
        index = random.randint(0, len(ref_bases) - 1)
        if ref_bases[index] == alt_bases[index]:
            same += 1

    print(f"Random checks between two genomes: {same} / 100 hits")
    assert same > 90


def align_chromosomes(chr_ref, chr_id, vcf_genome_filepath):
    vcf_file = VariantFile(vcf_genome_filepath)
    seek_chr = "chr" + chr_id
    basename = vcf_genome_filepath.split(".")[0]

    inserts = []
    for i, record in enumerate(vcf_file):
        # TODO use index files instead
        if record.chrom != seek_chr:
            continue

        # what, where, how many to delete from reference
        inserts.append((record.ref, record.alts, record.pos - 1))

    inserts = sorted(inserts, reverse=True)  # go from backwards, so we don't move positions for uneven insertions
    ref_bases = list(chr_ref)
    alt_bases = list(chr_ref)
    for i, (repl_from, repl_with, pos) in enumerate(inserts):
        # X -> Y, X -> YY, XX -> Y
        filling_len = max(len(repl_from), len(repl_with[0]))
        ref_change = fill_to_len(repl_from, filling_len).upper()
        alt_change = fill_to_len(repl_with[0], filling_len).upper()

        ref_bases[pos:pos + filling_len] = list(ref_change)
        alt_bases[pos:pos + filling_len] = list(alt_change)
        if i % 1000 == 0:
            print(i)

    save_filepath = os.path.join(COMPUTATIONS_DIR, f"{basename}_chr{chr_id}.fa")
    with open(save_filepath, "w") as fwrite:
        fwrite.write(">ref_chr1 \n")
        for i in range(0, len(ref_bases), 60):
            fwrite.write("".join(ref_bases[i:i+60]))
            fwrite.write("\n")
        fwrite.write(">alt_chr1 \n")
        for i in range(0, len(alt_bases), 60):
            fwrite.write("".join(alt_bases[i:i+60]))
            fwrite.write("\n")

    check_alignment_integrity(ref_bases, alt_bases)
    print(f"Saved {save_filepath}")


def align_all_chromosomes(vcf_genome_filepath):
    for chr_id in BASE_CHROMOSOMES:
        chr_ref = read_ref_chromosome(chr_id)
        align_chromosomes(chr_ref, chr_id, vcf_genome_filepath)


if __name__ == '__main__':
    os.chdir('/Users/Kuba/Projects/polkadot-hackathon-2024/bangkok/39-GenomTex/api_storage_module/client_data')
    if not os.path.exists("ref_chromosomes/"):
        split_ref_genome_to_chr_files(REF_FILENAME)

    align_all_chromosomes("8f0fd05f.vcf")
    compute_chromosomes_similarity_from_cache("8f0fd05f.vcf")
