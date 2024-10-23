#![cfg_attr(not(feature = "std"), no_std)]

pub use codec::{Decode, Encode, MaxEncodedLen};
pub use common::BoundedString;
pub use frame_support::pallet_prelude::Get;
pub use frame_support::sp_runtime::traits::AccountIdConversion;
pub use frame_support::traits::Currency;
pub use frame_support::traits::ExistenceRequirement;
pub use hex_literal::hex;
pub use pallet::*;
pub use scale_info::prelude::format;
pub use sp_core::{blake2_256, sr25519, Pair, Public, H256};
pub use sp_runtime::AccountId32;
pub use sp_std::collections::btree_map::BTreeMap;
pub use sp_std::collections::btree_set::BTreeSet;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

mod benchmarking;

pub mod weights;
pub use weights::WeightInfo;

/// Global data structures
// Project Validator / Project Owner data structure
#[derive(Encode, Decode, Default, PartialEq, Eq, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(Debug))]
#[scale_info(skip_type_params(IPFSLength))]
pub struct ProjectValidatorOrProjectOwnerInfo<IPFSLength: Get<u32>, BlockNumber> {
    // IPFS link to PV/PO documentation
    documentation_ipfs: BoundedString<IPFSLength>,
    // Penalty level
    penalty_level: u8,
    // Penalty timeout
    penalty_timeout: BlockNumber,
}

// Carbon Footprint account data structure
#[derive(Encode, Decode, Default, PartialEq, Eq, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(Debug))]
#[scale_info(skip_type_params(IPFSLength))]
pub struct CarbonFootprintAccountInfo<MomentOf, IPFSLength: Get<u32>, BalanceOf> {
    // IPFS links to CFA documentation
    documentation_ipfses: BTreeSet<BoundedString<IPFSLength>>,
    // Carbon footprint surplus
    carbon_footprint_surplus: BalanceOf,
    // Carbon footprint deficit
    carbon_footprint_deficit: BalanceOf,
    // Creation date
    creation_date: MomentOf,
}

// Carbon Footprint report data structure
#[derive(Encode, Decode, Default, Clone, PartialEq, Eq, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(Debug))]
pub struct CarbonFootprintReportInfo<AccountIdOf, MomentOf, BalanceOf> {
    // Carbon footprint account
    cf_account: AccountIdOf,
    // Creation date
    creation_date: MomentOf,
    // Carbon footprint surplus
    carbon_footprint_surplus: BalanceOf,
    // Carbon footprint deficit
    carbon_footprint_deficit: BalanceOf,
    // Votes for
    votes_for: BTreeSet<AccountIdOf>,
    // Votes against
    votes_against: BTreeSet<AccountIdOf>,
    // Voting status
    voting_active: bool,
}

// Project Proposal info structure
#[derive(Encode, Decode, Clone, Default, PartialEq, Eq, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(Debug))]
pub struct ProjectProposalInfo<AccountIdOf, MomentOf> {
    // Project owner
    project_owner: AccountIdOf,
    // Creation date
    creation_date: MomentOf,
    // Project hash
    project_hash: H256,
    // Votes for
    votes_for: BTreeSet<AccountIdOf>,
    // Votes against
    votes_against: BTreeSet<AccountIdOf>,
    // Voting status
    voting_active: bool,
}

// Carbon Credit Batch Proposal info structure
#[derive(Encode, Decode, Clone, Default, PartialEq, Eq, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(Debug))]
pub struct CarbonCreditBatchProposalInfo<MomentOf, BalanceOf, AccountIdOf> {
    // Project hash
    project_hash: H256,
    // Carbon credit batch hash
    batch_hash: H256,
    // Creation date
    creation_date: MomentOf,
    // Carbon credit amount
    credit_amount: BalanceOf,
    // Penalty repay price (per credit)
    penalty_repay_price: BalanceOf,
    // Votes for
    votes_for: BTreeSet<AccountIdOf>,
    // Votes against
    votes_against: BTreeSet<AccountIdOf>,
    // Voting status
    voting_active: bool,
}

// Projects info structure
#[derive(Encode, Decode, Clone, Default, PartialEq, Eq, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(Debug))]
#[scale_info(skip_type_params(IPFSLength))]
pub struct ProjectInfo<IPFSLength: Get<u32>, AccountIdOf, MomentOf, BlockNumber> {
    // IPFS link to project documentation
    documentation_ipfs: BoundedString<IPFSLength>,
    // Project owner
    project_owner: AccountIdOf,
    // Creation date
    creation_date: MomentOf,
    // Penalty level
    penalty_level: u8,
    // Penalty timeout
    penalty_timeout: BlockNumber,
}

// Carbon credit batch info structure
#[derive(Encode, Decode, Clone, PartialEq, Eq, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(Debug))]
#[scale_info(skip_type_params(IPFSLength))]
pub struct CarbonCreditBatchInfo<
    IPFSLength: Get<u32>,
    MomentOf,
    BalanceOf,
    CarbonCreditBatchStatus,
    AccountId,
> {
    // IPFS link to CFA documentation
    documentation_ipfs: BoundedString<IPFSLength>,
    // Project hash
    project_hash: H256,
    // Creation date
    creation_date: MomentOf,
    // Carbon credit amount
    credit_amount: BalanceOf,
    // Penalty repay price (per credit)
    penalty_repay_price: BalanceOf,
    // Batch status
    status: CarbonCreditBatchStatus,
    // Validator benefactors
    validator_benefactors: BTreeSet<AccountId>,
}

// Carbon credit holding info structure
#[derive(Encode, Decode, Default, Clone, PartialEq, Eq, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(Debug))]
pub struct CarbonCreditHoldingsInfo<BalanceOf> {
    // Amount of available tokens for sale and retirment
    available_amount: BalanceOf,
    // Amount of unavailable tokens that are currently in a sales cycle
    unavailable_amount: BalanceOf,
}

// Carbon credit sale info structure
#[derive(Encode, Decode, Default, Clone, PartialEq, Eq, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(Debug))]
pub struct CarbonCreditSaleOrderInfo<BalanceOf, AccountIdOf, BlockNumber> {
    // Carbon credit batch hash
    batch_hash: H256,
    // Amount of credit being sold
    credit_amount: BalanceOf,
    // Price of 1 credit
    credit_price: BalanceOf,
    // Seller account ID
    seller: AccountIdOf,
    // Buyer account ID
    buyer: AccountIdOf,
    // Sale status
    sale_active: bool,
    // Sale timeout
    sale_timeout: BlockNumber,
}

// Penalty level structure for carbon footprint
#[derive(Encode, Decode, Default, PartialEq, Eq, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(Debug))]
pub struct PenaltyLevelConfig<BalanceOf> {
    pub level: u8,       // Penalty level
    pub base: BalanceOf, // Balance
}

// Proportion structure (used for vote ratio calculations)
#[derive(Encode, Decode, Default, PartialEq, Eq, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(Debug))]
pub struct ProportionStructure {
    // Explanation:
    // Let's consider that we have the 3/4 proportion, we will say that the upper limit part of this
    // proportion is the number 4 while the proportion part is the number 3.
    //
    // Example:
    // Let's say that we need 3/4 of the total number of votes in order for a proposal to pass, this means
    // that we need 75% (0.75) vote in order for our vote to pass. Let's now say that there was a total of a 100
    // votes. In order to calculate this proportion without using a float point number for the proportion, we can
    // first multiply the total votes by the proportion part of our proportion (100 * 3 = 300) and then devide it by
    // the upper limit part of out proportion (300 / 4 = 75) which will give us the exact proportion that we need
    pub proportion_part: u16,
    pub upper_limit_part: u16,
}

// Vote type enum
#[derive(Encode, Decode, PartialEq, Eq, scale_info::TypeInfo, Clone)]
#[cfg_attr(feature = "std", derive(Debug))]
pub enum VoteType {
    CarbonFootprintReportVote,
    ProjectProposalVote,
    CarbonCreditBatchVote,
    ComplaintVote,
}

// Carbon credit batch status
#[derive(Encode, Decode, PartialEq, Eq, scale_info::TypeInfo, Clone)]
#[cfg_attr(feature = "std", derive(Debug))]
pub enum CarbonCreditBatchStatus {
    Active,   // Tokens can be traded and retired
    Frozen,   // Tokens can't be traded or retired
    Redacted, // Tokens have been removed from circulation
}

// Fee types
#[derive(Encode, Decode, PartialEq, Eq, scale_info::TypeInfo, Clone)]
#[cfg_attr(feature = "std", derive(Debug))]
pub enum FeeType {
    TraderAccountFee,           // Trader acccount registration fee
    ProjectValidatorAccountFee, // Project validator account registration fee
    ProjectOwnerAccountFee,     // Project owner account registration fee
    CarbonFootprintReportFee,   // Carbon footprint report submition fee
    ProjectProposalFee,         // Project proposal fee
    CarbonCreditBatchFee,       // Carbon credit batch proposition fee
    VotingFee,                  // Voting fee
    ComplaintFee,               // Complaint proposal fee
}

// Fee values
#[derive(Encode, Decode, Default, PartialEq, Eq, scale_info::TypeInfo, Clone)]
#[cfg_attr(feature = "std", derive(Debug))]
pub struct FeeValues<BalanceOf> {
    // Trader acccount registration fee
    trader_account_fee: BalanceOf,
    // Project validator account registration fee
    project_validator_account_fee: BalanceOf,
    // Project owner account registration fee
    project_owner_account_fee: BalanceOf,
    // Carbon footprint report submition fee
    carbon_footprint_report_fee: BalanceOf,
    // Project proposal fee
    project_proposal_fee: BalanceOf,
    // Carbon credit batch proposition fee
    carbon_credit_batch_fee: BalanceOf,
    // Voting fee
    voting_fee: BalanceOf,
    // Complaint proposal fee
    complaint_fee: BalanceOf,
}

// Time type
#[derive(Encode, Decode, PartialEq, Eq, scale_info::TypeInfo, Clone)]
#[cfg_attr(feature = "std", derive(Debug))]
pub enum TimeType {
    NumberOfBlocksYearly,
    PalletBaseTime,
    PenaltyTimeout,
    VotingTimeout,
    SalesTimeout,
}

// Time values (in blocks)
#[derive(Encode, Decode, Default, PartialEq, Eq, scale_info::TypeInfo, Clone)]
#[cfg_attr(feature = "std", derive(Debug))]
pub struct TimeValues<BlockNumber> {
    number_of_blocks_per_year: BlockNumber,
    pallet_base_time: BlockNumber,
    penalty_timeout: BlockNumber,
    voting_timeout: BlockNumber,
    sales_timeout: BlockNumber,
}

// Complaint type
#[derive(Encode, Decode, PartialEq, Eq, scale_info::TypeInfo, Clone)]
#[cfg_attr(feature = "std", derive(Debug))]
pub enum ComplaintType {
    ProjectComplaint,           // Complaint made for a project
    CarbonCreditBatchComplaint, // Complaint made for a carbon credit batch
    ValidatorComplaint,         // Complaint made for a validator
    ProjectOwnerComplaint,      // Complaint made for a project owner
}

// Complaint info structure (for AccountID based entities)
#[derive(Encode, Decode, PartialEq, Eq, scale_info::TypeInfo, Clone)]
#[cfg_attr(feature = "std", derive(Debug))]
pub struct ComplaintAccountBasedInfo<AccountIdOf, MomentOf> {
    complaint_proposer: AccountIdOf,
    complaint_type: ComplaintType,
    complaint_for: AccountIdOf,
    creation_date: MomentOf,
    votes_for: BTreeSet<AccountIdOf>,
    votes_against: BTreeSet<AccountIdOf>,
    complaint_active: bool,
}

// Complaint info structure (for hash based entities)
#[derive(Encode, Decode, PartialEq, Eq, scale_info::TypeInfo, Clone)]
#[cfg_attr(feature = "std", derive(Debug))]
pub struct ComplaintHashBasedInfo<AccountIdOf, MomentOf> {
    complaint_proposer: AccountIdOf,
    complaint_type: ComplaintType,
    complaint_for: H256,
    creation_date: MomentOf,
    votes_for: BTreeSet<AccountIdOf>,
    votes_against: BTreeSet<AccountIdOf>,
    complaint_active: bool,
}

// Carbon credit retirement info structure (only for CFAs)
#[derive(Encode, Decode, Default, PartialEq, Eq, scale_info::TypeInfo, Clone)]
#[cfg_attr(feature = "std", derive(Debug))]
pub struct CarbonCreditRetirementInfo<AccountIdOf, BalanceOf, MomentOf> {
    carbon_footprint_account: AccountIdOf,
    batch_hash: H256,
    credit_amount: BalanceOf,
    retirement_date: MomentOf,
}

#[frame_support::pallet]
pub mod pallet {
    use super::*;
    use frame_support::pallet_prelude::*;
    use frame_support::traits::ReservableCurrency;
    use frame_support::traits::Time;
    use frame_support::PalletId;
    use frame_system::offchain::{SendTransactionTypes, SubmitTransaction};
    use frame_system::pallet_prelude::*;
    use log::{info, warn};
    use sp_std::collections::btree_set::BTreeSet;

    const PALLET_ID: PalletId = PalletId(*b"velesplt");

    #[pallet::pallet]
    #[pallet::without_storage_info]
    pub struct Pallet<T>(_);

    /// Pallet configuration
    #[pallet::config]
    pub trait Config: frame_system::Config + SendTransactionTypes<Call<Self>> {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        type IPFSLength: Get<u32>;
        type BlockFinalizationTime: Get<u32>;
        type Time: Time;
        type Currency: ReservableCurrency<Self::AccountId>;
        type WeightInfo: WeightInfo;

        #[pallet::constant]
        type UnsignedPriority: Get<TransactionPriority>;
        type UnsignedLongevity: Get<u64>;
    }

    /// Pallet types and constants
    pub type AccountIdOf<T> = <T as frame_system::Config>::AccountId;
    pub type MomentOf<T> = <<T as Config>::Time as Time>::Moment;
    pub type BlockNumber<T> = BlockNumberFor<T>;
    pub type BalanceOf<T> = <<T as Config>::Currency as Currency<AccountIdOf<T>>>::Balance;

    // Default authority accounts
    #[pallet::type_value]
    pub fn DefaultForAuthorityAccounts<T: Config>() -> BTreeSet<AccountIdOf<T>> {
        let mut set: BTreeSet<AccountIdOf<T>> = BTreeSet::<AccountIdOf<T>>::new();

        let account_bytes_1 =
            hex!("d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d"); // Alice
        let account_1 = AccountIdOf::<T>::decode(&mut &account_bytes_1[..]).unwrap();

        set.insert(account_1);

        set
    }

    // Default trade accounts
    #[pallet::type_value]
    pub fn DefaultForTraderAccounts<T: Config>() -> BTreeSet<AccountIdOf<T>> {
        let mut set: BTreeSet<AccountIdOf<T>> = BTreeSet::<AccountIdOf<T>>::new();

        let account_bytes_1 =
            hex!("8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48"); // Bob
        let account_1 = AccountIdOf::<T>::decode(&mut &account_bytes_1[..]).unwrap();

        set.insert(account_1);

        let account_bytes_2 =
            hex!("90b5ab205c6974c9ea841be688864633dc9ca8a357843eeacf2314649965fe22"); // Charlie
        let account_2 = AccountIdOf::<T>::decode(&mut &account_bytes_2[..]).unwrap();

        set.insert(account_2);

        set
    }

    // Default values for all fees
    #[pallet::type_value]
    pub fn DefaultForPalletFeeValues<T: Config>() -> FeeValues<BalanceOf<T>> {
        let fee_values: FeeValues<BalanceOf<T>> = FeeValues {
            trader_account_fee: BalanceOf::<T>::from(100u32),
            project_validator_account_fee: BalanceOf::<T>::from(100u32),
            project_owner_account_fee: BalanceOf::<T>::from(100u32),
            carbon_footprint_report_fee: BalanceOf::<T>::from(300u32),
            project_proposal_fee: BalanceOf::<T>::from(100u32),
            carbon_credit_batch_fee: BalanceOf::<T>::from(50u32),
            voting_fee: BalanceOf::<T>::from(100u32),
            complaint_fee: BalanceOf::<T>::from(100u32),
        };

        fee_values
    }

    // Default values for all timeouts/block values
    #[pallet::type_value]
    pub fn DefaultForPalletTimeValues<T: Config>() -> TimeValues<BlockNumber<T>> {
        let block_finalization_time: u32 = T::BlockFinalizationTime::get().into();

        let seconds_in_year: u32 = 365 * 24 * 60 * 60;
        let seconds_in_month: u32 = 31 * 24 * 60 * 60;
        let seconds_in_week: u32 = 7 * 24 * 60 * 60;

        let blocks_in_year = seconds_in_year / block_finalization_time;
        let blocks_in_month = seconds_in_month / block_finalization_time;
        let blocks_in_week = seconds_in_week / block_finalization_time;

        let pallet_time_values: TimeValues<BlockNumber<T>> = TimeValues {
            number_of_blocks_per_year: BlockNumber::<T>::from(blocks_in_year),
            pallet_base_time: BlockNumber::<T>::from(0u32),
            penalty_timeout: BlockNumber::<T>::from(blocks_in_month),
            voting_timeout: BlockNumber::<T>::from(blocks_in_week),
            sales_timeout: BlockNumber::<T>::from(blocks_in_week),
        };

        pallet_time_values
    }

    // Default value for voting ratio needed for a vote to pass
    // Note: If the upper_limit_part is set to 0 then we will consider that we only need a
    // 1 vote difference to decide what is the outcome of the vote. If we set the proportion_part to
    // a number that is equal to the upper_limit_part or that is greater then it then we will need
    // a 100% of votes in order to made a passing/non passing decision
    #[pallet::type_value]
    pub fn DefaultForVotePassRatio<T: Config>() -> ProportionStructure {
        let mut proportion_part: u16 = 2;
        let upper_limit_part: u16 = 3;

        if upper_limit_part == 0 {
            proportion_part = 0;
        } else if proportion_part >= upper_limit_part {
            proportion_part = upper_limit_part;
        }

        let pass_voting_ratio = ProportionStructure {
            proportion_part,
            upper_limit_part,
        };

        pass_voting_ratio
    }

    // Default value for penalty levels
    #[pallet::type_value]
    pub fn DefaultForPenaltyLevels<T: Config>() -> BTreeMap<u8, BalanceOf<T>> {
        let mut penalty_levels = BTreeMap::<u8, BalanceOf<T>>::new();

        penalty_levels.insert(0u8, BalanceOf::<T>::from(10000u32));
        penalty_levels.insert(1u8, BalanceOf::<T>::from(16700u32));
        penalty_levels.insert(2u8, BalanceOf::<T>::from(23000u32));
        penalty_levels.insert(3u8, BalanceOf::<T>::from(27550u32));
        penalty_levels.insert(4u8, BalanceOf::<T>::from(32000u32));

        penalty_levels
    }

    // Default value for penalty levels
    #[pallet::type_value]
    pub fn DefaultForBeneficiarySplits<T: Config>() -> BTreeMap<u8, BalanceOf<T>> {
        let mut beneficiary_splits = BTreeMap::<u8, BalanceOf<T>>::new();

        // Add beneficiary percentage for validators (only initial sale)
        beneficiary_splits.insert(0u8, BalanceOf::<T>::from(4500u32));
        // Add beneficiary percentage for validators (only secondary sale)
        beneficiary_splits.insert(1u8, BalanceOf::<T>::from(3500u32));
        // Add beneficiary percentage for project owner (only secondary sale)
        beneficiary_splits.insert(2u8, BalanceOf::<T>::from(1000u32));

        beneficiary_splits
    }

    /// Pallet storages
    // Fee values
    #[pallet::storage]
    #[pallet::getter(fn pallet_fee_values)]
    pub type PalletFeeValues<T: Config> =
        StorageValue<_, FeeValues<BalanceOf<T>>, ValueQuery, DefaultForPalletFeeValues<T>>;

    // Time values
    #[pallet::storage]
    #[pallet::getter(fn pallet_time_values)]
    pub type PalletTimeValues<T: Config> =
        StorageValue<_, TimeValues<BlockNumber<T>>, ValueQuery, DefaultForPalletTimeValues<T>>;

    // Pass voting ratio
    #[pallet::storage]
    #[pallet::getter(fn vote_pass_ratio)]
    pub type VotePassRatio<T: Config> =
        StorageValue<_, ProportionStructure, ValueQuery, DefaultForVotePassRatio<T>>;

    // Penalty levels
    #[pallet::storage]
    #[pallet::getter(fn penalty_levels)]
    pub type PenaltyLevels<T: Config> =
        StorageValue<_, BTreeMap<u8, BalanceOf<T>>, ValueQuery, DefaultForPenaltyLevels<T>>;

    // Beneficiary splits
    #[pallet::storage]
    #[pallet::getter(fn beneficiary_splits)]
    pub type BeneficiarySplits<T: Config> =
        StorageValue<_, BTreeMap<u8, BalanceOf<T>>, ValueQuery, DefaultForBeneficiarySplits<T>>;

    // Authority accounts
    #[pallet::storage]
    #[pallet::getter(fn authority_accounts)]
    pub type AuthorityAccounts<T: Config> =
        StorageValue<_, BTreeSet<AccountIdOf<T>>, ValueQuery, DefaultForAuthorityAccounts<T>>;

    // Carbon Footprint accounts
    #[pallet::storage]
    #[pallet::getter(fn carbon_footprint_accounts)]
    pub(super) type CarbonFootprintAccounts<T: Config> = StorageMap<
        _,
        Identity,
        AccountIdOf<T>,
        CarbonFootprintAccountInfo<MomentOf<T>, T::IPFSLength, BalanceOf<T>>,
        OptionQuery,
    >;

    // Trader accounts
    #[pallet::storage]
    #[pallet::getter(fn trader_accounts)]
    pub type TraderAccounts<T: Config> =
        StorageValue<_, BTreeSet<AccountIdOf<T>>, ValueQuery, DefaultForTraderAccounts<T>>;

    // Validator accounts
    #[pallet::storage]
    #[pallet::getter(fn validators)]
    pub(super) type Validators<T: Config> = StorageMap<
        _,
        Identity,
        AccountIdOf<T>,
        ProjectValidatorOrProjectOwnerInfo<T::IPFSLength, BlockNumber<T>>,
        OptionQuery,
    >;

    // Project Owner accounts
    #[pallet::storage]
    #[pallet::getter(fn project_owners)]
    pub(super) type ProjectOwners<T: Config> = StorageMap<
        _,
        Identity,
        AccountIdOf<T>,
        ProjectValidatorOrProjectOwnerInfo<T::IPFSLength, BlockNumber<T>>,
        OptionQuery,
    >;

    // Projects
    #[pallet::storage]
    #[pallet::getter(fn projects)]
    pub(super) type Projects<T: Config> = StorageMap<
        _,
        Identity,
        H256,
        ProjectInfo<T::IPFSLength, AccountIdOf<T>, MomentOf<T>, BlockNumber<T>>,
        OptionQuery,
    >;

    // Carbon credit batches
    #[pallet::storage]
    #[pallet::getter(fn carbon_credit_batches)]
    pub(super) type CarbonCreditBatches<T: Config> = StorageMap<
        _,
        Identity,
        H256,
        CarbonCreditBatchInfo<
            T::IPFSLength,
            MomentOf<T>,
            BalanceOf<T>,
            CarbonCreditBatchStatus,
            AccountIdOf<T>,
        >,
        OptionQuery,
    >;

    // Carbon credit holdings
    #[pallet::storage]
    #[pallet::getter(fn carbon_credit_holdings)]
    pub(super) type CarbonCreditHoldings<T: Config> = StorageDoubleMap<
        _,
        Identity,
        H256,
        Identity,
        AccountIdOf<T>,
        CarbonCreditHoldingsInfo<BalanceOf<T>>,
        OptionQuery,
    >;

    // Carbon credit sale orders
    #[pallet::storage]
    #[pallet::getter(fn carbon_credit_sale_orders)]
    pub(super) type CarbonCreditSaleOrders<T: Config> = StorageMap<
        _,
        Identity,
        H256,
        CarbonCreditSaleOrderInfo<BalanceOf<T>, AccountIdOf<T>, BlockNumber<T>>,
        OptionQuery,
    >;

    // Complaints (for AccountID based entities)
    #[pallet::storage]
    #[pallet::getter(fn complaints_for_accounts)]
    pub(super) type ComplaintsForAccounts<T: Config> = StorageMap<
        _,
        Identity,
        BoundedString<T::IPFSLength>,
        ComplaintAccountBasedInfo<AccountIdOf<T>, MomentOf<T>>,
        OptionQuery,
    >;

    // Complaints (for hash based entities)
    #[pallet::storage]
    #[pallet::getter(fn complaints_for_hashes)]
    pub(super) type ComplaintsForHashes<T: Config> = StorageMap<
        _,
        Identity,
        BoundedString<T::IPFSLength>,
        ComplaintHashBasedInfo<AccountIdOf<T>, MomentOf<T>>,
        OptionQuery,
    >;

    // Project owner debts
    #[pallet::storage]
    #[pallet::getter(fn project_owner_debts)]
    pub(super) type ProjectOwnerDebts<T: Config> =
        StorageMap<_, Identity, AccountIdOf<T>, BTreeMap<AccountIdOf<T>, BalanceOf<T>>, ValueQuery>;

    // Penalty timeouts (for AccountID's)
    #[pallet::storage]
    #[pallet::getter(fn penalty_timeouts_accounts)]
    pub(super) type PenaltyTimeoutsAccounts<T: Config> =
        StorageMap<_, Identity, BlockNumber<T>, BTreeSet<AccountIdOf<T>>, OptionQuery>;

    // Penalty timeouts (for hashes)
    #[pallet::storage]
    #[pallet::getter(fn penalty_timeouts_hashes)]
    pub(super) type PenaltyTimeoutsHashes<T: Config> =
        StorageMap<_, Identity, BlockNumber<T>, BTreeSet<H256>, OptionQuery>;

    // Voting timeouts
    #[pallet::storage]
    #[pallet::getter(fn voting_timeouts)]
    pub(super) type VotingTimeouts<T: Config> = StorageMap<
        _,
        Identity,
        BlockNumber<T>,
        BTreeSet<BoundedString<T::IPFSLength>>,
        OptionQuery,
    >;

    // Sales timeouts
    #[pallet::storage]
    #[pallet::getter(fn sales_timeouts)]
    pub(super) type SaleOrderTimeouts<T: Config> =
        StorageMap<_, Identity, BlockNumber<T>, BTreeSet<H256>, OptionQuery>;

    // Complaint timeouts
    #[pallet::storage]
    #[pallet::getter(fn complaint_timeouts)]
    pub(super) type ComplaintTimeouts<T: Config> = StorageMap<
        _,
        Identity,
        BlockNumber<T>,
        BTreeSet<BoundedString<T::IPFSLength>>,
        OptionQuery,
    >;

    // Carbon footprint reports
    #[pallet::storage]
    #[pallet::getter(fn carbon_footprint_reports)]
    pub(super) type CarbonFootprintReports<T: Config> = StorageMap<
        _,
        Identity,
        BoundedString<T::IPFSLength>,
        CarbonFootprintReportInfo<AccountIdOf<T>, MomentOf<T>, BalanceOf<T>>,
        OptionQuery,
    >;

    // Projects proposals
    #[pallet::storage]
    #[pallet::getter(fn project_proposals)]
    pub(super) type ProjectProposals<T: Config> = StorageMap<
        _,
        Identity,
        BoundedString<T::IPFSLength>,
        ProjectProposalInfo<AccountIdOf<T>, MomentOf<T>>,
        OptionQuery,
    >;

    // Carbon Credit Batch proposals
    #[pallet::storage]
    #[pallet::getter(fn carbon_credit_batch_proposals)]
    pub(super) type CarbonCreditBatchProposals<T: Config> = StorageMap<
        _,
        Identity,
        BoundedString<T::IPFSLength>,
        CarbonCreditBatchProposalInfo<MomentOf<T>, BalanceOf<T>, AccountIdOf<T>>,
        OptionQuery,
    >;

    // Carbon credit retirements
    #[pallet::storage]
    #[pallet::getter(fn carbon_credit_retirements)]
    pub(super) type CarbonCreditRetirements<T: Config> = StorageMap<
        _,
        Identity,
        H256,
        CarbonCreditRetirementInfo<AccountIdOf<T>, BalanceOf<T>, MomentOf<T>>,
        OptionQuery,
    >;

    #[pallet::event]
    #[pallet::generate_deposit(pub (super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// Time Value Updated
        TimeValueUpdated(TimeType, BlockNumber<T>),
        /// Fee Value Updated
        FeeValueUpdated(FeeType, BalanceOf<T>),
        /// Vote Pass Ration Updated
        VotePassRatioUpdated(u16, u16),
        /// Trader Account Registered
        TraderAccountRegistered(AccountIdOf<T>),
        /// Project Validator Account Registered
        ProjectValidatorAccountRegistered(AccountIdOf<T>, BoundedString<T::IPFSLength>),
        /// Project Owner Account Registered
        ProjectOwnerAccountRegistered(AccountIdOf<T>, BoundedString<T::IPFSLength>),
        /// Successful Vote Cast
        SuccessfulVote(AccountIdOf<T>, BoundedString<T::IPFSLength>, VoteType, bool),
        /// Carbon Footprint Report Submitted
        CarbonFootprintReportSubmitted(AccountIdOf<T>, BoundedString<T::IPFSLength>),
        /// Successful Project Proposal Created
        ProjectProposalCreated(AccountIdOf<T>, BoundedString<T::IPFSLength>),
        /// Carbon Credit Batch Proposal Created
        CarbonCreditBatchProposalCreated(AccountIdOf<T>, BoundedString<T::IPFSLength>),
        /// Carbon Credit Sale Order Created
        CarbonCreditSaleOrderCreated(AccountIdOf<T>, H256, BalanceOf<T>, BalanceOf<T>),
        /// Carbon Credit Sale Order Completed
        CarbonCreditSaleOrderCompleted(AccountIdOf<T>, H256),
        /// Carbon Credit Sale Order Closed
        CarbonCreditSaleOrderClosed(AccountIdOf<T>, H256),
        // Account Complaint Opened
        AccountComplaintOpened(
            AccountIdOf<T>,
            AccountIdOf<T>,
            ComplaintType,
            BoundedString<T::IPFSLength>,
        ),
        // Hash Complaint Opened
        HashComplaintOpened(
            AccountIdOf<T>,
            H256,
            ComplaintType,
            BoundedString<T::IPFSLength>,
        ),
        /// Carbon Credits Have Been Retired
        CarbonCreditsHaveBeenRetired(AccountIdOf<T>, H256, BalanceOf<T>),
        /// Project Owner Debts Have Been Repaid
        ProjectOwnerDebtsHaveBeenRepaid(AccountIdOf<T>),
        /// Penalty Levels Updated
        PenaltyLevelsUpdated(BTreeMap<u8, BalanceOf<T>>),
        /// Beneficiary Split Updated
        BeneficiarySplitsUpdated(BTreeMap<u8, BalanceOf<T>>),
        /// Base Pallet Time Updated
        BasePalletTimeUpdated(BlockNumber<T>),
        /// Carbon Footprint Report Updated
        CarbonFootprintReportUpdated(BoundedString<T::IPFSLength>),
        /// Project Proposal Updated
        ProjectProposalUpdated(BoundedString<T::IPFSLength>),
        /// Carbon Credit Batch Proposal Updated
        CarbonCreditBatchProposalUpdated(BoundedString<T::IPFSLength>),
        /// Carbon Credit Sale Order Updated
        CarbonCreditSaleOrderUpdated(H256),
        /// Account Complaint Updated
        AccountComplaintUpdated(BoundedString<T::IPFSLength>),
        /// Hash Complaint Updated
        HashComplaintUpdated(BoundedString<T::IPFSLength>),
        /// Project Owner Penalty Level Updated
        ProjectOwnerPenaltyLevelUpdated(AccountIdOf<T>),
        /// Validator Penalty Level Updated
        ValidatorPenaltyLevelUpdated(AccountIdOf<T>),
        /// Project Penalty Level Updated
        ProjectPenaltyLevelUpdated(H256),
    }

    #[pallet::error]
    pub enum Error<T> {
        /// Unable to change pallet base time
        UnableToChangePalletBaseTime,
        /// UpdatingToCurrentValue
        UpdatingToCurrentValue,
        /// Insufficient funds
        InsufficientFunds,
        /// Report not found
        CarbonFootprintReportNotFound,
        /// Not Authorized
        Unauthorized,
        /// Invalid timeout value
        InvalidTimeoutValue,
        /// Documentation (IPFS link) was used previously
        DocumentationWasUsedPreviously,
        /// Voting cycle is over
        VotingCycleIsOver,
        /// Vote already submitted
        VoteAlreadySubmitted,
        /// Project proposal already exists
        ProjectProposalAlreadyExists,
        /// Project Proposal not found
        ProjectProposalNotFound,
        /// Carbon credit batch proposal not found
        CarbonCreditBatchProposalNotFound,
        /// Complaint not found
        ComplaintNotFound,
        /// Wrong vote type
        WrongVoteType,
        /// Project doesn't exist
        ProjectDoesntExist,
        /// Account ID already in use
        AccountIdAlreadyInUse,
        /// Already submitted a CF report
        CarbonFootprintReportAlreadySubmitted,
        /// User is active in CF report voting cycle
        UserIsActiveInCarbonFootprintReportVotingCycle,
        /// User is not eligible for carbon credit transactions
        UserIsNotEligibleForCarbonCreditTransactions,
        /// Carbon credit batch does not exist
        CarbonCreditBatchDoesNotExist,
        /// Carbon credit batch is not active
        CarbonCreditBatchIsNotActive,
        /// Not enought available credits
        NotEnoughtAvailableCredits,
        /// Carbon credit sale order doesnt exist
        CarbonCreditSaleOrderDoesntExist,
        /// The buyer can't buy his own tokens
        BuyerCantBuyHisOwnTokens,
        /// User didn't create the sale order
        UserDidntCreateTheSaleOrder,
        /// User is not a registered validator
        UserIsNotARegisteredValidator,
        /// Unregistered Account ID
        UnregisteredAccountId,
        /// Unregistered Hash
        UnregisteredHash,
        /// Invalid Penalty Price Value
        InvalidPenaltyPriceValue,
        /// Invalid Carbon Footprint Values
        InvalidCarbonFootprintValues,
        /// Invalid Carbon Credit Amount
        InvalidCarbonCreditAmount,
        /// Carbon Credit Holding Don't Exist
        CarbonCreditHoldingsDontExist,
        /// Sale Order Is Not Active
        SaleOrderIsNotActive,
        /// Invalid Complaint Type
        InvalidComplaintType,
        /// User is not of a carbon footprint account type
        UserIsNotOfACarbonFootprintAccountType,
        /// Max potential penalty level exceeded
        MaxPotentialPenaltyLevelExceeded,
        /// Ongoing carbon batch complaint (only 1 complaint at a time)
        OngoingCarbonBatchComplaint,
        /// Project owner has standing debts
        ProjectOwnerHasStandingDebts,
        /// Project owner doesnt exist
        ProjectOwnerDoesntExist,
        /// Project owner doesnt have any debts
        ProjectOwnerDoesntHaveAnyDebts,
        /// Not all penalty levels have been submitted
        NotAllPenaltyLevelsHaveBeenSubmitted,
        /// Invalid penalty level value
        InvalidPenaltyLevelValue,
        /// Invalid beneficiary split values
        InvalidBeneficiarySplitValues,
        /// Invalid primary sale beneficiary split
        InvalidPrimarySaleBeneficiarySplit,
        /// Invalid secondary sale beneficiary split
        InvalidSecondarySaleBeneficiarySplit,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        // Update voting ratio
        #[pallet::call_index(0)]
        #[pallet::weight(<T as Config>::WeightInfo::update_vote_pass_ratio())]
        pub fn update_vote_pass_ratio(
            origin: OriginFor<T>,
            new_proportion_part: u16,
            new_upper_limit_part: u16,
        ) -> DispatchResultWithPostInfo {
            let user = ensure_signed(origin)?;

            // Check if caller is a Authority account
            ensure!(
                AuthorityAccounts::<T>::get().contains(&user.clone()),
                Error::<T>::Unauthorized
            );

            let mut temp_proportion_part = new_proportion_part;

            if new_upper_limit_part == 0 {
                temp_proportion_part = 0;
            } else if new_proportion_part >= new_upper_limit_part {
                temp_proportion_part = new_upper_limit_part;
            }

            let new_pass_voting_ratio = ProportionStructure {
                proportion_part: temp_proportion_part,
                upper_limit_part: new_upper_limit_part,
            };

            VotePassRatio::<T>::set(new_pass_voting_ratio);

            Self::deposit_event(Event::VotePassRatioUpdated(
                temp_proportion_part,
                new_upper_limit_part,
            ));

            Ok(().into())
        }

        // Update penalty levels
        #[pallet::call_index(1)]
        #[pallet::weight(<T as Config>::WeightInfo::update_penalty_levels())]
        pub fn update_penalty_levels(
            origin: OriginFor<T>,
            new_penalty_levels: BTreeMap<u8, BalanceOf<T>>,
        ) -> DispatchResultWithPostInfo {
            let user = ensure_signed(origin)?;

            // Check if caller is a Authority account
            ensure!(
                AuthorityAccounts::<T>::get().contains(&user.clone()),
                Error::<T>::Unauthorized
            );

            // Check if all penalty levels have been submitted
            ensure!(
                new_penalty_levels.len() == 5,
                Error::<T>::NotAllPenaltyLevelsHaveBeenSubmitted
            );

            // Check if all levels are given as a 5 number value
            for (level, value) in new_penalty_levels.iter() {
                ensure!(
                    (*value / BalanceOf::<T>::from(10000u32) > BalanceOf::<T>::from(0u32)
                        && *value / BalanceOf::<T>::from(10000u32) < BalanceOf::<T>::from(9u32)),
                    Error::<T>::InvalidPenaltyLevelValue
                );

                if *level == 4 {
                    continue;
                }

                // Check if levels are of a increasing order
                ensure!(
                    new_penalty_levels[&level] < new_penalty_levels[&(level + 1)],
                    Error::<T>::InvalidPenaltyLevelValue
                )
            }

            PenaltyLevels::<T>::set(new_penalty_levels.clone());

            Self::deposit_event(Event::PenaltyLevelsUpdated(new_penalty_levels));

            Ok(().into())
        }

        // Update beneficiary splits
        #[pallet::call_index(2)]
        #[pallet::weight(<T as Config>::WeightInfo::update_beneficiary_splits())]
        pub fn update_beneficiary_splits(
            origin: OriginFor<T>,
            new_beneficiary_splits: BTreeMap<u8, BalanceOf<T>>,
        ) -> DispatchResultWithPostInfo {
            // Note: The structure of the map is as follows:
            // 0 -> beneficiary split for validator during the initial sale
            // 1 -> beneficiary split for validator during the secondary sale
            // 2 -> beneficiary split for owners during the secondary sale

            // Note: Beneficiary splits can't exceed 50% (either inital or secondary sale)

            let user = ensure_signed(origin)?;

            // Check if caller is a Authority account
            ensure!(
                AuthorityAccounts::<T>::get().contains(&user.clone()),
                Error::<T>::Unauthorized
            );

            // Check if the user submitted an adequate beneficiary split map
            ensure!(
                new_beneficiary_splits.len() == 3,
                Error::<T>::InvalidBeneficiarySplitValues
            );

            // Check if the primary sale beneficiary split (for validators) exceeds 50%
            ensure!(
                new_beneficiary_splits[&0] <= BalanceOf::<T>::from(5000u32),
                Error::<T>::InvalidPrimarySaleBeneficiarySplit
            );

            // Check if the secondary sale beneficiary split (for validators and the project owner) exceeds 50%
            ensure!(
                new_beneficiary_splits[&1] + new_beneficiary_splits[&2]
                    <= BalanceOf::<T>::from(5000u32),
                Error::<T>::InvalidSecondarySaleBeneficiarySplit
            );

            BeneficiarySplits::<T>::set(new_beneficiary_splits.clone());

            Self::deposit_event(Event::BeneficiarySplitsUpdated(new_beneficiary_splits));

            Ok(().into())
        }

        // Update specific time value
        #[pallet::call_index(3)]
        #[pallet::weight(<T as Config>::WeightInfo::update_time_value())]
        pub fn update_time_value(
            origin: OriginFor<T>,
            time_type: TimeType,
            new_time_value: BlockNumber<T>,
        ) -> DispatchResultWithPostInfo {
            let user = ensure_signed(origin)?;

            // Check if caller is a Authority account
            ensure!(
                AuthorityAccounts::<T>::get().contains(&user.clone()),
                Error::<T>::Unauthorized
            );

            // Check if the user is trying to update the pallet base time
            ensure!(
                time_type != TimeType::PalletBaseTime,
                Error::<T>::UnableToChangePalletBaseTime
            );

            // Check if the new time value is not 0
            ensure!(
                new_time_value != BlockNumber::<T>::from(0u32),
                Error::<T>::InvalidTimeoutValue
            );

            let mut pallet_times = PalletTimeValues::<T>::get();

            match time_type {
                TimeType::NumberOfBlocksYearly => {
                    ensure!(
                        new_time_value != pallet_times.number_of_blocks_per_year,
                        Error::<T>::UpdatingToCurrentValue,
                    );

                    pallet_times = TimeValues {
                        number_of_blocks_per_year: new_time_value,
                        ..pallet_times
                    };
                }
                TimeType::PenaltyTimeout => {
                    ensure!(
                        new_time_value != pallet_times.penalty_timeout,
                        Error::<T>::UpdatingToCurrentValue,
                    );

                    pallet_times = TimeValues {
                        penalty_timeout: new_time_value,
                        ..pallet_times
                    };
                }
                TimeType::VotingTimeout => {
                    ensure!(
                        new_time_value != pallet_times.voting_timeout,
                        Error::<T>::UpdatingToCurrentValue,
                    );

                    pallet_times = TimeValues {
                        voting_timeout: new_time_value,
                        ..pallet_times
                    };
                }
                TimeType::SalesTimeout => {
                    ensure!(
                        new_time_value != pallet_times.sales_timeout,
                        Error::<T>::UpdatingToCurrentValue,
                    );

                    pallet_times = TimeValues {
                        sales_timeout: new_time_value,
                        ..pallet_times
                    };
                }
                _ => {}
            }

            PalletTimeValues::<T>::set(pallet_times);

            Self::deposit_event(Event::TimeValueUpdated(time_type, new_time_value));

            Ok(().into())
        }

        // Update specific fee value
        #[pallet::call_index(4)]
        #[pallet::weight(<T as Config>::WeightInfo::update_fee_value())]
        pub fn update_fee_value(
            origin: OriginFor<T>,
            fee_type: FeeType,
            new_fee_value: BalanceOf<T>,
        ) -> DispatchResultWithPostInfo {
            let user = ensure_signed(origin)?;

            // Check if caller is a Authority account
            ensure!(
                AuthorityAccounts::<T>::get().contains(&user.clone()),
                Error::<T>::Unauthorized
            );

            let mut pallet_fees = PalletFeeValues::<T>::get();

            match fee_type {
                FeeType::TraderAccountFee => {
                    ensure!(
                        new_fee_value != pallet_fees.trader_account_fee,
                        Error::<T>::UpdatingToCurrentValue,
                    );

                    pallet_fees = FeeValues {
                        trader_account_fee: new_fee_value,
                        ..pallet_fees
                    };
                }
                FeeType::ProjectValidatorAccountFee => {
                    ensure!(
                        new_fee_value != pallet_fees.project_validator_account_fee,
                        Error::<T>::UpdatingToCurrentValue,
                    );

                    pallet_fees = FeeValues {
                        project_validator_account_fee: new_fee_value,
                        ..pallet_fees
                    };
                }
                FeeType::ProjectOwnerAccountFee => {
                    ensure!(
                        new_fee_value != pallet_fees.project_owner_account_fee,
                        Error::<T>::UpdatingToCurrentValue,
                    );

                    pallet_fees = FeeValues {
                        project_owner_account_fee: new_fee_value,
                        ..pallet_fees
                    };
                }
                FeeType::CarbonFootprintReportFee => {
                    ensure!(
                        new_fee_value != pallet_fees.carbon_footprint_report_fee,
                        Error::<T>::UpdatingToCurrentValue,
                    );

                    pallet_fees = FeeValues {
                        carbon_footprint_report_fee: new_fee_value,
                        ..pallet_fees
                    };
                }
                FeeType::ProjectProposalFee => {
                    ensure!(
                        new_fee_value != pallet_fees.project_proposal_fee,
                        Error::<T>::UpdatingToCurrentValue,
                    );

                    pallet_fees = FeeValues {
                        project_proposal_fee: new_fee_value,
                        ..pallet_fees
                    };
                }
                FeeType::CarbonCreditBatchFee => {
                    ensure!(
                        new_fee_value != pallet_fees.carbon_credit_batch_fee,
                        Error::<T>::UpdatingToCurrentValue,
                    );

                    pallet_fees = FeeValues {
                        carbon_credit_batch_fee: new_fee_value,
                        ..pallet_fees
                    };
                }
                FeeType::VotingFee => {
                    ensure!(
                        new_fee_value != pallet_fees.voting_fee,
                        Error::<T>::UpdatingToCurrentValue,
                    );

                    pallet_fees = FeeValues {
                        voting_fee: new_fee_value,
                        ..pallet_fees
                    };
                }
                FeeType::ComplaintFee => {
                    ensure!(
                        new_fee_value != pallet_fees.complaint_fee,
                        Error::<T>::UpdatingToCurrentValue,
                    );

                    pallet_fees = FeeValues {
                        complaint_fee: new_fee_value,
                        ..pallet_fees
                    };
                }
            }

            PalletFeeValues::<T>::set(pallet_fees);

            Self::deposit_event(Event::FeeValueUpdated(fee_type, new_fee_value));

            Ok(().into())
        }

        // Register for a trader account
        #[pallet::call_index(5)]
        #[pallet::weight(<T as Config>::WeightInfo::register_for_trader_account())]
        pub fn register_for_trader_account(origin: OriginFor<T>) -> DispatchResultWithPostInfo {
            let user = ensure_signed(origin)?;

            // Check if the account is in use
            ensure!(
                Self::is_account_id_available(user.clone()),
                Error::<T>::AccountIdAlreadyInUse
            );

            // Check if the user is active in a CF report voting cycle
            ensure!(
                !Self::is_trying_to_register_as_cfa(user.clone()),
                Error::<T>::UserIsActiveInCarbonFootprintReportVotingCycle
            );

            // Check if caller has sufficient funds
            ensure!(
                PalletFeeValues::<T>::get().trader_account_fee
                    <= T::Currency::free_balance(&user.clone()),
                Error::<T>::InsufficientFunds
            );

            // Insert trader account
            let mut new_traders = TraderAccounts::<T>::get();
            new_traders.insert(user.clone());
            TraderAccounts::<T>::set(new_traders);

            // Transfer funds
            T::Currency::transfer(
                &user,
                &Self::pallet_id(),
                PalletFeeValues::<T>::get().trader_account_fee,
                ExistenceRequirement::KeepAlive,
            )?;

            // Deposit event
            Self::deposit_event(Event::TraderAccountRegistered(user.clone()));

            Ok(().into())
        }

        // Register for a project validator account
        #[pallet::call_index(6)]
        #[pallet::weight(<T as Config>::WeightInfo::register_for_project_validator_account())]
        pub fn register_for_project_validator_account(
            origin: OriginFor<T>,
            documentation_ipfs: BoundedString<T::IPFSLength>,
        ) -> DispatchResultWithPostInfo {
            let user = ensure_signed(origin)?;

            // Check if the account is in use
            ensure!(
                Self::is_account_id_available(user.clone()),
                Error::<T>::AccountIdAlreadyInUse
            );

            // Check if the user is active in a CF report voting cycle
            ensure!(
                !Self::is_trying_to_register_as_cfa(user.clone()),
                Error::<T>::UserIsActiveInCarbonFootprintReportVotingCycle
            );

            // Check if the documentation (IPFS link) has been used previously
            ensure!(
                Self::is_ipfs_available(documentation_ipfs.clone()),
                Error::<T>::DocumentationWasUsedPreviously
            );

            // Check if caller has sufficient funds
            ensure!(
                PalletFeeValues::<T>::get().project_validator_account_fee
                    <= T::Currency::free_balance(&user.clone()),
                Error::<T>::InsufficientFunds
            );

            // Insert project validator account
            let validator_info: ProjectValidatorOrProjectOwnerInfo<T::IPFSLength, BlockNumber<T>> =
                ProjectValidatorOrProjectOwnerInfo {
                    documentation_ipfs: documentation_ipfs.clone(),
                    penalty_level: 0,
                    penalty_timeout: BlockNumber::<T>::from(0u32),
                };
            Validators::<T>::insert(user.clone(), validator_info);

            // Transfer funds
            T::Currency::transfer(
                &user,
                &Self::pallet_id(),
                PalletFeeValues::<T>::get().project_validator_account_fee,
                ExistenceRequirement::KeepAlive,
            )?;

            // Deposit event
            Self::deposit_event(Event::ProjectValidatorAccountRegistered(
                user.clone(),
                documentation_ipfs.clone(),
            ));

            Ok(().into())
        }

        // Register for a project owner account
        #[pallet::call_index(7)]
        #[pallet::weight(<T as Config>::WeightInfo::register_for_project_owner_account())]
        pub fn register_for_project_owner_account(
            origin: OriginFor<T>,
            documentation_ipfs: BoundedString<T::IPFSLength>,
        ) -> DispatchResultWithPostInfo {
            let user = ensure_signed(origin)?;

            // Check if the account is in use
            ensure!(
                Self::is_account_id_available(user.clone()),
                Error::<T>::AccountIdAlreadyInUse
            );

            // Check if the user is active in a CF report voting cycle
            ensure!(
                !Self::is_trying_to_register_as_cfa(user.clone()),
                Error::<T>::UserIsActiveInCarbonFootprintReportVotingCycle
            );

            // Check if the documentation (IPFS link) has been used previously
            ensure!(
                Self::is_ipfs_available(documentation_ipfs.clone()),
                Error::<T>::DocumentationWasUsedPreviously
            );

            // Check if caller has sufficient funds
            ensure!(
                PalletFeeValues::<T>::get().project_owner_account_fee
                    <= T::Currency::free_balance(&user.clone()),
                Error::<T>::InsufficientFunds
            );

            // Insert project owner account
            let owner_info: ProjectValidatorOrProjectOwnerInfo<T::IPFSLength, BlockNumber<T>> =
                ProjectValidatorOrProjectOwnerInfo {
                    documentation_ipfs: documentation_ipfs.clone(),
                    penalty_level: 0,
                    penalty_timeout: BlockNumber::<T>::from(0u32),
                };
            ProjectOwners::<T>::insert(user.clone(), owner_info);

            // Transfer funds
            T::Currency::transfer(
                &user,
                &Self::pallet_id(),
                PalletFeeValues::<T>::get().project_owner_account_fee,
                ExistenceRequirement::KeepAlive,
            )?;

            // Deposit event
            Self::deposit_event(Event::ProjectOwnerAccountRegistered(
                user.clone(),
                documentation_ipfs.clone(),
            ));

            Ok(().into())
        }

        // Submit carbon footprint report
        #[pallet::call_index(8)]
        #[pallet::weight(<T as Config>::WeightInfo::submit_carbon_footprint_report())]
        pub fn submit_carbon_footprint_report(
            origin: OriginFor<T>,
            ipfs: BoundedString<T::IPFSLength>,
            carbon_footprint_surplus: BalanceOf<T>,
            carbon_footprint_deficit: BalanceOf<T>,
        ) -> DispatchResultWithPostInfo {
            let user = ensure_signed(origin)?;

            // Check if user has submitted valid report values
            ensure!(
                (carbon_footprint_surplus == BalanceOf::<T>::from(0u32))
                    ^ (carbon_footprint_deficit == BalanceOf::<T>::from(0u32)),
                Error::<T>::InvalidCarbonFootprintValues
            );

            // Check if the account is a CFAccount
            // Note: An accountID value can be already in use for as a CF account
            // 		 But it can also be available if the user is a new user of the pallet
            ensure!(
                Self::is_eligible_for_cfa(user.clone()),
                Error::<T>::AccountIdAlreadyInUse
            );

            // Check if the user has already submited a CF report
            ensure!(
                !Self::is_trying_to_register_as_cfa(user.clone()),
                Error::<T>::CarbonFootprintReportAlreadySubmitted
            );

            // Check if the documentation (IPFS link) has been used previously
            ensure!(
                Self::is_ipfs_available(ipfs.clone()),
                Error::<T>::DocumentationWasUsedPreviously
            );

            // Check if caller has sufficient funds
            ensure!(
                PalletFeeValues::<T>::get().carbon_footprint_report_fee
                    <= T::Currency::free_balance(&user.clone()),
                Error::<T>::InsufficientFunds
            );

            // Get time
            let creation_date = T::Time::now();

            // Carbon footprint info
            let report_info = CarbonFootprintReportInfo {
                cf_account: user.clone(),
                creation_date,
                carbon_footprint_deficit,
                carbon_footprint_surplus,
                votes_for: BTreeSet::<AccountIdOf<T>>::new(),
                votes_against: BTreeSet::<AccountIdOf<T>>::new(),
                voting_active: true,
            };

            // Write to info storage
            CarbonFootprintReports::<T>::insert(ipfs.clone(), report_info);

            // Set voting timeout
            let current_block = frame_system::Pallet::<T>::block_number();
            let timeout_block = current_block + PalletTimeValues::<T>::get().voting_timeout;

            let mut timeout_events = BTreeSet::<BoundedString<T::IPFSLength>>::new();

            if VotingTimeouts::<T>::contains_key(timeout_block) {
                timeout_events = VotingTimeouts::<T>::get(timeout_block).unwrap();
            }

            timeout_events.insert(ipfs.clone());

            VotingTimeouts::<T>::insert(timeout_block, timeout_events);

            // Transfer funds
            T::Currency::transfer(
                &user,
                &Self::pallet_id(),
                PalletFeeValues::<T>::get().carbon_footprint_report_fee,
                ExistenceRequirement::KeepAlive,
            )?;

            // Deposit event
            Self::deposit_event(Event::CarbonFootprintReportSubmitted(user.clone(), ipfs));

            Ok(().into())
        }

        // Vote for/against Carbon Deficit Reports or for/against project Proposals
        #[pallet::call_index(9)]
        #[pallet::weight(<T as Config>::WeightInfo::cast_vote())]
        pub fn cast_vote(
            origin: OriginFor<T>,
            vote_type: VoteType,
            ipfs: BoundedString<T::IPFSLength>,
            vote: bool,
        ) -> DispatchResultWithPostInfo {
            let user = ensure_signed(origin)?;

            // Check if caller is Validator account
            ensure!(
                Validators::<T>::contains_key(user.clone()),
                Error::<T>::Unauthorized
            );

            let amount_to_pay = Self::calculate_basic_payment_made_to_pallet(
                user.clone(),
                PalletFeeValues::<T>::get().voting_fee,
            );

            // Check if caller has sufficient funds
            ensure!(
                amount_to_pay <= T::Currency::free_balance(&user.clone()),
                Error::<T>::InsufficientFunds
            );

            match vote_type {
                VoteType::CarbonFootprintReportVote => {
                    // Get report info and return error if it does not exist
                    let mut report = CarbonFootprintReports::<T>::get(ipfs.clone())
                        .ok_or(Error::<T>::CarbonFootprintReportNotFound)?;

                    // Check if the voting cycle is over
                    ensure!(report.voting_active, Error::<T>::VotingCycleIsOver);

                    // Check if vote already exists
                    ensure!(
                        !report.votes_for.contains(&user) && !report.votes_against.contains(&user),
                        Error::<T>::VoteAlreadySubmitted
                    );

                    if vote {
                        report.votes_for.insert(user.clone());
                    } else {
                        report.votes_against.insert(user.clone());
                    };

                    CarbonFootprintReports::<T>::insert(ipfs.clone(), report);
                }
                VoteType::ProjectProposalVote => {
                    // Get proposal info or return error if it does not exist
                    let mut proposal = ProjectProposals::<T>::get(ipfs.clone())
                        .ok_or(Error::<T>::ProjectProposalNotFound)?;

                    // Check if the voting cycle is over
                    ensure!(proposal.voting_active, Error::<T>::VotingCycleIsOver);

                    // Check if vote already exists
                    ensure!(
                        !proposal.votes_for.contains(&user)
                            && !proposal.votes_against.contains(&user),
                        Error::<T>::VoteAlreadySubmitted
                    );

                    if vote {
                        proposal.votes_for.insert(user.clone());
                    } else {
                        proposal.votes_against.insert(user.clone());
                    };

                    ProjectProposals::<T>::insert(ipfs.clone(), proposal);
                }
                VoteType::CarbonCreditBatchVote => {
                    // Get carbon credit batch proposal info or return error if it does not exist
                    let mut batch = CarbonCreditBatchProposals::<T>::get(ipfs.clone())
                        .ok_or(Error::<T>::CarbonCreditBatchProposalNotFound)?;

                    // Check if the voting cycle is over
                    ensure!(batch.voting_active, Error::<T>::VotingCycleIsOver);

                    // Check if vote already exists
                    ensure!(
                        !batch.votes_for.contains(&user) && !batch.votes_against.contains(&user),
                        Error::<T>::VoteAlreadySubmitted
                    );

                    if vote {
                        batch.votes_for.insert(user.clone());
                    } else {
                        batch.votes_against.insert(user.clone());
                    };

                    CarbonCreditBatchProposals::<T>::insert(ipfs.clone(), batch);
                }
                VoteType::ComplaintVote => {
                    let mut complaint_exists = false;

                    // Get complaint info or return error if it does not exits
                    if ComplaintsForAccounts::<T>::contains_key(ipfs.clone()) {
                        let mut complaint = ComplaintsForAccounts::<T>::get(ipfs.clone()).unwrap();

                        complaint_exists = true;

                        // Check if the voting cycle is over
                        ensure!(complaint.complaint_active, Error::<T>::VotingCycleIsOver);

                        // Check if vote already exists
                        ensure!(
                            !complaint.votes_for.contains(&user)
                                && !complaint.votes_against.contains(&user),
                            Error::<T>::VoteAlreadySubmitted
                        );

                        if vote {
                            complaint.votes_for.insert(user.clone());
                        } else {
                            complaint.votes_against.insert(user.clone());
                        };

                        ComplaintsForAccounts::<T>::insert(ipfs.clone(), complaint);
                    } else if ComplaintsForHashes::<T>::contains_key(ipfs.clone()) {
                        let mut complaint = ComplaintsForHashes::<T>::get(ipfs.clone()).unwrap();

                        complaint_exists = true;

                        // Check if the voting cycle is over
                        ensure!(complaint.complaint_active, Error::<T>::VotingCycleIsOver);

                        // Check if vote already exists
                        ensure!(
                            !complaint.votes_for.contains(&user)
                                && !complaint.votes_against.contains(&user),
                            Error::<T>::VoteAlreadySubmitted
                        );

                        if vote {
                            complaint.votes_for.insert(user.clone());
                        } else {
                            complaint.votes_against.insert(user.clone());
                        };

                        ComplaintsForHashes::<T>::insert(ipfs.clone(), complaint);
                    }

                    ensure!(complaint_exists, Error::<T>::ComplaintNotFound);
                }
            }

            // Transfer funds
            T::Currency::transfer(
                &user,
                &Self::pallet_id(),
                amount_to_pay,
                ExistenceRequirement::KeepAlive,
            )?;

            Self::deposit_event(Event::SuccessfulVote(
                user.clone(),
                ipfs.clone(),
                vote_type,
                vote,
            ));

            Ok(().into())
        }

        // Propose project
        #[pallet::call_index(10)]
        #[pallet::weight(<T as Config>::WeightInfo::propose_project())]
        pub fn propose_project(
            origin: OriginFor<T>,
            ipfs: BoundedString<T::IPFSLength>,
        ) -> DispatchResultWithPostInfo {
            let user = ensure_signed(origin)?;

            // Check if caller is Project Owner account
            ensure!(
                ProjectOwners::<T>::contains_key(user.clone()),
                Error::<T>::Unauthorized
            );

            // Check if project owner has standing debts
            ensure!(
                !ProjectOwnerDebts::<T>::contains_key(user.clone()),
                Error::<T>::ProjectOwnerHasStandingDebts
            );

            // Ensure project does not exist
            ensure!(
                !ProjectProposals::<T>::contains_key(ipfs.clone()),
                Error::<T>::ProjectProposalAlreadyExists
            );

            // Check if the documentation (IPFS link) has been used previously
            ensure!(
                Self::is_ipfs_available(ipfs.clone()),
                Error::<T>::DocumentationWasUsedPreviously
            );

            let amount_to_pay = Self::calculate_basic_payment_made_to_pallet(
                user.clone(),
                PalletFeeValues::<T>::get().project_proposal_fee,
            );

            // Check if caller has sufficient funds
            ensure!(
                amount_to_pay <= T::Currency::free_balance(&user.clone()),
                Error::<T>::InsufficientFunds
            );

            // Get time
            let creation_date = T::Time::now();

            // Create project hash
            let project_hash = Self::generate_hash(user.clone());

            // Project Proposal info
            let proposal_info = ProjectProposalInfo {
                project_owner: user.clone(),
                creation_date,
                project_hash,
                votes_for: BTreeSet::<AccountIdOf<T>>::new(),
                votes_against: BTreeSet::<AccountIdOf<T>>::new(),
                voting_active: true,
            };

            // Write to info storage
            ProjectProposals::<T>::insert(ipfs.clone(), proposal_info);

            // Set for voting timeout
            let current_block = frame_system::Pallet::<T>::block_number();
            let timeout_block = current_block + PalletTimeValues::<T>::get().voting_timeout;

            let mut timeout_events = BTreeSet::<BoundedString<T::IPFSLength>>::new();

            if VotingTimeouts::<T>::contains_key(timeout_block) {
                timeout_events = VotingTimeouts::<T>::get(timeout_block).unwrap();
            }

            timeout_events.insert(ipfs.clone());

            VotingTimeouts::<T>::insert(timeout_block, timeout_events);

            // Transfer funds
            T::Currency::transfer(
                &user,
                &Self::pallet_id(),
                amount_to_pay,
                ExistenceRequirement::KeepAlive,
            )?;

            // Deposit event
            Self::deposit_event(Event::ProjectProposalCreated(user.clone(), ipfs));

            Ok(().into())
        }

        // Propose carbon credit batch
        #[pallet::call_index(11)]
        #[pallet::weight(<T as Config>::WeightInfo::propose_carbon_credit_batch())]
        pub fn propose_carbon_credit_batch(
            origin: OriginFor<T>,
            project_hash: H256,
            credit_amount: BalanceOf<T>,
            penalty_repay_price: BalanceOf<T>,
            ipfs: BoundedString<T::IPFSLength>,
        ) -> DispatchResultWithPostInfo {
            let user = ensure_signed(origin)?;

            // Check if caller is a Project Owner account
            ensure!(
                ProjectOwners::<T>::contains_key(user.clone()),
                Error::<T>::Unauthorized
            );

            // Check if project owner has standing debts
            ensure!(
                !ProjectOwnerDebts::<T>::contains_key(user.clone()),
                Error::<T>::ProjectOwnerHasStandingDebts
            );

            // Check if the penalty repay price is 0
            ensure!(
                penalty_repay_price != BalanceOf::<T>::from(0u32),
                Error::<T>::InvalidPenaltyPriceValue
            );

            // Check if project exists
            let project = Projects::<T>::get(project_hash).ok_or(Error::<T>::ProjectDoesntExist)?;

            // Check if the owner owns the mentioned project
            ensure!(project.project_owner == user, Error::<T>::Unauthorized);

            // Check if the documentation (IPFS link) has been used previously
            ensure!(
                Self::is_ipfs_available(ipfs.clone()),
                Error::<T>::DocumentationWasUsedPreviously
            );

            let amount_to_pay = Self::calculate_complex_payment_made_to_pallet(
                project.project_owner,
                project_hash,
                PalletFeeValues::<T>::get().carbon_credit_batch_fee,
            );

            // Check if caller has sufficient funds
            ensure!(
                amount_to_pay <= T::Currency::free_balance(&user.clone()),
                Error::<T>::InsufficientFunds
            );

            // Create batch hash
            let batch_hash = Self::generate_hash(user.clone());

            // Get time
            let creation_date = T::Time::now();

            // CCB Proposal info
            let proposal_info = CarbonCreditBatchProposalInfo {
                project_hash,
                batch_hash,
                creation_date,
                credit_amount,
                penalty_repay_price,
                votes_for: BTreeSet::<AccountIdOf<T>>::new(),
                votes_against: BTreeSet::<AccountIdOf<T>>::new(),
                voting_active: true,
            };

            // Write to info storage
            CarbonCreditBatchProposals::<T>::insert(ipfs.clone(), proposal_info);

            // Set for voting timeout
            let current_block = frame_system::Pallet::<T>::block_number();
            let timeout_block = current_block + PalletTimeValues::<T>::get().voting_timeout;

            let mut timeout_events = BTreeSet::<BoundedString<T::IPFSLength>>::new();

            if VotingTimeouts::<T>::contains_key(timeout_block) {
                timeout_events = VotingTimeouts::<T>::get(timeout_block).unwrap();
            }

            timeout_events.insert(ipfs.clone());

            VotingTimeouts::<T>::insert(timeout_block, timeout_events);

            // Transfer funds
            T::Currency::transfer(
                &user,
                &Self::pallet_id(),
                PalletFeeValues::<T>::get().carbon_credit_batch_fee,
                ExistenceRequirement::KeepAlive,
            )?;

            // Deposit event
            Self::deposit_event(Event::CarbonCreditBatchProposalCreated(user.clone(), ipfs));

            Ok(().into())
        }

        // Create carbon credit sale order
        #[pallet::call_index(12)]
        #[pallet::weight(<T as Config>::WeightInfo::create_sale_order())]
        pub fn create_sale_order(
            origin: OriginFor<T>,
            batch_hash: H256,
            credit_price: BalanceOf<T>,
            credit_amount: BalanceOf<T>,
        ) -> DispatchResultWithPostInfo {
            let seller = ensure_signed(origin)?;

            // Check if use can create a sale order
            ensure!(
                Self::is_eligible_for_carbon_credit_transaction(seller.clone()),
                Error::<T>::UserIsNotEligibleForCarbonCreditTransactions,
            );

            // Check if the caller is a project owner and if he has standing debts
            if ProjectOwners::<T>::contains_key(seller.clone()) {
                ensure!(
                    !ProjectOwnerDebts::<T>::contains_key(seller.clone()),
                    Error::<T>::ProjectOwnerHasStandingDebts
                );
            }

            // Check if user put a nonnegative number for the credit amount
            ensure!(
                credit_amount > BalanceOf::<T>::from(0u32),
                Error::<T>::InvalidCarbonCreditAmount
            );

            // Check if carbon credit batch exists
            ensure!(
                CarbonCreditBatches::<T>::contains_key(batch_hash),
                Error::<T>::CarbonCreditBatchDoesNotExist
            );

            let carbon_credit_batch = CarbonCreditBatches::<T>::get(batch_hash).unwrap();

            // Check if the carbon credit batch is active
            ensure!(
                carbon_credit_batch.status == CarbonCreditBatchStatus::Active,
                Error::<T>::CarbonCreditBatchIsNotActive,
            );

            // Check if the user holding exist
            ensure!(
                CarbonCreditHoldings::<T>::contains_key(batch_hash, seller.clone()),
                Error::<T>::CarbonCreditHoldingsDontExist
            );

            // Check if user has enough available credits
            let mut seller_holdings =
                CarbonCreditHoldings::<T>::get(batch_hash, seller.clone()).unwrap();

            ensure!(
                seller_holdings.available_amount >= credit_amount,
                Error::<T>::NotEnoughtAvailableCredits,
            );

            // Generate sale order hash
            let sale_hash = Self::generate_hash(seller.clone());

            // Set sale timeout
            let current_block = frame_system::Pallet::<T>::block_number();
            let timeout_block = current_block + PalletTimeValues::<T>::get().voting_timeout;

            // Create a carbon credit sale order
            // Note: If the buyer ID is the same as the seller we know that
            // the sale has not been finalized
            let sale_order = CarbonCreditSaleOrderInfo {
                batch_hash,
                credit_amount,
                credit_price,
                seller: seller.clone(),
                buyer: seller.clone(),
                sale_active: true,
                sale_timeout: timeout_block,
            };

            CarbonCreditSaleOrders::<T>::insert(sale_hash, sale_order);

            // Create a carbon credit sale order timeout event
            let mut sale_timeouts = BTreeSet::<H256>::new();

            if SaleOrderTimeouts::<T>::contains_key(timeout_block) {
                sale_timeouts = SaleOrderTimeouts::<T>::get(current_block).unwrap();
            }

            sale_timeouts.insert(sale_hash);

            SaleOrderTimeouts::<T>::insert(timeout_block, sale_timeouts);

            // Update seller carbon credit holdings
            seller_holdings = CarbonCreditHoldingsInfo {
                available_amount: seller_holdings.available_amount - credit_amount,
                unavailable_amount: seller_holdings.unavailable_amount + credit_amount,
            };

            CarbonCreditHoldings::<T>::insert(batch_hash, seller.clone(), seller_holdings);

            // Deposit event
            Self::deposit_event(Event::CarbonCreditSaleOrderCreated(
                seller,
                batch_hash,
                credit_amount,
                credit_price,
            ));

            Ok(().into())
        }

        // Complete sale order (buy carbon credits)
        #[pallet::call_index(13)]
        #[pallet::weight(<T as Config>::WeightInfo::complete_sale_order())]
        pub fn complete_sale_order(
            origin: OriginFor<T>,
            sale_hash: H256,
        ) -> DispatchResultWithPostInfo {
            let buyer = ensure_signed(origin)?;

            // Check if the user can transact with a sale order
            ensure!(
                Self::is_eligible_for_carbon_credit_transaction(buyer.clone()),
                Error::<T>::UserIsNotEligibleForCarbonCreditTransactions,
            );

            // Check if the caller is a project owner and if he has standing debts
            if ProjectOwners::<T>::contains_key(buyer.clone()) {
                ensure!(
                    !ProjectOwnerDebts::<T>::contains_key(buyer.clone()),
                    Error::<T>::ProjectOwnerHasStandingDebts
                );
            }

            // Check if sale order exits
            ensure!(
                CarbonCreditSaleOrders::<T>::contains_key(sale_hash),
                Error::<T>::CarbonCreditSaleOrderDoesntExist
            );

            let mut sale_order = CarbonCreditSaleOrders::<T>::get(sale_hash).unwrap();

            // Check if the buyer isn't the seller
            ensure!(
                buyer != sale_order.seller,
                Error::<T>::BuyerCantBuyHisOwnTokens
            );

            // Check if carbon credit batch exists
            ensure!(
                CarbonCreditBatches::<T>::contains_key(sale_order.batch_hash),
                Error::<T>::CarbonCreditBatchDoesNotExist
            );

            let carbon_credit_batch = CarbonCreditBatches::<T>::get(sale_order.batch_hash).unwrap();

            // Check if the carbon credit batch is active
            ensure!(
                carbon_credit_batch.status == CarbonCreditBatchStatus::Active,
                Error::<T>::CarbonCreditBatchIsNotActive,
            );

            // Check if the buyer has enough assets
            let mut amount_to_pay = sale_order.credit_amount * sale_order.credit_price;

            ensure!(
                amount_to_pay <= T::Currency::free_balance(&buyer.clone()),
                Error::<T>::InsufficientFunds
            );

            let project = Projects::<T>::get(carbon_credit_batch.project_hash).unwrap();

            let beneficiary_splits = BeneficiarySplits::<T>::get();

            if project.project_owner == sale_order.seller {
                // Do primary beneficiary split
                let validator_gains =
                    amount_to_pay * beneficiary_splits[&0] / BalanceOf::<T>::from(10000u32);

                Self::process_validator_gains(
                    buyer.clone(),
                    carbon_credit_batch.validator_benefactors,
                    validator_gains,
                );

                amount_to_pay -= validator_gains;
            } else {
                // Do secondary beneficiary split
                let validator_gains =
                    amount_to_pay * beneficiary_splits[&1] / BalanceOf::<T>::from(10000u32);
                let owner_gains =
                    amount_to_pay * beneficiary_splits[&2] / BalanceOf::<T>::from(10000u32);

                Self::process_validator_gains(
                    buyer.clone(),
                    carbon_credit_batch.validator_benefactors,
                    validator_gains,
                );

                Self::process_owner_gains(buyer.clone(), project.project_owner, owner_gains);

                amount_to_pay -= validator_gains;
                amount_to_pay -= owner_gains;
            }

            // Transfer funds
            T::Currency::transfer(
                &buyer,
                &sale_order.seller,
                amount_to_pay,
                ExistenceRequirement::KeepAlive,
            )?;

            // Update sell order
            sale_order = CarbonCreditSaleOrderInfo {
                buyer: buyer.clone(),
                sale_active: false,
                ..sale_order
            };

            CarbonCreditSaleOrders::<T>::insert(sale_hash, sale_order.clone());

            // Update seller holdings
            let mut seller_holdings =
                CarbonCreditHoldings::<T>::get(sale_order.batch_hash, sale_order.clone().seller)
                    .unwrap();

            seller_holdings = CarbonCreditHoldingsInfo {
                unavailable_amount: seller_holdings.unavailable_amount - sale_order.credit_amount,
                ..seller_holdings
            };

            // Check to see if the seller sold all of his/hers tokens
            // Note: If the seller has sold all of his tokens (available + unavailable) then we will delete him/her
            //		 If not then the seller will still be active
            if seller_holdings.available_amount == BalanceOf::<T>::from(0u32)
                && seller_holdings.unavailable_amount == BalanceOf::<T>::from(0u32)
            {
                CarbonCreditHoldings::<T>::remove(sale_order.batch_hash, sale_order.seller);
            } else {
                CarbonCreditHoldings::<T>::insert(
                    sale_order.batch_hash,
                    sale_order.seller,
                    seller_holdings,
                );
            }

            // Update buyer holdings
            // Note: First we will check if the buyer has some preexisting holdings and if that's the case we will update them
            //		 If that is not the case we will create a new holdings entity
            let mut buyer_holdings = CarbonCreditHoldingsInfo {
                available_amount: sale_order.credit_amount,
                unavailable_amount: BalanceOf::<T>::from(0u32),
            };

            if CarbonCreditHoldings::<T>::contains_key(sale_order.batch_hash, buyer.clone()) {
                buyer_holdings =
                    CarbonCreditHoldings::<T>::get(sale_order.batch_hash, buyer.clone()).unwrap();

                buyer_holdings = CarbonCreditHoldingsInfo {
                    available_amount: buyer_holdings.available_amount + sale_order.credit_amount,
                    ..buyer_holdings
                };
            }

            CarbonCreditHoldings::<T>::insert(sale_order.batch_hash, buyer.clone(), buyer_holdings);

            // Remove sale timeout event
            let mut sale_timeouts = SaleOrderTimeouts::<T>::get(sale_order.sale_timeout).unwrap();

            sale_timeouts.remove(&sale_hash);

            if sale_timeouts.len() == 0 {
                SaleOrderTimeouts::<T>::remove(sale_order.sale_timeout);
            } else {
                SaleOrderTimeouts::<T>::insert(sale_order.sale_timeout, sale_timeouts);
            }

            // Deposit event
            Self::deposit_event(Event::CarbonCreditSaleOrderCompleted(buyer, sale_hash));

            Ok(().into())
        }

        // Close carbon credit sale order
        #[pallet::call_index(14)]
        #[pallet::weight(<T as Config>::WeightInfo::close_sale_order())]
        pub fn close_sale_order(
            origin: OriginFor<T>,
            sale_hash: H256,
        ) -> DispatchResultWithPostInfo {
            let seller = ensure_signed(origin)?;

            // Check if the user can transact with a sale order
            ensure!(
                Self::is_eligible_for_carbon_credit_transaction(seller.clone()),
                Error::<T>::UserIsNotEligibleForCarbonCreditTransactions,
            );

            // Check if the caller is a project owner and if he has standing debts
            if ProjectOwners::<T>::contains_key(seller.clone()) {
                ensure!(
                    !ProjectOwnerDebts::<T>::contains_key(seller.clone()),
                    Error::<T>::ProjectOwnerHasStandingDebts
                );
            }

            // Check if sale order exits
            ensure!(
                CarbonCreditSaleOrders::<T>::contains_key(sale_hash),
                Error::<T>::CarbonCreditSaleOrderDoesntExist
            );

            let mut sale_order = CarbonCreditSaleOrders::<T>::get(sale_hash).unwrap();

            // Check if the sale order is still active
            ensure!(sale_order.sale_active, Error::<T>::SaleOrderIsNotActive);

            // Check if the seller created the sale order
            ensure!(
                seller == sale_order.seller,
                Error::<T>::UserDidntCreateTheSaleOrder
            );

            // Check if carbon credit batch exists
            ensure!(
                CarbonCreditBatches::<T>::contains_key(sale_order.batch_hash),
                Error::<T>::CarbonCreditBatchDoesNotExist
            );

            // Update seller holdings
            let mut seller_holdings =
                CarbonCreditHoldings::<T>::get(sale_order.batch_hash, seller.clone()).unwrap();

            seller_holdings = CarbonCreditHoldingsInfo {
                unavailable_amount: seller_holdings.unavailable_amount - sale_order.credit_amount,
                available_amount: seller_holdings.available_amount + sale_order.credit_amount,
            };

            CarbonCreditHoldings::<T>::insert(
                sale_order.batch_hash,
                seller.clone(),
                seller_holdings,
            );

            // Update sale order
            sale_order = CarbonCreditSaleOrderInfo {
                sale_active: false,
                ..sale_order
            };

            CarbonCreditSaleOrders::<T>::insert(sale_hash, sale_order.clone());

            // Remove sale order timeout
            let mut sale_timeouts = SaleOrderTimeouts::<T>::get(sale_order.sale_timeout).unwrap();

            sale_timeouts.remove(&sale_hash);

            if sale_timeouts.len() == 0 {
                SaleOrderTimeouts::<T>::remove(sale_order.sale_timeout);
            } else {
                SaleOrderTimeouts::<T>::insert(sale_order.sale_timeout, sale_timeouts);
            }

            // Deposit event
            Self::deposit_event(Event::CarbonCreditSaleOrderClosed(seller, sale_hash));

            Ok(().into())
        }

        // Open complaint (for AccountId entity)
        #[pallet::call_index(15)]
        #[pallet::weight(<T as Config>::WeightInfo::open_account_complaint())]
        pub fn open_account_complaint(
            origin: OriginFor<T>,
            documentation_ipfs: BoundedString<T::IPFSLength>,
            complaint_for: AccountIdOf<T>,
            complaint_type: ComplaintType,
        ) -> DispatchResultWithPostInfo {
            let validator = ensure_signed(origin)?;

            // Check if the complaint proposer is a registered validator
            ensure!(
                Validators::<T>::contains_key(validator.clone()),
                Error::<T>::UserIsNotARegisteredValidator
            );

            // Check if the given IPFS link is currently in use
            ensure!(
                Self::is_ipfs_available(documentation_ipfs.clone()),
                Error::<T>::DocumentationWasUsedPreviously
            );

            let amount_to_pay = Self::calculate_basic_payment_made_to_pallet(
                validator.clone(),
                PalletFeeValues::<T>::get().complaint_fee,
            );

            // Check if the proposer has enough credits
            ensure!(
                amount_to_pay <= T::Currency::free_balance(&validator.clone()),
                Error::<T>::InsufficientFunds
            );

            // Check if the given accountId is registered
            match complaint_type {
                ComplaintType::ValidatorComplaint => {
                    ensure!(
                        Validators::<T>::contains_key(complaint_for.clone()),
                        Error::<T>::UnregisteredAccountId
                    );
                }
                ComplaintType::ProjectOwnerComplaint => {
                    ensure!(
                        ProjectOwners::<T>::contains_key(complaint_for.clone()),
                        Error::<T>::UnregisteredAccountId
                    );

                    // Freeze all carbon credit batches for given owner
                    Self::freeze_all_owner_batches(complaint_for.clone());
                }
                _ => {
                    ensure!(false, Error::<T>::InvalidComplaintType);
                }
            }

            // Check if the user for whom the complaint is ment exceeded the max potential penalty level
            ensure!(
                !Self::is_account_at_max_potential_penalty(complaint_for.clone()),
                Error::<T>::MaxPotentialPenaltyLevelExceeded
            );

            // Save complaint
            let complaint = ComplaintAccountBasedInfo {
                complaint_for: complaint_for.clone(),
                complaint_type: complaint_type.clone(),
                complaint_proposer: validator.clone(),
                creation_date: T::Time::now(),
                votes_for: BTreeSet::<AccountIdOf<T>>::new(),
                votes_against: BTreeSet::<AccountIdOf<T>>::new(),
                complaint_active: true,
            };

            ComplaintsForAccounts::<T>::insert(documentation_ipfs.clone(), complaint);

            // Save complaint timeout event
            let current_block = frame_system::Pallet::<T>::block_number();
            let timeout_block = current_block + PalletTimeValues::<T>::get().voting_timeout;

            let mut timeout_events = BTreeSet::<BoundedString<T::IPFSLength>>::new();

            if ComplaintTimeouts::<T>::contains_key(timeout_block) {
                timeout_events = ComplaintTimeouts::<T>::get(timeout_block).unwrap();
            }

            timeout_events.insert(documentation_ipfs.clone());

            ComplaintTimeouts::<T>::insert(timeout_block, timeout_events);

            // Transfer funds
            T::Currency::transfer(
                &validator,
                &Self::pallet_id(),
                amount_to_pay,
                ExistenceRequirement::KeepAlive,
            )?;

            // Deposit event
            Self::deposit_event(Event::AccountComplaintOpened(
                validator,
                complaint_for,
                complaint_type,
                documentation_ipfs,
            ));

            Ok(().into())
        }

        // Open complaint (for hash entity)
        #[pallet::call_index(16)]
        #[pallet::weight(<T as Config>::WeightInfo::open_hash_complaint())]
        pub fn open_hash_complaint(
            origin: OriginFor<T>,
            documentation_ipfs: BoundedString<T::IPFSLength>,
            complaint_for: H256,
            complaint_type: ComplaintType,
        ) -> DispatchResultWithPostInfo {
            let validator = ensure_signed(origin)?;

            // Check if the complaint proposer is a registered validator
            ensure!(
                Validators::<T>::contains_key(validator.clone()),
                Error::<T>::UserIsNotARegisteredValidator
            );

            // Check if the given IPFS link is currently in use
            ensure!(
                Self::is_ipfs_available(documentation_ipfs.clone()),
                Error::<T>::DocumentationWasUsedPreviously
            );

            // Check if the proposer has enough credits
            // TODO: Implement penalty tax
            ensure!(
                PalletFeeValues::<T>::get().complaint_fee
                    <= T::Currency::free_balance(&validator.clone()),
                Error::<T>::InsufficientFunds
            );

            // Check if the given hash is registered
            match complaint_type {
                ComplaintType::ProjectComplaint => {
                    ensure!(
                        Projects::<T>::contains_key(complaint_for),
                        Error::<T>::UnregisteredHash
                    );

                    // Freeze carbon credit batches for given project
                    Self::freeze_all_project_batches(complaint_for);
                }
                ComplaintType::CarbonCreditBatchComplaint => {
                    // Check if carbon credit batch exists
                    ensure!(
                        CarbonCreditBatches::<T>::contains_key(complaint_for),
                        Error::<T>::CarbonCreditBatchDoesNotExist
                    );

                    let mut carbon_credit_batch =
                        CarbonCreditBatches::<T>::get(complaint_for).unwrap();

                    // Freeze carbon credit batch
                    carbon_credit_batch = CarbonCreditBatchInfo {
                        status: CarbonCreditBatchStatus::Frozen,
                        ..carbon_credit_batch
                    };

                    CarbonCreditBatches::<T>::insert(complaint_for, carbon_credit_batch);
                }
                _ => {
                    ensure!(false, Error::<T>::InvalidComplaintType);
                }
            }

            if complaint_type == ComplaintType::ProjectComplaint {
                // Check if the project for whom the complaint is ment exceeded the max potential penalty level
                ensure!(
                    !Self::is_hash_at_max_potential_penalty(complaint_for.clone()),
                    Error::<T>::MaxPotentialPenaltyLevelExceeded
                );
            }

            if complaint_type == ComplaintType::CarbonCreditBatchComplaint {
                // Check if the batch for whom the complaint is ment has an ongoing complaint
                ensure!(
                    !Self::has_a_ongoing_complaint(complaint_for.clone()),
                    Error::<T>::OngoingCarbonBatchComplaint
                );
            }

            // Save complaint
            let complaint = ComplaintHashBasedInfo {
                complaint_for: complaint_for.clone(),
                complaint_type: complaint_type.clone(),
                complaint_proposer: validator.clone(),
                creation_date: T::Time::now(),
                votes_for: BTreeSet::<AccountIdOf<T>>::new(),
                votes_against: BTreeSet::<AccountIdOf<T>>::new(),
                complaint_active: true,
            };

            ComplaintsForHashes::<T>::insert(documentation_ipfs.clone(), complaint);

            // Save complaint timeout event
            let current_block = frame_system::Pallet::<T>::block_number();
            let timeout_block = current_block + PalletTimeValues::<T>::get().voting_timeout;

            let mut timeout_events = BTreeSet::<BoundedString<T::IPFSLength>>::new();

            if ComplaintTimeouts::<T>::contains_key(timeout_block) {
                timeout_events = ComplaintTimeouts::<T>::get(timeout_block).unwrap();
            }

            timeout_events.insert(documentation_ipfs.clone());

            ComplaintTimeouts::<T>::insert(timeout_block, timeout_events);

            // Transfer funds
            T::Currency::transfer(
                &validator,
                &Self::pallet_id(),
                PalletFeeValues::<T>::get().complaint_fee,
                ExistenceRequirement::KeepAlive,
            )?;

            // Deposit event
            Self::deposit_event(Event::HashComplaintOpened(
                validator,
                complaint_for,
                complaint_type,
                documentation_ipfs,
            ));

            Ok(().into())
        }

        // Retire carbon credits (only for CFAs)
        #[pallet::call_index(17)]
        #[pallet::weight(<T as Config>::WeightInfo::retire_carbon_credits())]
        pub fn retire_carbon_credits(
            origin: OriginFor<T>,
            batch_hash: H256,
            amount_to_retire: BalanceOf<T>,
        ) -> DispatchResultWithPostInfo {
            let footprint_account = ensure_signed(origin)?;

            // Check if the caller is of the CFA type
            ensure!(
                CarbonFootprintAccounts::<T>::contains_key(footprint_account.clone()),
                Error::<T>::UserIsNotOfACarbonFootprintAccountType
            );

            // Check if the carbon credit batch exists
            ensure!(
                CarbonCreditBatches::<T>::contains_key(batch_hash),
                Error::<T>::CarbonCreditBatchDoesNotExist
            );

            // Check if the carbon credit batch is active
            let carbon_credit_batch = CarbonCreditBatches::<T>::get(batch_hash).unwrap();

            ensure!(
                carbon_credit_batch.status == CarbonCreditBatchStatus::Active,
                Error::<T>::CarbonCreditBatchIsNotActive,
            );

            // Check if the caller has any holdings for the given batch
            ensure!(
                CarbonCreditHoldings::<T>::contains_key(batch_hash, footprint_account.clone()),
                Error::<T>::CarbonCreditHoldingsDontExist
            );

            // Check if the caller has enough credits
            let mut holdings =
                CarbonCreditHoldings::<T>::get(batch_hash, footprint_account.clone()).unwrap();

            ensure!(
                holdings.available_amount >= amount_to_retire,
                Error::<T>::NotEnoughtAvailableCredits
            );

            // Calculate actual amount to retire
            let new_available_amount =
                BalanceOf::<T>::from(holdings.available_amount - amount_to_retire);

            holdings = CarbonCreditHoldingsInfo {
                available_amount: new_available_amount,
                ..holdings
            };

            // Check to see if user holdings needs to be deleted
            if holdings.available_amount == BalanceOf::<T>::from(0u32)
                && holdings.unavailable_amount == BalanceOf::<T>::from(0u32)
            {
                CarbonCreditHoldings::<T>::remove(batch_hash, footprint_account.clone());
            } else {
                CarbonCreditHoldings::<T>::insert(batch_hash, footprint_account.clone(), holdings);
            }

            // Update carbon footprint information
            let mut footprint_info =
                CarbonFootprintAccounts::<T>::get(footprint_account.clone()).unwrap();

            if amount_to_retire >= footprint_info.carbon_footprint_deficit {
                let difference = amount_to_retire - footprint_info.carbon_footprint_deficit;

                footprint_info = CarbonFootprintAccountInfo {
                    carbon_footprint_surplus: footprint_info.carbon_footprint_surplus + difference,
                    carbon_footprint_deficit: BalanceOf::<T>::from(0u32),
                    ..footprint_info
                };
            } else {
                footprint_info = CarbonFootprintAccountInfo {
                    carbon_footprint_deficit: footprint_info.carbon_footprint_deficit
                        - amount_to_retire,
                    ..footprint_info
                };
            }

            CarbonFootprintAccounts::<T>::insert(footprint_account.clone(), footprint_info);

            // Save retiring information
            let retirement_info = CarbonCreditRetirementInfo {
                carbon_footprint_account: footprint_account.clone(),
                batch_hash,
                credit_amount: amount_to_retire,
                retirement_date: T::Time::now(),
            };

            let retirement_hash = Self::generate_hash(footprint_account.clone());

            CarbonCreditRetirements::<T>::insert(retirement_hash, retirement_info);

            // Deposit event
            Self::deposit_event(Event::CarbonCreditsHaveBeenRetired(
                footprint_account,
                batch_hash,
                amount_to_retire,
            ));

            Ok(().into())
        }

        // Repay project owner debts (only for project owners)
        // Note: This extrinsic will not user the penalties to calculate the amout that
        // 		 is needed for the repayment
        #[pallet::call_index(18)]
        #[pallet::weight(<T as Config>::WeightInfo::repay_project_owner_debts())]
        pub fn repay_project_owner_debts(origin: OriginFor<T>) -> DispatchResultWithPostInfo {
            let project_owner = ensure_signed(origin)?;

            // Check to see if account if a project owner
            ensure!(
                ProjectOwners::<T>::contains_key(project_owner.clone()),
                Error::<T>::ProjectOwnerDoesntExist
            );

            // Check to see if the user has any standing debts
            ensure!(
                ProjectOwnerDebts::<T>::contains_key(project_owner.clone()),
                Error::<T>::ProjectOwnerDoesntHaveAnyDebts
            );

            // Calculate total debt to repay
            let debts = ProjectOwnerDebts::<T>::get(project_owner.clone());
            let mut total_debt = BalanceOf::<T>::from(0u32);

            for debt in debts.iter() {
                total_debt += *debt.1;
            }

            // Check to see if user has enough assets
            ensure!(
                total_debt <= T::Currency::free_balance(&project_owner),
                Error::<T>::InsufficientFunds
            );

            // Repay each debt collector
            for debt in debts.iter() {
                // Transfer funds
                T::Currency::transfer(
                    &project_owner,
                    &debt.0,
                    *debt.1,
                    ExistenceRequirement::KeepAlive,
                )?;
            }

            // Remove project owner debts
            ProjectOwnerDebts::<T>::remove(project_owner.clone());

            // Deposit event
            Self::deposit_event(Event::ProjectOwnerDebtsHaveBeenRepaid(project_owner));

            Ok(().into())
        }

        // Offchain worker extrinsics
        #[pallet::call_index(19)]
        #[pallet::weight(<T as Config>::WeightInfo::update_pallet_base_time())]
        pub fn update_pallet_base_time(
            _origin: OriginFor<T>,
            new_pallet_base_time: BlockNumber<T>,
        ) -> DispatchResult {
            let mut pallet_times = PalletTimeValues::<T>::get();

            if pallet_times.pallet_base_time == BlockNumber::<T>::from(0u32)
                || new_pallet_base_time
                    == pallet_times.pallet_base_time + pallet_times.number_of_blocks_per_year
            {
                pallet_times = TimeValues {
                    pallet_base_time: new_pallet_base_time,
                    ..pallet_times
                };

                PalletTimeValues::<T>::set(pallet_times);

                Self::deposit_event(Event::BasePalletTimeUpdated(new_pallet_base_time));
            }

            Ok(())
        }

        #[pallet::call_index(20)]
        #[pallet::weight(<T as Config>::WeightInfo::update_carbon_footprint_report())]
        pub fn update_carbon_footprint_report(
            _origin: OriginFor<T>,
            ipfs: BoundedString<T::IPFSLength>,
        ) -> DispatchResult {
            let report = CarbonFootprintReports::<T>::get(ipfs.clone()).unwrap();

            // Get the votes that were made for the report
            let votes_for: u16 = report.votes_for.len().try_into().unwrap();
            let votes_against: u16 = report.votes_against.len().try_into().unwrap();
            let votes_total: u16 = votes_for + votes_against;

            // Check if the vote has passed
            if Self::has_vote_passed(votes_total, votes_for) {
                let mut documentation_ipfses = BTreeSet::<BoundedString<T::IPFSLength>>::new();
                documentation_ipfses.insert(ipfs.clone());

                // Create an empty carbon footprint account
                let mut new_account = CarbonFootprintAccountInfo {
                    documentation_ipfses,
                    carbon_footprint_surplus: report.carbon_footprint_surplus,
                    carbon_footprint_deficit: report.carbon_footprint_deficit,
                    creation_date: T::Time::now(),
                };

                // Check to see if a carbon footprint account with the given accountID exists
                if CarbonFootprintAccounts::<T>::contains_key(report.cf_account.clone()) {
                    let old_account =
                        CarbonFootprintAccounts::<T>::get(report.cf_account.clone()).unwrap();

                    // Update documentation related to the carbon footprint account
                    let mut new_documentation = old_account.documentation_ipfses;
                    new_documentation.insert(ipfs.clone());

                    // Update the carbon footprint account structure
                    if report.carbon_footprint_surplus == BalanceOf::<T>::from(0u32) {
                        if report.carbon_footprint_deficit >= old_account.carbon_footprint_surplus {
                            let change_amount = report.carbon_footprint_deficit
                                - old_account.carbon_footprint_surplus;

                            new_account = CarbonFootprintAccountInfo {
                                documentation_ipfses: new_documentation,
                                carbon_footprint_surplus: BalanceOf::<T>::from(0u32),
                                carbon_footprint_deficit: old_account.carbon_footprint_deficit
                                    + change_amount,
                                creation_date: old_account.creation_date,
                            };
                        } else {
                            let change_amount = report.carbon_footprint_surplus
                                - new_account.carbon_footprint_deficit;

                            new_account = CarbonFootprintAccountInfo {
                                documentation_ipfses: new_documentation,
                                carbon_footprint_surplus: old_account.carbon_footprint_surplus
                                    + change_amount,
                                carbon_footprint_deficit: BalanceOf::<T>::from(0u32),
                                creation_date: old_account.creation_date,
                            };
                        }
                    } else {
                        if report.carbon_footprint_surplus >= old_account.carbon_footprint_deficit {
                            let change_amount = report.carbon_footprint_surplus
                                - old_account.carbon_footprint_deficit;

                            new_account = CarbonFootprintAccountInfo {
                                documentation_ipfses: new_documentation,
                                carbon_footprint_surplus: old_account.carbon_footprint_surplus
                                    + change_amount,
                                carbon_footprint_deficit: BalanceOf::<T>::from(0u32),
                                creation_date: old_account.creation_date,
                            };
                        } else {
                            let change_amount =
                                report.carbon_footprint_deficit - report.carbon_footprint_surplus;

                            new_account = CarbonFootprintAccountInfo {
                                documentation_ipfses: new_documentation,
                                carbon_footprint_surplus: BalanceOf::<T>::from(0u32),
                                carbon_footprint_deficit: old_account.carbon_footprint_deficit
                                    + change_amount,
                                creation_date: old_account.creation_date,
                            };
                        }
                    }
                }

                // Save the changes made to the carbon footprint account
                CarbonFootprintAccounts::<T>::insert(report.cf_account.clone(), new_account);
            }

            // Create new report
            // Note: Only change is made to the voting_active cycle status
            let new_report = CarbonFootprintReportInfo {
                cf_account: report.cf_account.clone(),
                creation_date: report.creation_date,
                carbon_footprint_surplus: report.carbon_footprint_surplus,
                carbon_footprint_deficit: report.carbon_footprint_deficit,
                votes_for: report.votes_for,
                votes_against: report.votes_against,
                voting_active: false,
            };

            // Save new report
            CarbonFootprintReports::<T>::insert(ipfs.clone(), new_report);

            Self::deposit_event(Event::CarbonFootprintReportUpdated(ipfs));

            Ok(())
        }

        #[pallet::call_index(21)]
        #[pallet::weight(<T as Config>::WeightInfo::update_project_proposal())]
        pub fn update_project_proposal(
            _origin: OriginFor<T>,
            ipfs: BoundedString<T::IPFSLength>,
        ) -> DispatchResult {
            let proposal = ProjectProposals::<T>::get(ipfs.clone()).unwrap();

            // Get the votes that were made for the report
            let votes_for: u16 = proposal.votes_for.len().try_into().unwrap();
            let votes_against: u16 = proposal.votes_against.len().try_into().unwrap();
            let votes_total: u16 = votes_for + votes_against;

            // Check if the vote has passed
            if Self::has_vote_passed(votes_total, votes_for) {
                // Create a new project
                let new_project = ProjectInfo {
                    documentation_ipfs: ipfs.clone(),
                    project_owner: proposal.project_owner.clone(),
                    creation_date: T::Time::now(),
                    penalty_level: 0,
                    penalty_timeout: BlockNumber::<T>::from(0u32),
                };

                // Save new project
                Projects::<T>::insert(proposal.project_hash, new_project);
            }

            // Update proposal
            // Note: Only change is made to the voting_active cycle status
            let new_proposal = ProjectProposalInfo {
                voting_active: false,
                ..proposal
            };

            // Save new proposal
            ProjectProposals::<T>::insert(ipfs.clone(), new_proposal);

            Self::deposit_event(Event::ProjectProposalUpdated(ipfs));

            Ok(())
        }

        #[pallet::call_index(22)]
        #[pallet::weight(<T as Config>::WeightInfo::update_carbon_credit_batch_proposal())]
        pub fn update_carbon_credit_batch_proposal(
            _origin: OriginFor<T>,
            ipfs: BoundedString<T::IPFSLength>,
        ) -> DispatchResult {
            let proposal = CarbonCreditBatchProposals::<T>::get(ipfs.clone()).unwrap();

            // Get the votes that were made for the report
            let votes_for: u16 = proposal.votes_for.len().try_into().unwrap();
            let votes_against: u16 = proposal.votes_against.len().try_into().unwrap();
            let votes_total: u16 = votes_for + votes_against;

            // Check if the vote has passed
            if Self::has_vote_passed(votes_total, votes_for) {
                // Create a new project
                let new_batch = CarbonCreditBatchInfo {
                    documentation_ipfs: ipfs.clone(),
                    project_hash: proposal.project_hash,
                    creation_date: T::Time::now(),
                    credit_amount: proposal.credit_amount,
                    penalty_repay_price: proposal.penalty_repay_price,
                    status: CarbonCreditBatchStatus::Active,
                    validator_benefactors: proposal.votes_for.clone(),
                };

                // Save new carbon credit batch
                CarbonCreditBatches::<T>::insert(proposal.batch_hash, new_batch);

                // Create carbon credit holdings for project owner
                let new_holdings = CarbonCreditHoldingsInfo {
                    available_amount: proposal.credit_amount.into(),
                    unavailable_amount: BalanceOf::<T>::from(0u32),
                };

                // Get project owner accountID
                let project = Projects::<T>::get(proposal.project_hash).unwrap();

                // Save project owner carbon credit holdings
                CarbonCreditHoldings::<T>::insert(
                    proposal.batch_hash,
                    project.project_owner,
                    new_holdings,
                );
            }

            // Create new proposal
            // Note: Only change is made to the voting_active cycle status
            let new_proposal = CarbonCreditBatchProposalInfo {
                voting_active: false,
                ..proposal
            };

            // Save new proposal
            CarbonCreditBatchProposals::<T>::insert(ipfs.clone(), new_proposal);

            Self::deposit_event(Event::CarbonCreditBatchProposalUpdated(ipfs));

            Ok(())
        }

        #[pallet::call_index(23)]
        #[pallet::weight(<T as Config>::WeightInfo::update_carbon_credit_sale_order())]
        pub fn update_carbon_credit_sale_order(
            _origin: OriginFor<T>,
            sale_hash: H256,
        ) -> DispatchResult {
            // Get sale order
            let mut sale_order = CarbonCreditSaleOrders::<T>::get(sale_hash).unwrap();

            // Update sale order
            sale_order = CarbonCreditSaleOrderInfo {
                sale_active: false,
                ..sale_order
            };

            CarbonCreditSaleOrders::<T>::insert(sale_hash, sale_order.clone());

            // Update seller holdings
            let mut seller_holdings =
                CarbonCreditHoldings::<T>::get(sale_order.batch_hash, sale_order.clone().seller)
                    .unwrap();

            seller_holdings = CarbonCreditHoldingsInfo {
                available_amount: seller_holdings.available_amount + sale_order.credit_amount,
                unavailable_amount: seller_holdings.unavailable_amount - sale_order.credit_amount,
            };

            CarbonCreditHoldings::<T>::insert(
                sale_order.batch_hash,
                sale_order.seller,
                seller_holdings,
            );

            Self::deposit_event(Event::CarbonCreditSaleOrderUpdated(sale_hash));

            Ok(())
        }

        #[pallet::call_index(24)]
        #[pallet::weight(<T as Config>::WeightInfo::update_complaint_for_account())]
        pub fn update_complaint_for_account(
            _origin: OriginFor<T>,
            complaint: BoundedString<T::IPFSLength>,
        ) -> DispatchResult {
            let mut specific_complaint =
                ComplaintsForAccounts::<T>::get(complaint.clone()).unwrap();

            specific_complaint = ComplaintAccountBasedInfo {
                complaint_active: false,
                ..specific_complaint
            };

            // Get the votes that were made for the report
            let votes_for: u16 = specific_complaint.votes_for.len().try_into().unwrap();
            let votes_against: u16 = specific_complaint.votes_against.len().try_into().unwrap();
            let votes_total: u16 = votes_for + votes_against;

            // Update penalties only if the complaint passed
            if Self::has_vote_passed(votes_total, votes_for) {
                let current_block = frame_system::Pallet::<T>::block_number();
                let new_timeout_block =
                    current_block + PalletTimeValues::<T>::get().penalty_timeout;

                // Match complaint type
                match specific_complaint.complaint_type {
                    ComplaintType::ProjectOwnerComplaint => {
                        // Update values for project owner
                        let mut project_owner =
                            ProjectOwners::<T>::get(specific_complaint.clone().complaint_for)
                                .unwrap();

                        // Remove previous penalty timeout if it existed
                        if PenaltyTimeoutsAccounts::<T>::contains_key(project_owner.penalty_timeout)
                        {
                            let mut penalty_timeouts =
                                PenaltyTimeoutsAccounts::<T>::get(project_owner.penalty_timeout)
                                    .unwrap();

                            penalty_timeouts.remove(&specific_complaint.clone().complaint_for);

                            PenaltyTimeoutsAccounts::<T>::insert(
                                project_owner.penalty_timeout,
                                penalty_timeouts,
                            );
                        }

                        project_owner = ProjectValidatorOrProjectOwnerInfo {
                            penalty_level: project_owner.penalty_level + 1,
                            penalty_timeout: new_timeout_block,
                            ..project_owner
                        };

                        ProjectOwners::<T>::insert(
                            specific_complaint.clone().complaint_for,
                            project_owner,
                        );

                        // Unfreeze all batches
                        Self::unfreeze_all_owner_batches(specific_complaint.clone().complaint_for);
                    }
                    ComplaintType::ValidatorComplaint => {
                        // Update values for validator
                        let mut validator =
                            Validators::<T>::get(specific_complaint.clone().complaint_for).unwrap();

                        // Remove previous penalty timeout if it existed
                        if PenaltyTimeoutsAccounts::<T>::contains_key(validator.penalty_timeout) {
                            let mut penalty_timeouts =
                                PenaltyTimeoutsAccounts::<T>::get(validator.penalty_timeout)
                                    .unwrap();
                            penalty_timeouts.remove(&specific_complaint.clone().complaint_for);

                            PenaltyTimeoutsAccounts::<T>::insert(
                                validator.penalty_timeout,
                                penalty_timeouts,
                            );
                        }

                        validator = ProjectValidatorOrProjectOwnerInfo {
                            penalty_level: validator.penalty_level + 1,
                            penalty_timeout: new_timeout_block,
                            ..validator
                        };

                        Validators::<T>::insert(
                            specific_complaint.clone().complaint_for,
                            validator,
                        );
                    }
                    _ => {}
                }

                let mut penalty_timeouts = BTreeSet::<AccountIdOf<T>>::new();

                if PenaltyTimeoutsAccounts::<T>::contains_key(new_timeout_block) {
                    penalty_timeouts =
                        PenaltyTimeoutsAccounts::<T>::get(new_timeout_block).unwrap();
                }

                penalty_timeouts.insert(specific_complaint.clone().complaint_for);

                PenaltyTimeoutsAccounts::<T>::insert(new_timeout_block, penalty_timeouts);
            }

            ComplaintsForAccounts::<T>::insert(complaint.clone(), specific_complaint);

            Self::deposit_event(Event::AccountComplaintUpdated(complaint));

            Ok(())
        }

        #[pallet::call_index(25)]
        #[pallet::weight(<T as Config>::WeightInfo::update_complaint_for_hash())]
        pub fn update_complaint_for_hash(
            _origin: OriginFor<T>,
            complaint: BoundedString<T::IPFSLength>,
        ) -> DispatchResult {
            let mut specific_complaint = ComplaintsForHashes::<T>::get(complaint.clone()).unwrap();

            specific_complaint = ComplaintHashBasedInfo {
                complaint_active: false,
                ..specific_complaint
            };

            // Get the votes that were made for the report
            let votes_for: u16 = specific_complaint.votes_for.len().try_into().unwrap();
            let votes_against: u16 = specific_complaint.votes_against.len().try_into().unwrap();
            let votes_total: u16 = votes_for + votes_against;

            // Update penalties only if the complaint passed
            if Self::has_vote_passed(votes_total, votes_for) {
                let current_block = frame_system::Pallet::<T>::block_number();
                let new_timeout_block =
                    current_block + PalletTimeValues::<T>::get().penalty_timeout;

                // Match complaint type
                match specific_complaint.complaint_type {
                    ComplaintType::CarbonCreditBatchComplaint => {
                        // Update values for carbon credit batch
                        let mut batch =
                            CarbonCreditBatches::<T>::get(specific_complaint.clone().complaint_for)
                                .unwrap();

                        batch = CarbonCreditBatchInfo {
                            status: CarbonCreditBatchStatus::Redacted,
                            ..batch
                        };

                        CarbonCreditBatches::<T>::insert(
                            specific_complaint.clone().complaint_for,
                            batch,
                        );

                        // Recalculate carbon balances for CFAs
                        Self::recalculate_cfa_balances(specific_complaint.clone().complaint_for);

                        // Calculate and save repayments needed for project owner
                        Self::calculate_project_owner_debts(
                            specific_complaint.clone().complaint_for,
                        );
                    }
                    ComplaintType::ProjectComplaint => {
                        // Update values for project
                        let mut project =
                            Projects::<T>::get(specific_complaint.clone().complaint_for).unwrap();

                        // Remove previous penalty timeout if it existed
                        if PenaltyTimeoutsHashes::<T>::contains_key(project.penalty_timeout) {
                            let mut penalty_timeouts =
                                PenaltyTimeoutsHashes::<T>::get(project.penalty_timeout).unwrap();
                            penalty_timeouts.remove(&specific_complaint.clone().complaint_for);

                            PenaltyTimeoutsHashes::<T>::insert(
                                project.penalty_timeout,
                                penalty_timeouts,
                            );
                        }

                        project = ProjectInfo {
                            penalty_level: project.penalty_level + 1,
                            penalty_timeout: new_timeout_block,
                            ..project
                        };

                        Projects::<T>::insert(specific_complaint.clone().complaint_for, project);

                        Self::unfreeze_all_project_batches(
                            specific_complaint.clone().complaint_for,
                        );
                    }
                    _ => {}
                }

                let mut penalty_timeouts = BTreeSet::<H256>::new();

                if PenaltyTimeoutsHashes::<T>::contains_key(new_timeout_block) {
                    penalty_timeouts = PenaltyTimeoutsHashes::<T>::get(new_timeout_block).unwrap();
                }

                penalty_timeouts.insert(specific_complaint.clone().complaint_for);

                PenaltyTimeoutsHashes::<T>::insert(new_timeout_block, penalty_timeouts);
            }

            ComplaintsForHashes::<T>::insert(complaint.clone(), specific_complaint);

            Self::deposit_event(Event::HashComplaintUpdated(complaint));

            Ok(())
        }

        #[pallet::call_index(26)]
        #[pallet::weight(<T as Config>::WeightInfo::update_project_owner_penalty_level())]
        pub fn update_project_owner_penalty_level(
            _origin: OriginFor<T>,
            account_id: AccountIdOf<T>,
        ) -> DispatchResult {
            let mut project_owner = ProjectOwners::<T>::get(account_id.clone()).unwrap();

            let current_block = frame_system::Pallet::<T>::block_number();
            let new_timeout_block = current_block + PalletTimeValues::<T>::get().penalty_timeout;

            let new_penalty_level = project_owner.penalty_level - 1;
            let mut new_penalty_timeout = new_timeout_block;

            if new_penalty_level == 0 {
                new_penalty_timeout = BlockNumber::<T>::from(0u32);
            }

            project_owner = ProjectValidatorOrProjectOwnerInfo {
                penalty_level: new_penalty_level,
                penalty_timeout: new_penalty_timeout,
                ..project_owner
            };

            ProjectOwners::<T>::insert(account_id.clone(), project_owner);

            Self::deposit_event(Event::ProjectOwnerPenaltyLevelUpdated(account_id));

            Ok(())
        }

        #[pallet::call_index(27)]
        #[pallet::weight(<T as Config>::WeightInfo::update_validator_penalty_level())]
        pub fn update_validator_penalty_level(
            _origin: OriginFor<T>,
            account_id: AccountIdOf<T>,
        ) -> DispatchResult {
            let mut validator = Validators::<T>::get(account_id.clone()).unwrap();

            let current_block = frame_system::Pallet::<T>::block_number();
            let new_timeout_block = current_block + PalletTimeValues::<T>::get().penalty_timeout;

            let new_penalty_level = validator.penalty_level - 1;
            let mut new_penalty_timeout = new_timeout_block;

            if new_penalty_level == 0 {
                new_penalty_timeout = BlockNumber::<T>::from(0u32);
            }

            validator = ProjectValidatorOrProjectOwnerInfo {
                penalty_level: new_penalty_level,
                penalty_timeout: new_penalty_timeout,
                ..validator
            };

            Validators::<T>::insert(account_id.clone(), validator);

            Self::deposit_event(Event::ValidatorPenaltyLevelUpdated(account_id));

            Ok(())
        }

        #[pallet::call_index(28)]
        #[pallet::weight(<T as Config>::WeightInfo::update_project_penalty_level())]
        pub fn update_project_penalty_level(_origin: OriginFor<T>, hash: H256) -> DispatchResult {
            let mut project = Projects::<T>::get(hash).unwrap();

            let current_block = frame_system::Pallet::<T>::block_number();
            let new_timeout_block = current_block + PalletTimeValues::<T>::get().penalty_timeout;

            let new_penalty_level = project.penalty_level - 1;
            let mut new_penalty_timeout = new_timeout_block;

            if new_penalty_level == 0 {
                new_penalty_timeout = BlockNumber::<T>::from(0u32);
            }

            project = ProjectInfo {
                penalty_level: new_penalty_level,
                penalty_timeout: new_penalty_timeout,
                ..project
            };

            Projects::<T>::insert(hash, project);

            Self::deposit_event(Event::ProjectPenaltyLevelUpdated(hash));

            Ok(())
        }
    }

    #[pallet::validate_unsigned]
    impl<T: Config> ValidateUnsigned for Pallet<T> {
        type Call = Call<T>;

        fn validate_unsigned(_source: TransactionSource, call: &Self::Call) -> TransactionValidity {
            match call {
                Call::update_pallet_base_time {
                    new_pallet_base_time,
                } => ValidTransaction::with_tag_prefix("Veles::update_pallet_base_time")
                    .priority(T::UnsignedPriority::get())
                    .longevity(T::UnsignedLongevity::get())
                    .and_provides([new_pallet_base_time])
                    .propagate(true)
                    .build(),
                Call::update_carbon_footprint_report { ipfs } => {
                    ValidTransaction::with_tag_prefix("Veles::update_carbon_footprint_report")
                        .priority(T::UnsignedPriority::get())
                        .longevity(T::UnsignedLongevity::get())
                        .and_provides([ipfs])
                        .propagate(true)
                        .build()
                }
                Call::update_project_proposal { ipfs } => {
                    ValidTransaction::with_tag_prefix("Veles::update_project_proposal")
                        .priority(T::UnsignedPriority::get())
                        .longevity(T::UnsignedLongevity::get())
                        .and_provides([ipfs])
                        .propagate(true)
                        .build()
                }
                Call::update_carbon_credit_batch_proposal { ipfs } => {
                    ValidTransaction::with_tag_prefix("Veles::update_carbon_credit_batch_proposal")
                        .priority(T::UnsignedPriority::get())
                        .longevity(T::UnsignedLongevity::get())
                        .and_provides([ipfs])
                        .propagate(true)
                        .build()
                }
                Call::update_carbon_credit_sale_order { sale_hash } => {
                    ValidTransaction::with_tag_prefix("Veles::update_carbon_credit_sale_order")
                        .priority(T::UnsignedPriority::get())
                        .longevity(T::UnsignedLongevity::get())
                        .and_provides([sale_hash])
                        .propagate(true)
                        .build()
                }
                Call::update_complaint_for_account { complaint } => {
                    ValidTransaction::with_tag_prefix("Veles::update_complaint_for_account")
                        .priority(T::UnsignedPriority::get())
                        .longevity(T::UnsignedLongevity::get())
                        .and_provides([complaint])
                        .propagate(true)
                        .build()
                }
                Call::update_complaint_for_hash { complaint } => {
                    ValidTransaction::with_tag_prefix("Veles::update_complaint_for_hash")
                        .priority(T::UnsignedPriority::get())
                        .longevity(T::UnsignedLongevity::get())
                        .and_provides([complaint])
                        .propagate(true)
                        .build()
                }
                Call::update_project_owner_penalty_level { account_id } => {
                    ValidTransaction::with_tag_prefix("Veles::update_project_owner_penalty_level")
                        .priority(T::UnsignedPriority::get())
                        .longevity(T::UnsignedLongevity::get())
                        .and_provides([account_id])
                        .propagate(true)
                        .build()
                }
                Call::update_validator_penalty_level { account_id } => {
                    ValidTransaction::with_tag_prefix("Veles::update_validator_penalty_level")
                        .priority(T::UnsignedPriority::get())
                        .longevity(T::UnsignedLongevity::get())
                        .and_provides([account_id])
                        .propagate(true)
                        .build()
                }
                Call::update_project_penalty_level { hash } => {
                    ValidTransaction::with_tag_prefix("Veles::update_project_penalty_level")
                        .priority(T::UnsignedPriority::get())
                        .longevity(T::UnsignedLongevity::get())
                        .and_provides([hash])
                        .propagate(true)
                        .build()
                }
                _ => {
                    warn!("Unknown unsigned call {:?}", call);
                    InvalidTransaction::Call.into()
                }
            }
        }
    }

    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
        fn offchain_worker(now: BlockNumber<T>) {
            // Check if a year has passed and update pallet base time if it has
            // Note: The base pallet time will update once a year has passed (in blocks)
            let pallet_times = PalletTimeValues::<T>::get();

            if pallet_times.pallet_base_time == 0u32.into()
                || now > pallet_times.pallet_base_time + pallet_times.number_of_blocks_per_year
            {
                info!("👷 Offchain worker: Updating base pallet time");

                let call = Call::<T>::update_pallet_base_time {
                    new_pallet_base_time: now.clone(),
                };

                if let Err(err) =
                    SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(call.into())
                {
                    warn!(
                        "👷 Offchain worker: Failed to update base pallet time.🚧 Error: {:?}",
                        err
                    );
                } else {
                    info!("👷 Offchain worker: Successfully updated base pallet time");
                }
            }

            // Check if any complaint timeout event has occured
            if ComplaintTimeouts::<T>::contains_key(now) {
                let complaint_events = ComplaintTimeouts::<T>::get(now).unwrap();

                for complaint in complaint_events.iter() {
                    if ComplaintsForAccounts::<T>::contains_key(complaint.clone()) {
                        info!("👷 Offchain worker: Updating complaint for account ");

                        let call = Call::<T>::update_complaint_for_account {
                            complaint: complaint.clone(),
                        };

                        if let Err(err) =
                            SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(
                                call.into(),
                            )
                        {
                            warn!(
									"👷 Offchain worker: Failed to update complaint for account .🚧 Error: {:?}",
									err
								);
                        } else {
                            info!(
                                "👷 Offchain worker: Successfully updated complaint for account "
                            );
                        }
                    }

                    if ComplaintsForHashes::<T>::contains_key(complaint.clone()) {
                        info!("👷 Offchain worker: Updating complaint for hash ");

                        let call = Call::<T>::update_complaint_for_hash {
                            complaint: complaint.clone(),
                        };

                        if let Err(err) =
                            SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(
                                call.into(),
                            )
                        {
                            warn!(
									"👷 Offchain worker: Failed to update complaint for hash .🚧 Error: {:?}",
									err
								);
                        } else {
                            info!("👷 Offchain worker: Successfully updated complaint for hash ");
                        }
                    }
                }

                // Remove execuded timeout events
                ComplaintTimeouts::<T>::remove(now);
            }

            // Check if a voting timeout event has occured
            if VotingTimeouts::<T>::contains_key(now) {
                let timeout_events = VotingTimeouts::<T>::get(now).unwrap();

                for ipfs in timeout_events.iter() {
                    // Check if IPFS is related to a carbon footprint report
                    if CarbonFootprintReports::<T>::contains_key(ipfs.clone()) {
                        info!("👷 Offchain worker: Updating carbon footprint report");

                        let call = Call::<T>::update_carbon_footprint_report { ipfs: ipfs.clone() };

                        if let Err(err) =
                            SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(
                                call.into(),
                            )
                        {
                            warn!(
								"👷 Offchain worker: Failed to update carbon footprint report.🚧 Error: {:?}",
								err
							);
                        } else {
                            info!(
                                "👷 Offchain worker: Successfully updated carbon footprint report"
                            );
                        }
                    }

                    // Check if IPFS is related to a project proposal
                    if ProjectProposals::<T>::contains_key(ipfs.clone()) {
                        info!("👷 Offchain worker: Updating project proposal");

                        let call = Call::<T>::update_project_proposal { ipfs: ipfs.clone() };

                        if let Err(err) =
                            SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(
                                call.into(),
                            )
                        {
                            warn!(
								"👷 Offchain worker: Failed to update project proposal.🚧 Error: {:?}",
								err
							);
                        } else {
                            info!("👷 Offchain worker: Successfully updated project proposal");
                        }
                    }

                    // Check if IPFS is related to a carbon credits batch proposal
                    if CarbonCreditBatchProposals::<T>::contains_key(ipfs.clone()) {
                        info!("👷 Offchain worker: Updating carbon credit batch proposal");

                        let call =
                            Call::<T>::update_carbon_credit_batch_proposal { ipfs: ipfs.clone() };

                        if let Err(err) =
                            SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(
                                call.into(),
                            )
                        {
                            warn!(
								"👷 Offchain worker: Failed to update carbon credit batch proposal.🚧 Error: {:?}",
								err
							);
                        } else {
                            info!("👷 Offchain worker: Successfully updated carbon credit batch proposal");
                        }
                    }
                }

                VotingTimeouts::<T>::remove(now);
            }

            // Check if a sale timeout event has occured
            if SaleOrderTimeouts::<T>::contains_key(now) {
                let sale_events = SaleOrderTimeouts::<T>::get(now).unwrap();

                for sale_hash in sale_events.iter() {
                    info!("👷 Offchain worker: Updating carbon credit sale order");

                    let call = Call::<T>::update_carbon_credit_sale_order {
                        sale_hash: *sale_hash,
                    };

                    if let Err(err) =
                        SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(call.into())
                    {
                        warn!(
								"👷 Offchain worker: Failed to update carbon credit sale order.🚧 Error: {:?}",
								err
							);
                    } else {
                        info!("👷 Offchain worker: Successfully updated carbon credit sale order");
                    }
                }

                SaleOrderTimeouts::<T>::remove(&now);
            }

            // Check if any penalty timeout event has occured
            if PenaltyTimeoutsAccounts::<T>::contains_key(now) {
                let account_ids = PenaltyTimeoutsAccounts::<T>::get(now).unwrap();

                for account_id in account_ids.iter() {
                    if ProjectOwners::<T>::contains_key(account_id) {
                        info!("👷 Offchain worker: Updating project owner penalty level");

                        let call = Call::<T>::update_project_owner_penalty_level {
                            account_id: account_id.clone(),
                        };

                        if let Err(err) =
                            SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(
                                call.into(),
                            )
                        {
                            warn!(
									"👷 Offchain worker: Failed to update project owner penalty level.🚧 Error: {:?}",
									err
								);
                        } else {
                            info!(
								"👷 Offchain worker: Successfully updated project owner penalty level"
							);
                        }
                    }

                    if Validators::<T>::contains_key(account_id) {
                        info!("👷 Offchain worker: Updating validator penalty level");

                        let call = Call::<T>::update_validator_penalty_level {
                            account_id: account_id.clone(),
                        };

                        if let Err(err) =
                            SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(
                                call.into(),
                            )
                        {
                            warn!(
									"👷 Offchain worker: Failed to update validator penalty level.🚧 Error: {:?}",
									err
								);
                        } else {
                            info!(
                                "👷 Offchain worker: Successfully updated validator penalty level"
                            );
                        }
                    }
                }

                PenaltyTimeoutsAccounts::<T>::remove(now);
            }

            if PenaltyTimeoutsHashes::<T>::contains_key(now) {
                let hashes = PenaltyTimeoutsHashes::<T>::get(now).unwrap();

                for hash in hashes.iter() {
                    if Projects::<T>::contains_key(hash) {
                        info!("👷 Offchain worker: Updating project  penalty level");

                        let call = Call::<T>::update_project_penalty_level { hash: *hash };

                        if let Err(err) =
                            SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(
                                call.into(),
                            )
                        {
                            warn!(
									"👷 Offchain worker: Failed to update project  penalty level.🚧 Error: {:?}",
									err
								);
                        } else {
                            info!(
                                "👷 Offchain worker: Successfully updated project  penalty level"
                            );
                        }
                    }
                }

                PenaltyTimeoutsHashes::<T>::remove(now);
            }
        }
    }

    impl<T: Config> Pallet<T> {
        // Get account ID of pallet
        fn pallet_id() -> T::AccountId {
            PALLET_ID.into_account_truncating()
        }

        // Generate hash identifier
        fn generate_hash(user: AccountIdOf<T>) -> H256 {
            let nonce = frame_system::Pallet::<T>::account_nonce(&user);
            let now = T::Time::now();

            let encoded: [u8; 32] = (&user, nonce, now).using_encoded(blake2_256);

            let hash = H256::from(encoded);

            hash
        }

        // Check if the documentation (ipfs link) has been used previously
        // Return false if the documentation is used
        // Return true if the documentation is available
        pub fn is_ipfs_available(ipfs: BoundedString<T::IPFSLength>) -> bool {
            // Check in reports and proposals
            if CarbonFootprintReports::<T>::contains_key(ipfs.clone())
                || ProjectProposals::<T>::contains_key(ipfs.clone())
                || CarbonCreditBatchProposals::<T>::contains_key(ipfs.clone())
                || ComplaintsForAccounts::<T>::contains_key(ipfs.clone())
                || ComplaintsForHashes::<T>::contains_key(ipfs.clone())
            {
                return false;
            }

            // Check in CF accounts
            for (_, cfa_info) in <CarbonFootprintAccounts<T>>::iter() {
                let documentation = cfa_info.documentation_ipfses;

                if documentation.contains(&ipfs) {
                    return false;
                }
            }

            // Check in validators
            for (_, validator) in <Validators<T>>::iter() {
                if validator.documentation_ipfs == ipfs {
                    return false;
                }
            }

            // Check in project owners
            for (_, project_owner) in <ProjectOwners<T>>::iter() {
                if project_owner.documentation_ipfs == ipfs {
                    return false;
                }
            }

            return true;
        }

        // Check if the account is tied to any existing entity on the pallet
        // Return false if the account_id is used
        // Return true if the account_id is available
        pub fn is_account_id_available(account_id: AccountIdOf<T>) -> bool {
            // Check in carbon footprint, trader, project validator and project owner accounts
            if CarbonFootprintAccounts::<T>::contains_key(account_id.clone())
                || TraderAccounts::<T>::get().contains(&account_id.clone())
                || Validators::<T>::contains_key(account_id.clone())
                || ProjectOwners::<T>::contains_key(account_id.clone())
            {
                return false;
            }

            return true;
        }

        // Check if the account is eligible to be a carbon footpring account
        // Return true if the account_id isn't in use for another account type
        // Return false if the account_id is in use for another account type
        pub fn is_eligible_for_cfa(account_id: AccountIdOf<T>) -> bool {
            // Check in carbon footprint, trader, validator and project owner accounts
            if TraderAccounts::<T>::get().contains(&account_id.clone())
                || Validators::<T>::contains_key(account_id.clone())
                || ProjectOwners::<T>::contains_key(account_id.clone())
            {
                return false;
            }

            return true;
        }

        // Check if the account is eligible for carbon credit transactions
        // Return true if the account_id can transact with carbon credits (CFA, Trader, Project Owner)
        // Return true if the account_id can't transact with carbon credits (Validator, or non-registered account)
        pub fn is_eligible_for_carbon_credit_transaction(account_id: AccountIdOf<T>) -> bool {
            if CarbonFootprintAccounts::<T>::contains_key(account_id.clone())
                || TraderAccounts::<T>::get().contains(&account_id.clone())
                || ProjectOwners::<T>::contains_key(account_id.clone())
            {
                return true;
            }

            return false;
        }

        // Check if the account has submitted a carbon footprint report for voting
        // Note: If a user has submitted a CF report he/she then can not registed as another account type
        pub fn is_trying_to_register_as_cfa(account_id: AccountIdOf<T>) -> bool {
            let mut result = false;

            // Check in CF accounts
            for (_, cf_report) in <CarbonFootprintReports<T>>::iter() {
                // Check if user has an active CF report that is up for voting
                if cf_report.cf_account == account_id && cf_report.voting_active {
                    result = true;
                }
            }

            result
        }

        // Recalculate CFA balances
        pub fn recalculate_cfa_balances(batch_hash: H256) {
            for (_, retirement_info) in CarbonCreditRetirements::<T>::iter() {
                if retirement_info.batch_hash == batch_hash {
                    let mut footprint_account = CarbonFootprintAccounts::<T>::get(
                        retirement_info.clone().carbon_footprint_account,
                    )
                    .unwrap();

                    if retirement_info.credit_amount >= footprint_account.carbon_footprint_surplus {
                        let change = retirement_info.credit_amount
                            - footprint_account.carbon_footprint_surplus;

                        footprint_account = CarbonFootprintAccountInfo {
                            carbon_footprint_surplus: BalanceOf::<T>::from(0u32),
                            carbon_footprint_deficit: footprint_account.carbon_footprint_deficit
                                + change,
                            ..footprint_account
                        };
                    } else {
                        footprint_account = CarbonFootprintAccountInfo {
                            carbon_footprint_surplus: footprint_account.carbon_footprint_surplus
                                - retirement_info.credit_amount,
                            ..footprint_account
                        };
                    }

                    CarbonFootprintAccounts::<T>::insert(
                        retirement_info.carbon_footprint_account,
                        footprint_account,
                    );
                }
            }
        }

        // Calculate project owner standing debts
        pub fn calculate_project_owner_debts(batch_hash: H256) {
            let batch_info = CarbonCreditBatches::<T>::get(batch_hash).unwrap();
            let project_info = Projects::<T>::get(batch_info.project_hash).unwrap();

            let mut debts = BTreeMap::<AccountIdOf<T>, BalanceOf<T>>::new();

            if ProjectOwnerDebts::<T>::contains_key(project_info.project_owner.clone()) {
                debts = ProjectOwnerDebts::<T>::get(project_info.project_owner.clone());
            }

            // Go through all carbon credit retirements
            for (_, retirement_info) in CarbonCreditRetirements::<T>::iter() {
                if retirement_info.batch_hash == batch_hash {
                    let mut debt_amount =
                        retirement_info.credit_amount * batch_info.penalty_repay_price;

                    if debts.contains_key(&retirement_info.carbon_footprint_account) {
                        debt_amount += *debts
                            .get(&retirement_info.carbon_footprint_account)
                            .unwrap();
                    }

                    debts.insert(retirement_info.carbon_footprint_account, debt_amount);
                }
            }

            // Go through all carbon credit holdings
            for (hash, holding_account, holdings_info) in CarbonCreditHoldings::<T>::iter() {
                if hash == batch_hash {
                    let total_credits =
                        holdings_info.available_amount + holdings_info.unavailable_amount;

                    let mut debt_amount = total_credits * batch_info.penalty_repay_price;

                    if debts.contains_key(&holding_account) {
                        debt_amount += *debts.get(&holding_account).unwrap();
                    }

                    if holding_account == project_info.project_owner {
                        debts.insert(Self::pallet_id(), debt_amount);
                    } else {
                        debts.insert(holding_account, debt_amount);
                    }
                }
            }

            ProjectOwnerDebts::<T>::insert(project_info.project_owner, debts);
        }

        // Check if vote has passed
        pub fn has_vote_passed(total_votes: u16, votes_for: u16) -> bool {
            let vote_pass_ratio = VotePassRatio::<T>::get();

            if vote_pass_ratio.upper_limit_part == 0 {
                if votes_for > total_votes - votes_for {
                    return true;
                } else {
                    return false;
                }
            }

            if vote_pass_ratio.upper_limit_part == vote_pass_ratio.proportion_part {
                if votes_for == total_votes {
                    return true;
                } else {
                    return false;
                }
            }

            let needed_votes =
                (vote_pass_ratio.proportion_part * total_votes) / vote_pass_ratio.upper_limit_part;

            if votes_for >= needed_votes {
                return true;
            }

            return false;
        }

        // Freeze all carbon credit batches for given project owner
        pub fn freeze_all_owner_batches(project_owner: AccountIdOf<T>) {
            let mut project_hashes = BTreeSet::<H256>::new();

            for (project_hash, project_info) in Projects::<T>::iter() {
                if project_info.project_owner == project_owner {
                    project_hashes.insert(project_hash);
                }
            }

            for (batch_hash, mut batch_info) in CarbonCreditBatches::<T>::iter() {
                if project_hashes.contains(&batch_info.project_hash) {
                    batch_info = CarbonCreditBatchInfo {
                        status: CarbonCreditBatchStatus::Frozen,
                        ..batch_info
                    };

                    CarbonCreditBatches::<T>::insert(batch_hash, batch_info);
                }
            }
        }

        // Unfreeze all carbon credit batches for given project owner
        pub fn unfreeze_all_owner_batches(project_owner: AccountIdOf<T>) {
            let mut project_hashes = BTreeSet::<H256>::new();

            for (project_hash, project_info) in Projects::<T>::iter() {
                if project_info.project_owner == project_owner {
                    project_hashes.insert(project_hash);
                }
            }

            for (batch_hash, mut batch_info) in CarbonCreditBatches::<T>::iter() {
                if project_hashes.contains(&batch_info.project_hash) {
                    batch_info = CarbonCreditBatchInfo {
                        status: CarbonCreditBatchStatus::Active,
                        ..batch_info
                    };

                    CarbonCreditBatches::<T>::insert(batch_hash, batch_info);
                }
            }
        }

        // Freeze all carbon credit batches for given project
        pub fn freeze_all_project_batches(project: H256) {
            for (batch_hash, mut batch_info) in CarbonCreditBatches::<T>::iter() {
                if batch_info.project_hash == project {
                    batch_info = CarbonCreditBatchInfo {
                        status: CarbonCreditBatchStatus::Frozen,
                        ..batch_info
                    };

                    CarbonCreditBatches::<T>::insert(batch_hash, batch_info);
                }
            }
        }

        // Unfreeze all carbon credit batches for given project
        pub fn unfreeze_all_project_batches(project: H256) {
            for (batch_hash, mut batch_info) in CarbonCreditBatches::<T>::iter() {
                if batch_info.project_hash == project {
                    batch_info = CarbonCreditBatchInfo {
                        status: CarbonCreditBatchStatus::Active,
                        ..batch_info
                    };

                    CarbonCreditBatches::<T>::insert(batch_hash, batch_info);
                }
            }
        }

        // Check if at max potential penalty level for account type entity
        pub fn is_account_at_max_potential_penalty(account_id: AccountIdOf<T>) -> bool {
            let mut active_complaints: u8 = 0;

            if Validators::<T>::contains_key(account_id.clone()) {
                let account = Validators::<T>::get(account_id.clone()).unwrap();

                active_complaints += account.penalty_level;
            } else {
                let account = ProjectOwners::<T>::get(account_id.clone()).unwrap();

                active_complaints += account.penalty_level;
            }

            for (_, complaint_info) in ComplaintsForAccounts::<T>::iter() {
                if complaint_info.complaint_active && complaint_info.complaint_for == account_id {
                    active_complaints += 1;
                }
            }

            return active_complaints == 4;
        }

        // Check if at max potential penalty level for hash type entity
        pub fn is_hash_at_max_potential_penalty(hash: H256) -> bool {
            let mut active_complaints: u8 = 0;

            let project = Projects::<T>::get(hash).unwrap();

            active_complaints += project.penalty_level;

            for (_, complaint_info) in ComplaintsForHashes::<T>::iter() {
                if complaint_info.complaint_active && complaint_info.complaint_for == hash {
                    active_complaints += 1;
                }
            }

            return active_complaints == 4;
        }

        // Check if there is a ongoing complaint for the given carbon credit batch
        pub fn has_a_ongoing_complaint(batch_hash: H256) -> bool {
            let mut result = false;

            for (_, complaint_info) in ComplaintsForHashes::<T>::iter() {
                if complaint_info.complaint_active && complaint_info.complaint_for == batch_hash {
                    result = true
                }
            }

            return result;
        }

        // Calculate basic payment made to pallet
        pub fn calculate_basic_payment_made_to_pallet(
            from: AccountIdOf<T>,
            amount: BalanceOf<T>,
        ) -> BalanceOf<T> {
            // Retrieve needed account info data
            let mut account_info = ProjectValidatorOrProjectOwnerInfo {
                documentation_ipfs: BoundedString::<T::IPFSLength>::truncate_from("empty_ipfs"),
                penalty_level: 0u8,
                penalty_timeout: frame_system::Pallet::<T>::block_number(),
            };

            if Validators::<T>::contains_key(from.clone()) {
                account_info = Validators::<T>::get(from.clone()).unwrap();
            }

            if ProjectOwners::<T>::contains_key(from.clone()) {
                account_info = ProjectOwners::<T>::get(from.clone()).unwrap();
            }

            // Set penalty level percentage
            let mut penalty_percentage = BalanceOf::<T>::from(10000u32);

            if account_info.documentation_ipfs
                != BoundedString::<T::IPFSLength>::truncate_from("empty_ipfs")
            {
                let penalty_percentages = PenaltyLevels::<T>::get();

                penalty_percentage = penalty_percentages[&account_info.penalty_level];
            }

            let actual_amount = BalanceOf::<T>::from(10000u32) * amount / penalty_percentage;

            actual_amount
        }

        // Calculate complex payment made to pallet
        // Note: Only used for project owners during proposition for carbon credit batches
        pub fn calculate_complex_payment_made_to_pallet(
            owner_id: AccountIdOf<T>,
            project_hash: H256,
            amount: BalanceOf<T>,
        ) -> BalanceOf<T> {
            // Get owner info
            let owner_info = ProjectOwners::<T>::get(owner_id).unwrap();

            // Get project info
            let project_info = Projects::<T>::get(project_hash).unwrap();

            // Get penalty levels
            let penalty_levels = PenaltyLevels::<T>::get();

            // Get owner and project penalty level values
            let owner_penalty_percentage = penalty_levels[&owner_info.penalty_level];
            let project_penalty_percentage = penalty_levels[&project_info.penalty_level];

            // Calculate total penalty percentage
            let penalty_percentage = owner_penalty_percentage * project_penalty_percentage
                / BalanceOf::<T>::from(10000u32);

            // Calculate actual amount that needs to be paid
            let actual_amount = BalanceOf::<T>::from(10000u32) * amount / penalty_percentage;

            actual_amount
        }

        // Calculate gains penalties for a specific account
        pub fn calculate_gains_penalties(
            account_id: AccountIdOf<T>,
            amount: BalanceOf<T>,
        ) -> BalanceOf<T> {
            let mut penalized_gains = BalanceOf::<T>::from(0u32);

            let penalty_values = PenaltyLevels::<T>::get();

            if ProjectOwners::<T>::contains_key(account_id.clone()) {
                let project_owner = ProjectOwners::<T>::get(account_id.clone()).unwrap();

                penalized_gains = amount * BalanceOf::<T>::from(10000u32)
                    / penalty_values[&project_owner.penalty_level];
            }

            if Validators::<T>::contains_key(account_id.clone()) {
                let validator = Validators::<T>::get(account_id).unwrap();

                penalized_gains = amount * BalanceOf::<T>::from(10000u32)
                    / penalty_values[&validator.penalty_level];
            }

            penalized_gains
        }

        // Process validator gains from benefctor split during a carbon credit sale
        pub fn process_validator_gains(
            buyer: AccountIdOf<T>,
            validator_benefactors: BTreeSet<AccountIdOf<T>>,
            validator_gains: BalanceOf<T>,
        ) {
            let num_of_validator_benefactors: u32 = validator_benefactors.len().try_into().unwrap();

            let gains_per_validator =
                validator_gains / BalanceOf::<T>::from(num_of_validator_benefactors);

            for validator in validator_benefactors.iter() {
                let validator_gains =
                    Self::calculate_gains_penalties(validator.clone(), gains_per_validator);

                // Transfer funds
                T::Currency::transfer(
                    &buyer,
                    &validator,
                    validator_gains,
                    ExistenceRequirement::KeepAlive,
                )
                .unwrap();

                let remainder = gains_per_validator - validator_gains;

                if remainder != BalanceOf::<T>::from(0u32) {
                    continue;
                }

                // Transfer funds
                T::Currency::transfer(
                    &buyer,
                    &Self::pallet_id(),
                    remainder,
                    ExistenceRequirement::KeepAlive,
                )
                .unwrap();
            }
        }

        // Process project owner gains from benefactor split during a carbon credit sale
        pub fn process_owner_gains(
            buyer: AccountIdOf<T>,
            project_owner: AccountIdOf<T>,
            owner_gains: BalanceOf<T>,
        ) {
            let real_owner_gains =
                Self::calculate_gains_penalties(project_owner.clone(), owner_gains);

            // Transfer funds
            T::Currency::transfer(
                &buyer,
                &project_owner,
                real_owner_gains,
                ExistenceRequirement::KeepAlive,
            )
            .unwrap();

            let remainder = owner_gains - real_owner_gains;

            if remainder != BalanceOf::<T>::from(0u32) {
                // Transfer funds
                T::Currency::transfer(
                    &buyer,
                    &Self::pallet_id(),
                    remainder,
                    ExistenceRequirement::KeepAlive,
                )
                .unwrap();
            }
        }
    }
}
