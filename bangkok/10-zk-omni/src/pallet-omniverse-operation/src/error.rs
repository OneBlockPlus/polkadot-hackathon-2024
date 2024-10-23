#[derive(Clone, PartialEq, Eq, Debug)]
pub enum VerifyError {
	IncorrectRecorverID,
	IncorrectSignature,
	IncorrectPublicKey,
	NoFeeInputs,
}
