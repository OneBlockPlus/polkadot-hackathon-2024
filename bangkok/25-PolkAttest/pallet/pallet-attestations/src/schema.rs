use codec::{Encode, Decode};
use scale_info::TypeInfo;
use frame_support::{BoundedVec, traits::ConstU32};

#[derive(Encode, Decode, TypeInfo, Debug, Clone, PartialEq, Eq)]
pub struct Schema {
    pub id: u32,
    pub name: BoundedVec<u8, ConstU32<100>>,
    pub fields: BoundedVec<SchemaField, ConstU32<50>>,
}

#[derive(Encode, Decode, TypeInfo, Debug, Clone, PartialEq, Eq)]
pub struct SchemaField {
    pub name: BoundedVec<u8, ConstU32<100>>,
    pub data_type: BoundedVec<u8, ConstU32<100>>,
    pub value: BoundedVec<u8, ConstU32<100>>,
}

#[derive(Encode, Decode, TypeInfo, Debug, Clone, PartialEq, Eq)]
pub struct Attestation {
    pub id: u32,
    pub schema_id: u32,
    pub subject: BoundedVec<u8, ConstU32<100>>,
    pub issuer: BoundedVec<u8, ConstU32<100>>,
    pub data: BoundedVec<SchemaField, ConstU32<50>>,
}