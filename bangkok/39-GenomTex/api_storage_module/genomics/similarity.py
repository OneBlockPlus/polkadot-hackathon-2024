from typing import List

import numpy as np
from rapidfuzz.distance.metrics_cpp import levenshtein_distance
from sklearn.decomposition import PCA


def dna_to_vector(base: str) -> np.ndarray[np.complex_]:
    """
    DNA represented as complex vector.
    In this way, distance to complementary molecules are 2 as it is a change harder to make,
    and 1.4 to complementary ones.
    """

    char_to_complex = {
        'A': 1,
        'G': 1j,
        'T': -1,
        'C': -1j
    }

    char_array = np.array(list(base))
    vectorized_lookup = np.vectorize(char_to_complex.get)
    complex_array = vectorized_lookup(char_array)
    return complex_array


def cosine_distance(vector1: np.ndarray[np.complex_], vector2: np.ndarray[np.complex_]) -> np.float64:
    """
    Calculates distance between two vectors, two DNAs.
    vector1 and vector2 should be complex vectors representing the entire DNAs mapped to numbers.
    """

    dot_product = np.dot(vector1, np.conjugate(vector2))
    norm_vec1 = np.linalg.norm(vector1)
    norm_vec2 = np.linalg.norm(vector2)

    cosine_similarity = np.real(dot_product) / (norm_vec1 * norm_vec2)
    return 1 - cosine_similarity


def lev_distance(base1: str, base2: str) -> int:
    return levenshtein_distance(base1, base2)


def make_dna_fingerprint(matrix, output_index) -> str:
    """
    Input is list of all DNAs as Matrix of (n, bases).
    Output is location of one specific DNA in the entire DNA space, so it can be used in similarity calculations.
    """

    pca = PCA(n_components=16)
    components = pca.fit_transform(matrix)

    b_fp = components[output_index].tobytes()
    return ''.join('{:02x}'.format(x) for x in b_fp)


def test_dna_to_vector():
    vec = dna_to_vector("GATTACA")

    assert vec.tolist() == [1j, 1, -1, -1, 1, -1j, 1]
    return "OK"


def test_cosine_distance():
    vec1 = np.array([1 + 2j, 3 + 4j])
    vec2 = np.array([5 + 6j, 7 + 8j])

    dist = cosine_distance(vec1, vec2)
    assert 0.05 > dist > 0
    return "OK"


def test_make_dna_fingerprint():
    samples = np.random.rand(30, 50)
    fp = make_dna_fingerprint(samples, 0)

    assert len(fp) == 256
    return "OK"


if __name__ == "__main__":
    print(test_dna_to_vector())
    print(test_cosine_distance())
    print(test_make_dna_fingerprint())
