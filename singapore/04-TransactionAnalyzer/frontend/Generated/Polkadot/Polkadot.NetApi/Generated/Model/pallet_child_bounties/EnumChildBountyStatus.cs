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


namespace Polkadot.NetApi.Generated.Model.pallet_child_bounties
{
    
    
    /// <summary>
    /// >> ChildBountyStatus
    /// </summary>
    public enum ChildBountyStatus
    {
        
        /// <summary>
        /// >> Added
        /// </summary>
        Added = 0,
        
        /// <summary>
        /// >> CuratorProposed
        /// </summary>
        CuratorProposed = 1,
        
        /// <summary>
        /// >> Active
        /// </summary>
        Active = 2,
        
        /// <summary>
        /// >> PendingPayout
        /// </summary>
        PendingPayout = 3,
    }
    
    /// <summary>
    /// >> 705 - Variant[pallet_child_bounties.ChildBountyStatus]
    /// </summary>
    public sealed class EnumChildBountyStatus : BaseEnumExt<ChildBountyStatus, BaseVoid, Polkadot.NetApi.Generated.Model.sp_core.crypto.AccountId32, Polkadot.NetApi.Generated.Model.sp_core.crypto.AccountId32, BaseTuple<Polkadot.NetApi.Generated.Model.sp_core.crypto.AccountId32, Polkadot.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U32>>
    {
    }
}
