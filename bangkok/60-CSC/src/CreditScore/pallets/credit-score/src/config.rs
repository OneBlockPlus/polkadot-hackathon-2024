use frame_support::pallet_macros::pallet_section;

/// A [`pallet_section`] that defines the errors for a pallet.
/// This can later be imported into the pallet using [`import_section`].
#[pallet_section]
mod config {
    /// The pallet's configuration trait.
	///
	/// All our types and constants a pallet depends on must be declared here.
	/// These types are defined generically and made concrete when the pallet is declared in the
	/// `runtime/src/lib.rs` file of your chain.
	#[pallet::config]
	pub trait Config: CreateSignedTransaction<Call<Self>> + frame_system::Config  {
		/// The overarching runtime event type.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		/// A type representing the weights required by the dispatchables of this pallet.
		type WeightInfo: WeightInfo;
		/// A random value generator.
		// type Randomness: Randomness<Self::Hash, BlockNumberFor<Self>>;
		type AuthorityId: AppCrypto<Self::Public, Self::Signature>;
		#[pallet::constant]
        type GracePeriod: Get<BlockNumberFor<Self>>;
		#[pallet::constant]
		type MaximumOwned: Get<u32>;
	}
}