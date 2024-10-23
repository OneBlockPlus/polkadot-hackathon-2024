use lazy_static::lazy_static;
use loco_rs::{Error, Result};
use serde::{Deserialize, Serialize};
use sp_core::hash::H256;
pub use sp_core::sr25519::Public;
use sp_core::sr25519::{self, Signature};
use sp_core::Pair;
use std::io::{self, Read, Seek, SeekFrom, Write};

pub type DateTimeUtc = chrono::DateTime<chrono::Utc>;

const PFX_SEAL_MAGIC: [u8; 4] = [b'P', b'f', b'L', b'X'];

lazy_static! {
    static ref PFLX_ISSUER_DEV_PAIR: sr25519::Pair = {
        let mut seed = [0_u8; 32];
        seed[16] = 8;
        sr25519::Pair::from_seed(&seed)
    };
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct IssueSignature {
    pub pflix_issuer: Public,
    pub assets_id: H256,
    pub owner: Public,
    pub issue_time: DateTimeUtc,
    pub signature: Signature,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
struct _IssueSignatureSource {
    pub pflix_issuer: Public,
    pub assets_id: H256,
    pub owner: Public,
    pub issue_time: DateTimeUtc,
}

pub fn seal_assets<R, W>(
    assets_owner: Public,
    input: &mut R,
    output: &mut W,
) -> Result<IssueSignature>
where
    R: Read + Seek,
    W: Write,
{
    use byteorder::{ByteOrder, LittleEndian};

    let input_hash = blake2b_hash(input)?;
    let iss = _IssueSignatureSource {
        pflix_issuer: PFLX_ISSUER_DEV_PAIR.public(),
        assets_id: input_hash,
        owner: assets_owner,
        issue_time: chrono::offset::Local::now().to_utc(),
    };

    let mut sign_src = Vec::new();
    ciborium::ser::into_writer(&iss, &mut sign_src).map_err(Error::wrap)?;
    let signature = PFLX_ISSUER_DEV_PAIR.sign(&sign_src);

    output.write(&PFX_SEAL_MAGIC)?;
    let n = output.write(&signature)?;
    println!("write signature {} bytes", n);
    let mut sign_src_len = [0u8; 2];
    LittleEndian::write_u16(&mut sign_src_len, sign_src.len() as u16);
    let n = output.write(&sign_src_len)?;
    println!("write sign source len {} bytes", n);
    let n = output.write(&sign_src)?;
    println!("write sign source {} bytes", n);
    input.seek(SeekFrom::Start(0))?;
    let n = io::copy(input, output)?;
    println!("write input content {} bytes", n);
    output.flush()?;

    let ret = IssueSignature {
        pflix_issuer: iss.pflix_issuer,
        assets_id: iss.assets_id,
        owner: iss.owner,
        issue_time: iss.issue_time,
        signature,
    };
    Ok(ret)
}

pub fn unseal_assets<R, W>(sealed_input: &mut R, output: &mut W) -> Result<IssueSignature>
where
    R: Read,
    W: Write,
{
    use bytestream::*;
    use std::io::Cursor;

    let mut magic_buf = [0u8; 4];
    sealed_input.read(&mut magic_buf)?;
    if magic_buf != PFX_SEAL_MAGIC {
        return Err(Error::string("invalid PFLX sealed file"));
    }
    let mut sign_buf = [0u8; 64];
    sealed_input.read(&mut sign_buf)?;

    let sign_src_len = u16::read_from(sealed_input, ByteOrder::LittleEndian)?;
    println!("sign source len: {}", sign_src_len);
    let mut sign_src_buf = Vec::<u8>::with_capacity(sign_src_len as usize);
    sealed_input
        .take(sign_src_len.into())
        .read_to_end(&mut sign_src_buf)?;

    let mut scratch = [0u8; 512];
    let iss: _IssueSignatureSource =
        ciborium::de::from_reader_with_buffer(Cursor::new(&sign_src_buf), &mut scratch)
            .map_err(Error::wrap)?;

    println!("_IssueSignatureSource: {:?}", iss);

    let signature = sign_buf.into();
    println!("sign: {}", hex::encode(&signature));
    if !sr25519::Pair::verify(&signature, &sign_src_buf, &iss.pflix_issuer) {
        return Err(Error::string("invalid PFLX signature"));
    };

    //TODO: validate PFLX content hash
    let n = io::copy(sealed_input, output)?;
    println!("write output content {} bytes", n);
    output.flush()?;

    let ret = IssueSignature {
        pflix_issuer: iss.pflix_issuer,
        assets_id: iss.assets_id,
        owner: iss.owner,
        issue_time: iss.issue_time,
        signature,
    };
    Ok(ret)
}

pub fn blake2b_hash<R: Read>(input: &mut R) -> Result<H256, Error> {
    use blake2b_simd::Params;
    let mut state = Params::new().hash_length(32).to_state();
    let _ = std::io::copy(input, &mut state)?;
    let h = state.finalize();
    Ok(H256::from_slice(h.as_bytes()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use sp_core::{Pair, H256};
    use std::io::Cursor;

    #[test]
    pub fn test_serde_cbor() {
        let (issuer_keypair, _) = sr25519::Pair::generate();
        let (owner_keypair, seed) = sr25519::Pair::generate();

        let iss = _IssueSignatureSource {
            pflix_issuer: issuer_keypair.public(),
            assets_id: H256::from_slice(&seed),
            owner: owner_keypair.public(),
            issue_time: chrono::offset::Local::now().to_utc(),
        };
        println!("iss: {:?}", iss);

        let mut vec = Vec::new();
        ciborium::ser::into_writer(&iss, &mut vec).expect("Serialization of IssueSignatureSource");

        println!("Serialized CBOR(len: {}): {:?}", vec.len(), vec);

        let deserialized: _IssueSignatureSource = ciborium::de::from_reader(&mut Cursor::new(vec))
            .expect("Deserialized back into IssueSignatureSource");

        assert_eq!(deserialized, iss);
        println!("Deserialized Data: {:?}", deserialized);
    }

    #[test]
    pub fn test_seal_assets() {
        let (owner_keypair, _) = sr25519::Pair::generate();
        let orig_data = b"abcdefghigklmkABCDEFGHIJ";
        let mut orig_data = Cursor::new(orig_data);
        let mut sealed_output = Vec::<u8>::new();

        let iss = seal_assets(owner_keypair.public(), &mut orig_data, &mut sealed_output).unwrap();
        println!("IssueSignature: {:?}", iss);
        println!(
            "sealed output(len: {}): {:?}",
            sealed_output.len(),
            sealed_output
        );

        let mut sealed_input = Cursor::new(sealed_output);
        let mut orig_data2 = Vec::<u8>::new();
        let iss2 = unseal_assets(&mut sealed_input, &mut orig_data2).unwrap();
        assert_eq!(iss, iss2);
        println!("unsealed IssueSignature: {:?}", iss);
    }
}
