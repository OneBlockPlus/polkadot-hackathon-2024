//! Schema definition file for our Attestations architecture.

use codec::{Encode, Decode};
use scale_info::TypeInfo;
use frame_support::{BoundedVec, traits::ConstU32};

/// Defines the standard size for object vectors.
pub const SIZE_OBJECT_VECTORS: u32 = 50;

/// Defines the standard size for char vectors.
pub const SIZE_STRINGS: u32 = 100;

/// Structure for a Schema object in our Attestations architecture.
#[derive(Encode, Decode, TypeInfo, Debug, Clone, PartialEq, Eq)]
pub struct Schema {
    pub id: u32,
    pub name: BoundedVec<u8, ConstU32<SIZE_STRINGS>>,
    pub fields: BoundedVec<SchemaField, ConstU32<SIZE_OBJECT_VECTORS>>,
}

/// Structure for a Schema Field object in our Attestations architecture.
#[derive(Encode, Decode, TypeInfo, Debug, Clone, PartialEq, Eq)]
pub struct SchemaField {
    pub name: BoundedVec<u8, ConstU32<SIZE_STRINGS>>,
    pub data_type: BoundedVec<u8, ConstU32<SIZE_STRINGS>>,
    pub value: BoundedVec<u8, ConstU32<SIZE_STRINGS>>,
}

/// Structure for an Attestation object in our Attestations architecture.
#[derive(Encode, Decode, TypeInfo, Debug, Clone, PartialEq, Eq)]
pub struct Attestation {
    pub id: u32,
    pub schema_id: u32,
    pub subject: BoundedVec<u8, ConstU32<SIZE_STRINGS>>,
    pub issuer: BoundedVec<u8, ConstU32<SIZE_STRINGS>>,
    pub data: BoundedVec<SchemaField, ConstU32<SIZE_OBJECT_VECTORS>>,
}