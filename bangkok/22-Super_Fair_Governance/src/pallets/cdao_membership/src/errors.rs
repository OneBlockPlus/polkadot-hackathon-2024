use frame_support::pallet_macros::pallet_section;

/// Defines the errors that can occur within the pallet.
/// These errors can be imported into the pallet using [`import_section`].
#[pallet_section]
mod errors {
    /// Defines the error types for the pallet.
    #[pallet::error]
    pub enum Error<T> {
        /// Indicates that a membership was not found in the system.
        MembershipNotFound,
        /// member is exist
        MemAlreadyExists,
       // not prime id
        NOTPRIMID, 
        /// Indicates that the provided name is too long.
        NameTooLong,
        InvalidName, // invalid name /// Indicates that the maximum number of memberships has been exceeded.
        MaxMembershipsExceeded,
        InsufficientEquity,//   
        Overflow,//   
    }
}