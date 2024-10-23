pub type ZkAuthResult<T> = Result<T, ZkAuthError>;
use ark_relations::r1cs::SynthesisError;

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ZkAuthError {
    /// Circom error
    FqParseError,

    /// CalculateInputHash Error
    AllInputHashError(FrParseError),

    /// Invalid value was given to the function
    InvalidInput,

    /// Input length is wrong.
    InputLengthWrong(usize),

    /// JWK not found
    JWKNotFound,

    /// Ephemeral pubkey length error
    EphPubkeyLengthWrong(usize),

    /// Modulus base64 decode error
    ModulusDecodeError,

    /// Groth16 Proof verification fails
    ProofVerifyingFailed,

    /// General cryptographic error.
    GeneralError(SynthesisError),

    /// Onchain address parse Error
    AddressParseError,

    TestError(()),
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum FrParseError {
    /// address seed parse errror
    AddressSeedParseError,

    /// is base64 detail parse error
    IsBase64DetailsParseError,

    /// modulo f parse error
    ModuloParseError,
}

impl From<FrParseError> for ZkAuthError {
    fn from(value: FrParseError) -> Self {
        Self::AllInputHashError(value)
    }
}

impl From<SynthesisError> for ZkAuthError {
    fn from(value: SynthesisError) -> Self {
        Self::GeneralError(value)
    }
}
