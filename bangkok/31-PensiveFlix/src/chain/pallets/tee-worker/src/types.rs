use super::*;
use frame_support::{
	BoundedVec,
	pallet_prelude::ConstU32,
};

#[derive(PartialEq, Eq, Encode, Decode, Clone, RuntimeDebug, MaxEncodedLen, TypeInfo)]
#[scale_info(skip_type_params(T))]
#[codec(mel_bound())]
pub struct TeeWorkerInfo<T: pallet::Config> {
    pub worker_account: AccountOf<T>,
    pub peer_id: PeerId,
    pub bond_stash: Option<AccountOf<T>>,
    pub end_point: EndPoint,
    pub tee_type: TeeType,
}

#[derive(PartialEq, Eq, Encode, Decode, Clone, RuntimeDebug, Default, MaxEncodedLen, TypeInfo)]
pub struct SgxAttestationReport {
    pub report_json_raw: Report,
    pub sign: ReportSign,
    pub cert_der: Cert,
}

#[derive(PartialEq, Eq, Encode, Decode, Clone, RuntimeDebug, MaxEncodedLen, TypeInfo)]
pub enum TeeType {
    Full,
    Verifier,
    Marker,
}

pub type PeerId = [u8; 38];
pub type EndPoint = BoundedVec<u8, ConstU32<100>>;
pub type ReportSign = BoundedVec<u8, ConstU32<344>>;
pub type Report =  BoundedVec<u8, ConstU32<5000>>;
pub type Cert = BoundedVec<u8, ConstU32<1588>>;