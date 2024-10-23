pub type StoreResult<T> = Result<T, StoreError>;

#[derive(Debug, Eq, PartialEq, thiserror::Error)]
pub enum StoreError {
    #[error("Account is already registered for kv store: '{0}'")]
    AccountRegistered(String),
    #[error("Account is not registered for kv store: '{0}'")]
    AccountUnregistered(String),
    #[error("The domain is already taken: '{0}'")]
    DomainAlreadyTaken(String),
    #[error("You already have a domain: '{0}'")]
    DomainAlreadyRegistered(String),
    #[error("You have not a domain: '{0}'")]
    DomainNotRegistered(String),
    /// Database error.
    #[error("Database error: {0}")]
    Db(String),
    #[error("Codec error: {0}")]
    Codec(#[from] codec::Error),
    // #[error("Database error: {0}")]
    // ParityDb(#[from] parity_db::Error)
}
