//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using Substrate.NetApi.Model.Types.Base;
using System.Collections.Generic;


namespace Bifrost.NetApi.Generated.Model.pallet_democracy.pallet
{
    
    
    /// <summary>
    /// >> Error
    /// The `Error` enum of this pallet.
    /// </summary>
    public enum Error
    {
        
        /// <summary>
        /// >> ValueLow
        /// Value too low
        /// </summary>
        ValueLow = 0,
        
        /// <summary>
        /// >> ProposalMissing
        /// Proposal does not exist
        /// </summary>
        ProposalMissing = 1,
        
        /// <summary>
        /// >> AlreadyCanceled
        /// Cannot cancel the same proposal twice
        /// </summary>
        AlreadyCanceled = 2,
        
        /// <summary>
        /// >> DuplicateProposal
        /// Proposal already made
        /// </summary>
        DuplicateProposal = 3,
        
        /// <summary>
        /// >> ProposalBlacklisted
        /// Proposal still blacklisted
        /// </summary>
        ProposalBlacklisted = 4,
        
        /// <summary>
        /// >> NotSimpleMajority
        /// Next external proposal not simple majority
        /// </summary>
        NotSimpleMajority = 5,
        
        /// <summary>
        /// >> InvalidHash
        /// Invalid hash
        /// </summary>
        InvalidHash = 6,
        
        /// <summary>
        /// >> NoProposal
        /// No external proposal
        /// </summary>
        NoProposal = 7,
        
        /// <summary>
        /// >> AlreadyVetoed
        /// Identity may not veto a proposal twice
        /// </summary>
        AlreadyVetoed = 8,
        
        /// <summary>
        /// >> ReferendumInvalid
        /// Vote given for invalid referendum
        /// </summary>
        ReferendumInvalid = 9,
        
        /// <summary>
        /// >> NoneWaiting
        /// No proposals waiting
        /// </summary>
        NoneWaiting = 10,
        
        /// <summary>
        /// >> NotVoter
        /// The given account did not vote on the referendum.
        /// </summary>
        NotVoter = 11,
        
        /// <summary>
        /// >> NoPermission
        /// The actor has no permission to conduct the action.
        /// </summary>
        NoPermission = 12,
        
        /// <summary>
        /// >> AlreadyDelegating
        /// The account is already delegating.
        /// </summary>
        AlreadyDelegating = 13,
        
        /// <summary>
        /// >> InsufficientFunds
        /// Too high a balance was provided that the account cannot afford.
        /// </summary>
        InsufficientFunds = 14,
        
        /// <summary>
        /// >> NotDelegating
        /// The account is not currently delegating.
        /// </summary>
        NotDelegating = 15,
        
        /// <summary>
        /// >> VotesExist
        /// The account currently has votes attached to it and the operation cannot succeed until
        /// these are removed, either through `unvote` or `reap_vote`.
        /// </summary>
        VotesExist = 16,
        
        /// <summary>
        /// >> InstantNotAllowed
        /// The instant referendum origin is currently disallowed.
        /// </summary>
        InstantNotAllowed = 17,
        
        /// <summary>
        /// >> Nonsense
        /// Delegation to oneself makes no sense.
        /// </summary>
        Nonsense = 18,
        
        /// <summary>
        /// >> WrongUpperBound
        /// Invalid upper bound.
        /// </summary>
        WrongUpperBound = 19,
        
        /// <summary>
        /// >> MaxVotesReached
        /// Maximum number of votes reached.
        /// </summary>
        MaxVotesReached = 20,
        
        /// <summary>
        /// >> TooMany
        /// Maximum number of items reached.
        /// </summary>
        TooMany = 21,
        
        /// <summary>
        /// >> VotingPeriodLow
        /// Voting period too low
        /// </summary>
        VotingPeriodLow = 22,
        
        /// <summary>
        /// >> PreimageNotExist
        /// The preimage does not exist.
        /// </summary>
        PreimageNotExist = 23,
    }
    
    /// <summary>
    /// >> 600 - Variant[pallet_democracy.pallet.Error]
    /// The `Error` enum of this pallet.
    /// </summary>
    public sealed class EnumError : BaseEnum<Error>
    {
    }
}
