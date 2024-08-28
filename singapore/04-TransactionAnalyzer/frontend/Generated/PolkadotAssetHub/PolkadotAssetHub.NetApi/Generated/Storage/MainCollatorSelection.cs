//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using Substrate.NetApi;
using Substrate.NetApi.Model.Extrinsics;
using Substrate.NetApi.Model.Meta;
using Substrate.NetApi.Model.Types;
using Substrate.NetApi.Model.Types.Base;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;


namespace PolkadotAssetHub.NetApi.Generated.Storage
{
    
    
    /// <summary>
    /// >> CollatorSelectionStorage
    /// </summary>
    public sealed class CollatorSelectionStorage
    {
        
        // Substrate client for the storage calls.
        private SubstrateClientExt _client;
        
        /// <summary>
        /// >> CollatorSelectionStorage Constructor
        /// </summary>
        public CollatorSelectionStorage(SubstrateClientExt client)
        {
            this._client = client;
            _client.StorageKeyDict.Add(new System.Tuple<string, string>("CollatorSelection", "Invulnerables"), new System.Tuple<Substrate.NetApi.Model.Meta.Storage.Hasher[], System.Type, System.Type>(null, null, typeof(PolkadotAssetHub.NetApi.Generated.Model.bounded_collections.bounded_vec.BoundedVecT12)));
            _client.StorageKeyDict.Add(new System.Tuple<string, string>("CollatorSelection", "CandidateList"), new System.Tuple<Substrate.NetApi.Model.Meta.Storage.Hasher[], System.Type, System.Type>(null, null, typeof(PolkadotAssetHub.NetApi.Generated.Model.bounded_collections.bounded_vec.BoundedVecT13)));
            _client.StorageKeyDict.Add(new System.Tuple<string, string>("CollatorSelection", "LastAuthoredBlock"), new System.Tuple<Substrate.NetApi.Model.Meta.Storage.Hasher[], System.Type, System.Type>(new Substrate.NetApi.Model.Meta.Storage.Hasher[] {
                            Substrate.NetApi.Model.Meta.Storage.Hasher.Twox64Concat}, typeof(PolkadotAssetHub.NetApi.Generated.Model.sp_core.crypto.AccountId32), typeof(Substrate.NetApi.Model.Types.Primitive.U32)));
            _client.StorageKeyDict.Add(new System.Tuple<string, string>("CollatorSelection", "DesiredCandidates"), new System.Tuple<Substrate.NetApi.Model.Meta.Storage.Hasher[], System.Type, System.Type>(null, null, typeof(Substrate.NetApi.Model.Types.Primitive.U32)));
            _client.StorageKeyDict.Add(new System.Tuple<string, string>("CollatorSelection", "CandidacyBond"), new System.Tuple<Substrate.NetApi.Model.Meta.Storage.Hasher[], System.Type, System.Type>(null, null, typeof(Substrate.NetApi.Model.Types.Primitive.U128)));
        }
        
        /// <summary>
        /// >> InvulnerablesParams
        ///  The invulnerable, permissioned collators. This list must be sorted.
        /// </summary>
        public static string InvulnerablesParams()
        {
            return RequestGenerator.GetStorage("CollatorSelection", "Invulnerables", Substrate.NetApi.Model.Meta.Storage.Type.Plain);
        }
        
        /// <summary>
        /// >> InvulnerablesDefault
        /// Default value as hex string
        /// </summary>
        public static string InvulnerablesDefault()
        {
            return "0x00";
        }
        
        /// <summary>
        /// >> Invulnerables
        ///  The invulnerable, permissioned collators. This list must be sorted.
        /// </summary>
        public async Task<PolkadotAssetHub.NetApi.Generated.Model.bounded_collections.bounded_vec.BoundedVecT12> Invulnerables(string blockhash, CancellationToken token)
        {
            string parameters = CollatorSelectionStorage.InvulnerablesParams();
            var result = await _client.GetStorageAsync<PolkadotAssetHub.NetApi.Generated.Model.bounded_collections.bounded_vec.BoundedVecT12>(parameters, blockhash, token);
            return result;
        }
        
        /// <summary>
        /// >> CandidateListParams
        ///  The (community, limited) collation candidates. `Candidates` and `Invulnerables` should be
        ///  mutually exclusive.
        /// 
        ///  This list is sorted in ascending order by deposit and when the deposits are equal, the least
        ///  recently updated is considered greater.
        /// </summary>
        public static string CandidateListParams()
        {
            return RequestGenerator.GetStorage("CollatorSelection", "CandidateList", Substrate.NetApi.Model.Meta.Storage.Type.Plain);
        }
        
        /// <summary>
        /// >> CandidateListDefault
        /// Default value as hex string
        /// </summary>
        public static string CandidateListDefault()
        {
            return "0x00";
        }
        
        /// <summary>
        /// >> CandidateList
        ///  The (community, limited) collation candidates. `Candidates` and `Invulnerables` should be
        ///  mutually exclusive.
        /// 
        ///  This list is sorted in ascending order by deposit and when the deposits are equal, the least
        ///  recently updated is considered greater.
        /// </summary>
        public async Task<PolkadotAssetHub.NetApi.Generated.Model.bounded_collections.bounded_vec.BoundedVecT13> CandidateList(string blockhash, CancellationToken token)
        {
            string parameters = CollatorSelectionStorage.CandidateListParams();
            var result = await _client.GetStorageAsync<PolkadotAssetHub.NetApi.Generated.Model.bounded_collections.bounded_vec.BoundedVecT13>(parameters, blockhash, token);
            return result;
        }
        
        /// <summary>
        /// >> LastAuthoredBlockParams
        ///  Last block authored by collator.
        /// </summary>
        public static string LastAuthoredBlockParams(PolkadotAssetHub.NetApi.Generated.Model.sp_core.crypto.AccountId32 key)
        {
            return RequestGenerator.GetStorage("CollatorSelection", "LastAuthoredBlock", Substrate.NetApi.Model.Meta.Storage.Type.Map, new Substrate.NetApi.Model.Meta.Storage.Hasher[] {
                        Substrate.NetApi.Model.Meta.Storage.Hasher.Twox64Concat}, new Substrate.NetApi.Model.Types.IType[] {
                        key});
        }
        
        /// <summary>
        /// >> LastAuthoredBlockDefault
        /// Default value as hex string
        /// </summary>
        public static string LastAuthoredBlockDefault()
        {
            return "0x00000000";
        }
        
        /// <summary>
        /// >> LastAuthoredBlock
        ///  Last block authored by collator.
        /// </summary>
        public async Task<Substrate.NetApi.Model.Types.Primitive.U32> LastAuthoredBlock(PolkadotAssetHub.NetApi.Generated.Model.sp_core.crypto.AccountId32 key, string blockhash, CancellationToken token)
        {
            string parameters = CollatorSelectionStorage.LastAuthoredBlockParams(key);
            var result = await _client.GetStorageAsync<Substrate.NetApi.Model.Types.Primitive.U32>(parameters, blockhash, token);
            return result;
        }
        
        /// <summary>
        /// >> DesiredCandidatesParams
        ///  Desired number of candidates.
        /// 
        ///  This should ideally always be less than [`Config::MaxCandidates`] for weights to be correct.
        /// </summary>
        public static string DesiredCandidatesParams()
        {
            return RequestGenerator.GetStorage("CollatorSelection", "DesiredCandidates", Substrate.NetApi.Model.Meta.Storage.Type.Plain);
        }
        
        /// <summary>
        /// >> DesiredCandidatesDefault
        /// Default value as hex string
        /// </summary>
        public static string DesiredCandidatesDefault()
        {
            return "0x00000000";
        }
        
        /// <summary>
        /// >> DesiredCandidates
        ///  Desired number of candidates.
        /// 
        ///  This should ideally always be less than [`Config::MaxCandidates`] for weights to be correct.
        /// </summary>
        public async Task<Substrate.NetApi.Model.Types.Primitive.U32> DesiredCandidates(string blockhash, CancellationToken token)
        {
            string parameters = CollatorSelectionStorage.DesiredCandidatesParams();
            var result = await _client.GetStorageAsync<Substrate.NetApi.Model.Types.Primitive.U32>(parameters, blockhash, token);
            return result;
        }
        
        /// <summary>
        /// >> CandidacyBondParams
        ///  Fixed amount to deposit to become a collator.
        /// 
        ///  When a collator calls `leave_intent` they immediately receive the deposit back.
        /// </summary>
        public static string CandidacyBondParams()
        {
            return RequestGenerator.GetStorage("CollatorSelection", "CandidacyBond", Substrate.NetApi.Model.Meta.Storage.Type.Plain);
        }
        
        /// <summary>
        /// >> CandidacyBondDefault
        /// Default value as hex string
        /// </summary>
        public static string CandidacyBondDefault()
        {
            return "0x00000000000000000000000000000000";
        }
        
        /// <summary>
        /// >> CandidacyBond
        ///  Fixed amount to deposit to become a collator.
        /// 
        ///  When a collator calls `leave_intent` they immediately receive the deposit back.
        /// </summary>
        public async Task<Substrate.NetApi.Model.Types.Primitive.U128> CandidacyBond(string blockhash, CancellationToken token)
        {
            string parameters = CollatorSelectionStorage.CandidacyBondParams();
            var result = await _client.GetStorageAsync<Substrate.NetApi.Model.Types.Primitive.U128>(parameters, blockhash, token);
            return result;
        }
    }
    
    /// <summary>
    /// >> CollatorSelectionCalls
    /// </summary>
    public sealed class CollatorSelectionCalls
    {
        
        /// <summary>
        /// >> set_invulnerables
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method SetInvulnerables(Substrate.NetApi.Model.Types.Base.BaseVec<PolkadotAssetHub.NetApi.Generated.Model.sp_core.crypto.AccountId32> @new)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(@new.Encode());
            return new Method(21, "CollatorSelection", 0, "set_invulnerables", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> set_desired_candidates
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method SetDesiredCandidates(Substrate.NetApi.Model.Types.Primitive.U32 max)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(max.Encode());
            return new Method(21, "CollatorSelection", 1, "set_desired_candidates", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> set_candidacy_bond
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method SetCandidacyBond(Substrate.NetApi.Model.Types.Primitive.U128 bond)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(bond.Encode());
            return new Method(21, "CollatorSelection", 2, "set_candidacy_bond", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> register_as_candidate
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method RegisterAsCandidate()
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            return new Method(21, "CollatorSelection", 3, "register_as_candidate", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> leave_intent
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method LeaveIntent()
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            return new Method(21, "CollatorSelection", 4, "leave_intent", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> add_invulnerable
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method AddInvulnerable(PolkadotAssetHub.NetApi.Generated.Model.sp_core.crypto.AccountId32 who)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(who.Encode());
            return new Method(21, "CollatorSelection", 5, "add_invulnerable", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> remove_invulnerable
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method RemoveInvulnerable(PolkadotAssetHub.NetApi.Generated.Model.sp_core.crypto.AccountId32 who)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(who.Encode());
            return new Method(21, "CollatorSelection", 6, "remove_invulnerable", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> update_bond
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method UpdateBond(Substrate.NetApi.Model.Types.Primitive.U128 new_deposit)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(new_deposit.Encode());
            return new Method(21, "CollatorSelection", 7, "update_bond", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> take_candidate_slot
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method TakeCandidateSlot(Substrate.NetApi.Model.Types.Primitive.U128 deposit, PolkadotAssetHub.NetApi.Generated.Model.sp_core.crypto.AccountId32 target)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(deposit.Encode());
            byteArray.AddRange(target.Encode());
            return new Method(21, "CollatorSelection", 8, "take_candidate_slot", byteArray.ToArray());
        }
    }
    
    /// <summary>
    /// >> CollatorSelectionConstants
    /// </summary>
    public sealed class CollatorSelectionConstants
    {
    }
    
    /// <summary>
    /// >> CollatorSelectionErrors
    /// </summary>
    public enum CollatorSelectionErrors
    {
        
        /// <summary>
        /// >> TooManyCandidates
        /// The pallet has too many candidates.
        /// </summary>
        TooManyCandidates,
        
        /// <summary>
        /// >> TooFewEligibleCollators
        /// Leaving would result in too few candidates.
        /// </summary>
        TooFewEligibleCollators,
        
        /// <summary>
        /// >> AlreadyCandidate
        /// Account is already a candidate.
        /// </summary>
        AlreadyCandidate,
        
        /// <summary>
        /// >> NotCandidate
        /// Account is not a candidate.
        /// </summary>
        NotCandidate,
        
        /// <summary>
        /// >> TooManyInvulnerables
        /// There are too many Invulnerables.
        /// </summary>
        TooManyInvulnerables,
        
        /// <summary>
        /// >> AlreadyInvulnerable
        /// Account is already an Invulnerable.
        /// </summary>
        AlreadyInvulnerable,
        
        /// <summary>
        /// >> NotInvulnerable
        /// Account is not an Invulnerable.
        /// </summary>
        NotInvulnerable,
        
        /// <summary>
        /// >> NoAssociatedValidatorId
        /// Account has no associated validator ID.
        /// </summary>
        NoAssociatedValidatorId,
        
        /// <summary>
        /// >> ValidatorNotRegistered
        /// Validator ID is not yet registered.
        /// </summary>
        ValidatorNotRegistered,
        
        /// <summary>
        /// >> InsertToCandidateListFailed
        /// Could not insert in the candidate list.
        /// </summary>
        InsertToCandidateListFailed,
        
        /// <summary>
        /// >> RemoveFromCandidateListFailed
        /// Could not remove from the candidate list.
        /// </summary>
        RemoveFromCandidateListFailed,
        
        /// <summary>
        /// >> DepositTooLow
        /// New deposit amount would be below the minimum candidacy bond.
        /// </summary>
        DepositTooLow,
        
        /// <summary>
        /// >> UpdateCandidateListFailed
        /// Could not update the candidate list.
        /// </summary>
        UpdateCandidateListFailed,
        
        /// <summary>
        /// >> InsufficientBond
        /// Deposit amount is too low to take the target's slot in the candidate list.
        /// </summary>
        InsufficientBond,
        
        /// <summary>
        /// >> TargetIsNotCandidate
        /// The target account to be replaced in the candidate list is not a candidate.
        /// </summary>
        TargetIsNotCandidate,
        
        /// <summary>
        /// >> IdenticalDeposit
        /// The updated deposit amount is equal to the amount already reserved.
        /// </summary>
        IdenticalDeposit,
        
        /// <summary>
        /// >> InvalidUnreserve
        /// Cannot lower candidacy bond while occupying a future collator slot in the list.
        /// </summary>
        InvalidUnreserve,
    }
}
