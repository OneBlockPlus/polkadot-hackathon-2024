use ark_bn254::Fr;
use sp_std::{vec, vec::Vec};

use ark_std::{str::FromStr, string::ToString};
use mimc::Mimc7;
use sp_core::U256;

use super::*;

// ceil(log2(1<<20))
static TREE_DEPTH: usize = 8;

// 1<<20 leaves
// const MAX_LEAF_COUNT: usize = 256;

#[derive(Clone, Debug)]
pub struct MerkleTree {
	cur: usize,
	root: U256,
	leaves: Vec<Vec<U256>>,
}

impl Default for MerkleTree {
	fn default() -> Self {
		let leaves = (0..TREE_DEPTH + 1)
			.rev()
			.map(|x| vec![U256::zero(); 2usize.pow(x as u32)])
			.collect::<Vec<_>>();

		let mut mt = MerkleTree { cur: 0, root: U256::zero(), leaves };
		mt.init();
		mt
	}
}

impl MerkleTree {
	fn init(&mut self) {
		// for depth in 0..TREE_DEPTH {
		// 	self.leaves[depth]
		// 		.clone()
		// 		.chunks_exact(2)
		// 		.enumerate()
		// 		.for_each(|(index, chunk)| {
		// 			self.leaves[depth][index * 2] =
		// 				Self::get_unique_leaf(depth, index * 2, chunk[0].clone());
		// 			self.leaves[depth][index * 2 + 1] =
		// 				Self::get_unique_leaf(depth, index * 2 + 1, chunk[1].clone());
		// 			self.leaves[depth + 1][index] = Self::hash_impl(
		// 				&self.leaves[depth][index * 2],
		// 				&self.leaves[depth][index * 2 + 1],
		// 				&FILL_LEVEL_IVS[depth],
		// 			);
		// 		})
		// }
	}

	//@@
	pub fn insert(&mut self, message: U256) -> Result<(U256, usize), &'static str> {
		let offset = self.cur;
		self.leaves[0][self.cur] = message;

		self.root = self.update();
		self.cur += 1;

		Ok((message, offset))
	}

	// Update the leaves of the entire tree, return new tree root.
	pub fn update(&mut self) -> U256 {
		let mut current_index = self.cur;
		let mut leaf1: U256;
		let mut leaf2: U256;

		let mimc7 = Mimc7::new(91);

		for depth in 0..TREE_DEPTH {
			let next_index = current_index / 2;
			if current_index % 2 == 0 {
				leaf1 = self.leaves[depth][current_index].clone();
				leaf2 = MerkleTree::get_unique_leaf(
					self.leaves[depth][current_index + 1].clone(),
					depth,
				);
			} else {
				leaf1 = MerkleTree::get_unique_leaf(
					self.leaves[depth][current_index - 1].clone(),
					depth,
				);
				leaf2 = self.leaves[depth][current_index].clone();
			}
			let l1 = Fr::from_str(&leaf1.to_string()).unwrap();
			let l2 = Fr::from_str(&leaf2.to_string()).unwrap();

			self.leaves[depth + 1][next_index] =
				U256::from_dec_str(&mimc7.hash(&l1, &l2).to_string()).unwrap();
			current_index = next_index;
		}
		self.root = self.leaves[TREE_DEPTH][0].clone();
		self.root.clone()
	}

	// Return leaf according to depth and index,
	pub fn get_leaf(&self, depth: usize, offset: usize) -> U256 {
		self.leaves[depth][offset]
	}

	// get merkle tree root
	pub fn get_root(&self) -> U256 {
		self.root.clone()
	}

	// Obtain the merkel proof according to the corresponding leaf of the index
	pub fn get_proof(&self, mut index: usize) -> Vec<U256> {
		let mut address_bits = vec![false; TREE_DEPTH];
		let mut proof_path = vec![U256::zero(); TREE_DEPTH];

		for depth in 0..TREE_DEPTH {
			//address_bits[depth] = index % 2 == 0;
			if index % 2 == 0 {
				address_bits[depth] = true;
				proof_path[depth] = self.get_leaf(depth, index + 1);
			} else {
				address_bits[depth] = false;
				proof_path[depth] = self.get_leaf(depth, index - 1);
			}
			index /= 2;
		}
		proof_path
	}

	//
	// pub fn verify_merkle_proof(&self, leaf: U256, proof: Vec<U256>, index: usize) -> bool {
	// 	if proof.len() != TREE_DEPTH && index > MAX_LEAF_COUNT {
	// 		return false;
	// 	}
	// 	self.verify_path(leaf, proof, index) == self.get_root()
	// }

	// Returns calculated merkle root
	// pub fn verify_path(&self, leaf: U256, in_path: Vec<U256>, mut index: usize) -> U256 {
	// 	let mut item = leaf;
	// 	for depth in 0..TREE_DEPTH {
	// 		if index % 2 == 0 {
	// 			item = MerkleTree::hash_impl(&item, &in_path[depth], &FILL_LEVEL_IVS[depth]);
	// 		} else {
	// 			item = MerkleTree::hash_impl(&in_path[depth], &item, &FILL_LEVEL_IVS[depth]);
	// 		}
	// 		index /= 2;
	// 	}
	// 	item
	// }

	// @@
	pub fn get_unique_leaf(mut leaf: U256, depth: usize) -> U256 {
		if leaf.is_zero() {
			let mimc7 = Mimc7::new(91);
			for _depth in 0..depth {
				let l = Fr::from_str(&leaf.to_string()).unwrap();
				leaf = U256::from_dec_str(&mimc7.hash(&l, &l).to_string()).unwrap();
			}
		}
		leaf
	}

	// Use two leaves to generate mimc hash
	// fn hash_impl(left: &U256, right: &U256, iv: &U256) -> U256 {
	// 	let mut left_arr = [0u8; 32];
	// 	let mut right_arr = [0u8; 32];
	// 	left.to_big_endian(&mut left_arr[0..32]);
	// 	right.to_big_endian(&mut right_arr[0..32]);
	// 	let left_new = BigInt::from_bytes_be(Sign::Plus, &left_arr);
	// 	let right_new = BigInt::from_bytes_be(Sign::Plus, &right_arr);
	// 	let input = vec![left_new, right_new];
	// 	let mimc7 = Mimc7::new(91);
	// 	let rt = match mimc7.hash(input) {
	// 		Ok(l) => {
	// 			let mut temp = [0u8; 32];
	// 			for (i, x) in l.to_bytes_be().1.iter().enumerate() {
	// 				temp[i] = *x;
	// 			}
	// 			U256::from_big_endian(&temp)
	// 		},
	// 		Err(e) => return U256::zero(),
	// 	};

	// 	rt
	// }
}

#[test]
fn test_merkle_tree_root_hash() {
	let mut mt = MerkleTree::default();

	assert_eq!(mt.update(), mt.get_root());
	assert_eq!(
		U256::from_dec_str(
			"15118794022989096240414562605246342209918117228209570959055463092364691057063"
		)
		.unwrap(),
		mt.get_root()
	);

	let (leaf, index) = mt.insert(U256::from_dec_str("1").unwrap()).unwrap();
	print!("{:?} {:?}", leaf, index);
	assert_eq!(
		U256::from_dec_str(
			"11918823777688916996440235409179584458198237132535057418448191606750426488941"
		)
		.unwrap(),
		mt.get_root()
	);

	let (leaf, index) = mt.insert(U256::from_dec_str("2").unwrap()).unwrap();
	print!("{:?} {:?}", leaf, index);
	assert_eq!(
		U256::from_dec_str(
			"4056297984077945401031160722288226165138515589996813440303114275064200657118"
		)
		.unwrap(),
		mt.get_root()
	);

	// let index  = 0;
	// let merkle_proof = mt.get_proof(index);
	//assert!(mt.verify_merkle_proof(leaf, merkle_proof, index));
}
