// lib.rs
#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;
pub mod weights;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{
        pallet_prelude::*,
        traits::{Currency, ReservableCurrency},
        Blake2_128Concat,
    };
    use frame_system::pallet_prelude::*;
    use scale_info::TypeInfo;
    use sp_std::prelude::*;
    use crate::weights::WeightInfo;

    // Chain Identifier structure
    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
    pub struct ChainIdentifier {
        pub chain_name: BoundedVec<u8, ConstU32<32>>,
        pub chain_id: u32,
        pub address: BoundedVec<u8, ConstU32<64>>,
    }

    // Public Key structure
    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
    pub struct PublicKey {
        pub id: BoundedVec<u8, ConstU32<32>>,
        pub key_type: KeyType,
        pub key_data: BoundedVec<u8, ConstU32<256>>,
    }

    // Service structure
    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
    pub struct Service {
        pub id: BoundedVec<u8, ConstU32<32>>,
        pub service_type: BoundedVec<u8, ConstU32<32>>,
        pub endpoint: BoundedVec<u8, ConstU32<128>>,
    }

    // Key types
    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
    pub enum KeyType {
        Ed25519,
        Sr25519,
        Secp256k1,
        X25519,
    }

    // DID Document structure
    #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
    #[scale_info(skip_type_params(T))]
    pub struct DidDocument<T: Config> {
        pub controller: T::AccountId,
        pub chains: BoundedVec<ChainIdentifier, T::MaxLinkedChains>,
        pub public_keys: BoundedVec<PublicKey, T::MaxPublicKeys>,
        pub services: BoundedVec<Service, T::MaxServices>,
    }

    #[pallet::config]
    pub trait Config: frame_system::Config {
        /// The overarching event type.
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        
        /// The currency type for reserve operations.
        type Currency: ReservableCurrency<Self::AccountId>;
        
        /// Maximum number of chains that can be linked to a DID
        #[pallet::constant]
        type MaxLinkedChains: Get<u32>;
        
        /// Maximum number of public keys per DID
        #[pallet::constant]
        type MaxPublicKeys: Get<u32>;
        
        /// Maximum number of services per DID
        #[pallet::constant]
        type MaxServices: Get<u32>;
        
        /// Weight information for extrinsics in this pallet.
        type WeightInfo: WeightInfo;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::storage]
    #[pallet::getter(fn did_documents)]
    pub type DidDocuments<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        DidDocument<T>,
        OptionQuery,
    >;

    #[pallet::storage]
    #[pallet::getter(fn chain_addresses)]
    pub type ChainAddresses<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        u32, // chain_id
        Blake2_128Concat,
        BoundedVec<u8, ConstU32<64>>, // address
        T::AccountId,
        OptionQuery,
    >;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// A new DID Document has been created
        DidDocumentCreated {
            did: T::AccountId,
            controller: T::AccountId,
        },
        /// A new chain has been linked to a DID
        ChainLinked {
            did: T::AccountId,
            chain_id: u32,
            address: Vec<u8>,
        },
        /// A chain has been unlinked from a DID
        ChainUnlinked {
            did: T::AccountId,
            chain_id: u32,
        },
    }

    #[pallet::error]
    pub enum Error<T> {
        /// DID Document was not found
        DidDocumentNotFound,
        /// DID Document already exists
        DidDocumentAlreadyExists,
        /// Chain is already linked to this DID
        ChainAlreadyLinked,
        /// Chain is not linked to this DID
        ChainNotLinked,
        /// Maximum number of linked chains reached
        TooManyLinkedChains,
        /// Maximum number of public keys reached
        TooManyPublicKeys,
        /// Maximum number of services reached
        TooManyServices,
        /// Invalid chain address format
        InvalidChainAddress,
        /// Not the controller of the DID Document
        NotDocumentController,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::call_index(0)]
        #[pallet::weight(T::WeightInfo::create_did())]
        pub fn create_did(origin: OriginFor<T>) -> DispatchResult {
            let who = ensure_signed(origin)?;
            
            ensure!(!DidDocuments::<T>::contains_key(&who), Error::<T>::DidDocumentAlreadyExists);
            
            let document = DidDocument {
                controller: who.clone(),
                chains: BoundedVec::default(),
                public_keys: BoundedVec::default(),
                services: BoundedVec::default(),
            };
            
            DidDocuments::<T>::insert(&who, document);
            
            Self::deposit_event(Event::DidDocumentCreated { 
                did: who.clone(),
                controller: who,
            });
            
            Ok(())
        }

        #[pallet::call_index(1)]
        #[pallet::weight(T::WeightInfo::link_chain())]
        pub fn link_chain(
            origin: OriginFor<T>,
            chain_name: Vec<u8>,
            chain_id: u32,
            address: Vec<u8>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            
            let mut document = DidDocuments::<T>::get(&who)
                .ok_or(Error::<T>::DidDocumentNotFound)?;
            
            ensure!(document.controller == who, Error::<T>::NotDocumentController);
            
            let chain_name = BoundedVec::try_from(chain_name)
                .map_err(|_| Error::<T>::InvalidChainAddress)?;
            
            let address = BoundedVec::try_from(address)
                .map_err(|_| Error::<T>::InvalidChainAddress)?;
            
            let chain_identifier = ChainIdentifier {
                chain_name,
                chain_id,
                address: address.clone(),
            };
            
            ensure!(
                !document.chains.iter().any(|c| c.chain_id == chain_id),
                Error::<T>::ChainAlreadyLinked
            );
            
            document.chains
                .try_push(chain_identifier)
                .map_err(|_| Error::<T>::TooManyLinkedChains)?;
            
            ChainAddresses::<T>::insert(chain_id, &address, &who);
            DidDocuments::<T>::insert(&who, document);
            
            Self::deposit_event(Event::ChainLinked {
                did: who,
                chain_id,
                address: address.to_vec(),
            });
            
            Ok(())
        }

        #[pallet::call_index(2)]
        #[pallet::weight(T::WeightInfo::unlink_chain())]
        pub fn unlink_chain(
            origin: OriginFor<T>,
            chain_id: u32,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            
            let mut document = DidDocuments::<T>::get(&who)
                .ok_or(Error::<T>::DidDocumentNotFound)?;
            
            ensure!(document.controller == who, Error::<T>::NotDocumentController);
            
            if let Some(index) = document.chains.iter().position(|c| c.chain_id == chain_id) {
                let chain = document.chains.remove(index);
                ChainAddresses::<T>::remove(chain_id, &chain.address);
                
                DidDocuments::<T>::insert(&who, document);
                
                Self::deposit_event(Event::ChainUnlinked {
                    did: who,
                    chain_id,
                });
                
                Ok(())
            } else {
                Err(Error::<T>::ChainNotLinked.into())
            }
        }
    }
}