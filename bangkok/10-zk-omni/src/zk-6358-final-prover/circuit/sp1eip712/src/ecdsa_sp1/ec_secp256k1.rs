// use ecdsa_core::{elliptic_curve::Scalar, hazmat::bits2field};
// use k256::Secp256k1;
// use sp1_eip712_type::types::sp1_tx_types::SP1_FULL_PK_LEN;
// use sp1_lib::{io::{self, FD_ECRECOVER_HOOK}, syscall_secp256k1_decompress, unconstrained};
// use zk_6358::utils6358::type_utils::SIGN_BYTES;

// use anyhow::Result;

// /// Takes in a compressed public key and decompresses it using the SP1 syscall `syscall_secp256k1_decompress`.
// ///
// /// The first byte of the compressed public key is 0x02 if the y coordinate is even, 0x03 if the y coordinate is odd,
// /// and the remaining 32 bytes are the x coordinate of the decompressed pubkey.
// ///
// /// The decompressed public key is 65 bytes long, with 0x04 as the first byte,
// /// and the remaining 64 bytes being the x and y coordinates of the decompressed pubkey in big-endian.
// ///
// /// More details on secp256k1 public key format can be found in the [Bitcoin wiki](https://en.bitcoin.it/wiki/Protocol_documentation#Signatures).
// ///
// /// SAFETY: Our syscall will check that the x and y coordinates are within the
// /// secp256k1 scalar field.
// fn decompress_pubkey(compressed_pubkey: &[u8; 33]) -> Result<[u8; 65]> {
//     let mut decompressed_key: [u8; 64] = [0; 64];
//     decompressed_key[..32].copy_from_slice(&compressed_pubkey[1..]);
//     let is_odd = match compressed_pubkey[0] {
//         2 => false,
//         3 => true,
//         _ => unreachable!("The first byte of the compressed public key must be 0x02 or 0x03."),
//     };
//     unsafe {
//         syscall_secp256k1_decompress(&mut decompressed_key, is_odd);
//     }

//     let mut uncompressed_pubkey: [u8; 65] = [0; 65];
//     uncompressed_pubkey[0] = 4;
//     uncompressed_pubkey[1..].copy_from_slice(&decompressed_key);
//     Ok(uncompressed_pubkey)
// }

// fn local_recover_ecdsa_unconstrained(sig: &[u8; 65], msg_hash: &[u8; 32]) -> ([u8; 33], [u8; 32]) {
//     // The `unconstrained!` wrapper is used to not include the cycles used to get the "hint" for the compressed
//     // public key and s_inverse values from a non-zkVM context, because the values will be constrained
//     // in the VM.
//     unconstrained! {
//         let mut buf = [0; 65 + 32];
//         let (buf_sig, buf_msg_hash) = buf.split_at_mut(sig.len());
//         buf_sig.copy_from_slice(sig);
//         buf_msg_hash.copy_from_slice(msg_hash);
//         io::write(FD_ECRECOVER_HOOK, &buf);
//     }

//     let recovered_compressed_pubkey: [u8; 33] = io::read_vec().try_into().unwrap();
//     let s_inv_bytes_le: [u8; 32] = io::read_vec().try_into().unwrap();

//     (recovered_compressed_pubkey, s_inv_bytes_le)
// }

// /// Recover a [`VerifyingKey`] from the given `prehash` of a message, the
// /// signature over that prehashed message, and a [`RecoveryId`].
// ///
// /// This function leverages SP1 syscalls for secp256k1 to accelerate public key recovery
// /// in the zkVM. Verifies the signature against the recovered public key to ensure correctness.
// pub fn local_recover_from_prehash(
//     prehash: &[u8],
//     sig_bytes: &[u8; SIGN_BYTES],
// ) -> Result<[u8; SP1_FULL_PK_LEN]> {
//     // Recover the compressed public key and s_inverse value from the signature and prehashed message.
//     let (compressed_pubkey, s_inv) =
//         local_recover_ecdsa_unconstrained(&sig_bytes, prehash.try_into().unwrap());

//     // Convert the s_inverse bytes to a scalar.
//     let s_inverse = Scalar::<Secp256k1>::from_repr(bits2field::<Secp256k1>(&s_inv).unwrap()).unwrap();

//     // Transform the compressed public key into uncompressed form.
//     let pubkey = decompress_pubkey(&compressed_pubkey)?;

//     // Verify the signature against the recovered public key. The last byte of the signature
//     // is the recovery id, which is not used in the verification process.
//     let verified = local_verify_signature(
//         &pubkey,
//         &prehash.try_into().unwrap(),
//         &signature,
//         &s_inverse,
//     );

//     // If the signature is valid, return the public key.
//     if verified {
//         VerifyingKey::from_sec1_bytes(&pubkey).map_err(|_| Error::new())
//     } else {
//         Err(Error::new())
//     }
// }

// pub fn local_verify_signature(
//     pubkey: &[u8; 65],
//     msg_hash: &[u8; 32],
//     signature: &Signature<C>,
//     s_inverse: &Scalar<C>,
// ) -> bool {
//     let mut pubkey_x_le_bytes = pubkey[1..33].to_vec();
//     pubkey_x_le_bytes.reverse();
//     let mut pubkey_y_le_bytes = pubkey[33..].to_vec();
//     pubkey_y_le_bytes.reverse();
//     let affine =
//         Secp256k1AffinePoint::from_le_bytes(&[pubkey_x_le_bytes, pubkey_y_le_bytes].concat());

//     // Split the signature into its two scalars.
//     let (r, s) = signature.split_scalars();
//     assert_eq!(*s_inverse * s.as_ref(), Scalar::<C>::ONE);

//     // Convert the message hash into a scalar.
//     let field = bits2field::<C>(msg_hash);
//     if field.is_err() {
//         return false;
//     }
//     let field: Scalar<C> = Scalar::<C>::from_repr(field.unwrap()).unwrap();
//     let z = field;

//     // Compute the two scalars.
//     let u1 = z * s_inverse;
//     let u2 = *r * s_inverse;

//     // Convert u1 and u2 to "little-endian" bits (LSb first with little-endian byte order) for the MSM.
//     let (u1_be_bytes, u2_be_bytes) = (u1.to_repr(), u2.to_repr());
//     let u1_le_bits = be_bytes_to_le_bits(u1_be_bytes.as_slice().try_into().unwrap());
//     let u2_le_bits = be_bytes_to_le_bits(u2_be_bytes.as_slice().try_into().unwrap());

//     // Compute the MSM.
//     let res = Secp256k1AffinePoint::multi_scalar_multiplication(
//         &u1_le_bits,
//         Secp256k1AffinePoint(Secp256k1AffinePoint::GENERATOR),
//         &u2_le_bits,
//         affine,
//     )
//     .unwrap();

//     // Convert the result of the MSM into a scalar and confirm that it matches the R value of the signature.
//     let mut x_bytes_be = [0u8; 32];
//     x_bytes_be[..32].copy_from_slice(&res.to_le_bytes()[..32]);
//     x_bytes_be.reverse();

//     let x_field = bits2field::<C>(&x_bytes_be);
//     if x_field.is_err() {
//         return false;
//     }
//     *r == Scalar::<C>::from_repr(x_field.unwrap()).unwrap()
// }