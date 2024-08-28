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


namespace PolkadotPeople.NetApi.Generated.Model.polkadot_runtime_common.identity_migrator.pallet
{
    
    
    /// <summary>
    /// >> Call
    /// Contains a variant per dispatchable extrinsic that this pallet has.
    /// </summary>
    public enum Call
    {
        
        /// <summary>
        /// >> reap_identity
        /// See [`Pallet::reap_identity`].
        /// </summary>
        reap_identity = 0,
        
        /// <summary>
        /// >> poke_deposit
        /// See [`Pallet::poke_deposit`].
        /// </summary>
        poke_deposit = 1,
    }
    
    /// <summary>
    /// >> 366 - Variant[polkadot_runtime_common.identity_migrator.pallet.Call]
    /// Contains a variant per dispatchable extrinsic that this pallet has.
    /// </summary>
    public sealed class EnumCall : BaseEnumExt<Call, PolkadotPeople.NetApi.Generated.Model.sp_core.crypto.AccountId32, PolkadotPeople.NetApi.Generated.Model.sp_core.crypto.AccountId32>
    {
    }
}
