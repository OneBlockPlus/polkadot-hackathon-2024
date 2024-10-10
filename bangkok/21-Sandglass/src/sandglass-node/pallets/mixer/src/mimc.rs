extern crate ark_bn254;
extern crate ark_ff;
extern crate ark_std;
extern crate rand;
use ark_bn254::Fr;
use ark_ff::{BigInteger256, Field, PrimeField, UniformRand};
use ark_std::{str::FromStr, string::ToString, Zero};
use num_bigint::BigUint;
use sp_std::vec::Vec;

extern crate num;
extern crate num_bigint;
use num_bigint::{BigInt, Sign};
use tiny_keccak::{Hasher, Keccak};

const SEED: &str = "mimc";

pub struct Constants {
	n_rounds: usize,
	cts: Vec<Fr>,
}

pub fn generate_constants(n_rounds: usize) -> Constants {
	let cts = get_constants(SEED, n_rounds);

	Constants { n_rounds, cts }
}

pub fn get_constants(seed: &str, n_rounds: usize) -> Vec<Fr> {
	let mut cts: Vec<Fr> = Vec::new();
	cts.push(Fr::zero());

	let mut keccak = Keccak::v256();
	let mut h = [0u8; 32];
	keccak.update(seed.as_bytes());
	keccak.finalize(&mut h);

	let r: BigInt = BigInt::parse_bytes(
		b"21888242871839275222246405745257275088548364400416034343698204186575808495617",
		10,
	)
	.unwrap();

	let mut c = BigInt::from_bytes_be(Sign::Plus, &h);
	for _ in 1..n_rounds {
		let (_, c_bytes) = c.to_bytes_be();
		let mut c_bytes32: [u8; 32] = [0; 32];
		let diff = c_bytes32.len() - c_bytes.len();
		c_bytes32[diff..].copy_from_slice(&c_bytes[..]);

		let mut keccak = Keccak::v256();
		let mut h = [0u8; 32];
		keccak.update(&c_bytes[..]);
		keccak.finalize(&mut h);
		c = BigInt::from_bytes_be(Sign::Plus, &h);

		let n = modulus(&c, &r);
		cts.push(Fr::from_str(&n.to_string()).unwrap());
	}
	cts
}

pub fn modulus(a: &BigInt, m: &BigInt) -> BigInt {
	((a % m) + m) % m
}

pub struct Mimc7 {
	constants: Constants,
}

impl Mimc7 {
	pub fn new(n_rounds: usize) -> Mimc7 {
		Mimc7 { constants: generate_constants(n_rounds) }
	}

	pub fn hash(&self, x_in: &Fr, k: &Fr) -> Fr {
		let mut h: Fr = Fr::zero();
		for i in 0..self.constants.n_rounds {
			let mut t: Fr;
			if i == 0 {
				t = *x_in;
				t += k;
			} else {
				t = h;
				t += k;
				t += &self.constants.cts[i];
			}
			let mut t2 = t;
			t2.square_in_place();
			let mut t7 = t2;
			t7.square_in_place();
			t7 *= t2;
			t7 *= t;
			h = t7;
		}
		h += k;
		h
	}

	pub fn multi_hash(&self, arr: Vec<Fr>, key: &Fr) -> Fr {
		let mut r = *key;
		for i in 0..arr.len() {
			let h = self.hash(&arr[i], &r);
			r += arr[i];
			r += h;
		}
		r
	}
}

#[test]
fn test_mimc() {
	let b1: Fr = Fr::from_str("1").unwrap();
	let b2: Fr = Fr::from_str("2").unwrap();
	let mimc7 = Mimc7::new(91);
	let h1 = mimc7.hash(&b1, &b2);

	let a = BigUint::parse_bytes(h1.to_string().as_bytes(), 10);
	let b = BigUint::parse_bytes(
		b"176c6eefc3fdf8d6136002d8e6f7a885bbd1c4e3957b93ddc1ec3ae7859f1a08",
		16,
	);
	assert_eq!(a, b);
}
