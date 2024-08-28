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


namespace Bifrost.NetApi.Generated.Model.pallet_balances.pallet
{
    
    
    /// <summary>
    /// >> Event
    /// The `Event` enum of this pallet
    /// </summary>
    public enum Event
    {
        
        /// <summary>
        /// >> Endowed
        /// An account was created with some free balance.
        /// </summary>
        Endowed = 0,
        
        /// <summary>
        /// >> DustLost
        /// An account was removed whose balance was non-zero but below ExistentialDeposit,
        /// resulting in an outright loss.
        /// </summary>
        DustLost = 1,
        
        /// <summary>
        /// >> Transfer
        /// Transfer succeeded.
        /// </summary>
        Transfer = 2,
        
        /// <summary>
        /// >> BalanceSet
        /// A balance was set by root.
        /// </summary>
        BalanceSet = 3,
        
        /// <summary>
        /// >> Reserved
        /// Some balance was reserved (moved from free to reserved).
        /// </summary>
        Reserved = 4,
        
        /// <summary>
        /// >> Unreserved
        /// Some balance was unreserved (moved from reserved to free).
        /// </summary>
        Unreserved = 5,
        
        /// <summary>
        /// >> ReserveRepatriated
        /// Some balance was moved from the reserve of the first account to the second account.
        /// Final argument indicates the destination balance type.
        /// </summary>
        ReserveRepatriated = 6,
        
        /// <summary>
        /// >> Deposit
        /// Some amount was deposited (e.g. for transaction fees).
        /// </summary>
        Deposit = 7,
        
        /// <summary>
        /// >> Withdraw
        /// Some amount was withdrawn from the account (e.g. for transaction fees).
        /// </summary>
        Withdraw = 8,
        
        /// <summary>
        /// >> Slashed
        /// Some amount was removed from the account (e.g. for misbehavior).
        /// </summary>
        Slashed = 9,
        
        /// <summary>
        /// >> Minted
        /// Some amount was minted into an account.
        /// </summary>
        Minted = 10,
        
        /// <summary>
        /// >> Burned
        /// Some amount was burned from an account.
        /// </summary>
        Burned = 11,
        
        /// <summary>
        /// >> Suspended
        /// Some amount was suspended from an account (it can be restored later).
        /// </summary>
        Suspended = 12,
        
        /// <summary>
        /// >> Restored
        /// Some amount was restored into an account.
        /// </summary>
        Restored = 13,
        
        /// <summary>
        /// >> Upgraded
        /// An account was upgraded.
        /// </summary>
        Upgraded = 14,
        
        /// <summary>
        /// >> Issued
        /// Total issuance was increased by `amount`, creating a credit to be balanced.
        /// </summary>
        Issued = 15,
        
        /// <summary>
        /// >> Rescinded
        /// Total issuance was decreased by `amount`, creating a debt to be balanced.
        /// </summary>
        Rescinded = 16,
        
        /// <summary>
        /// >> Locked
        /// Some balance was locked.
        /// </summary>
        Locked = 17,
        
        /// <summary>
        /// >> Unlocked
        /// Some balance was unlocked.
        /// </summary>
        Unlocked = 18,
        
        /// <summary>
        /// >> Frozen
        /// Some balance was frozen.
        /// </summary>
        Frozen = 19,
        
        /// <summary>
        /// >> Thawed
        /// Some balance was thawed.
        /// </summary>
        Thawed = 20,
        
        /// <summary>
        /// >> TotalIssuanceForced
        /// The `TotalIssuance` was forcefully changed.
        /// </summary>
        TotalIssuanceForced = 21,
    }
    
    /// <summary>
    /// >> 34 - Variant[pallet_balances.pallet.Event]
    /// The `Event` enum of this pallet
    /// </summary>
    public sealed class EnumEvent : BaseEnumExt<Event, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128, Bifrost.NetApi.Generated.Model.frame_support.traits.tokens.misc.EnumBalanceStatus>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128, Substrate.NetApi.Model.Types.Primitive.U128, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U128, Substrate.NetApi.Model.Types.Primitive.U128>>
    {
    }
}
