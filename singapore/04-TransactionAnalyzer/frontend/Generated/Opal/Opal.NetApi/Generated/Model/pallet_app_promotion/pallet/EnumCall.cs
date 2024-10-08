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


namespace Opal.NetApi.Generated.Model.pallet_app_promotion.pallet
{
    
    
    /// <summary>
    /// >> Call
    /// Contains a variant per dispatchable extrinsic that this pallet has.
    /// </summary>
    public enum Call
    {
        
        /// <summary>
        /// >> set_admin_address
        /// See [`Pallet::set_admin_address`].
        /// </summary>
        set_admin_address = 0,
        
        /// <summary>
        /// >> stake
        /// See [`Pallet::stake`].
        /// </summary>
        stake = 1,
        
        /// <summary>
        /// >> unstake_all
        /// See [`Pallet::unstake_all`].
        /// </summary>
        unstake_all = 2,
        
        /// <summary>
        /// >> unstake_partial
        /// See [`Pallet::unstake_partial`].
        /// </summary>
        unstake_partial = 8,
        
        /// <summary>
        /// >> sponsor_collection
        /// See [`Pallet::sponsor_collection`].
        /// </summary>
        sponsor_collection = 3,
        
        /// <summary>
        /// >> stop_sponsoring_collection
        /// See [`Pallet::stop_sponsoring_collection`].
        /// </summary>
        stop_sponsoring_collection = 4,
        
        /// <summary>
        /// >> sponsor_contract
        /// See [`Pallet::sponsor_contract`].
        /// </summary>
        sponsor_contract = 5,
        
        /// <summary>
        /// >> stop_sponsoring_contract
        /// See [`Pallet::stop_sponsoring_contract`].
        /// </summary>
        stop_sponsoring_contract = 6,
        
        /// <summary>
        /// >> payout_stakers
        /// See [`Pallet::payout_stakers`].
        /// </summary>
        payout_stakers = 7,
        
        /// <summary>
        /// >> force_unstake
        /// See [`Pallet::force_unstake`].
        /// </summary>
        force_unstake = 9,
    }
    
    /// <summary>
    /// >> 328 - Variant[pallet_app_promotion.pallet.Call]
    /// Contains a variant per dispatchable extrinsic that this pallet has.
    /// </summary>
    public sealed class EnumCall : BaseEnumExt<Call, Opal.NetApi.Generated.Model.pallet_evm.account.EnumBasicCrossAccountIdRepr, Substrate.NetApi.Model.Types.Primitive.U128, BaseVoid, Opal.NetApi.Generated.Model.up_data_structs.CollectionId, Opal.NetApi.Generated.Model.up_data_structs.CollectionId, Opal.NetApi.Generated.Model.primitive_types.H160, Opal.NetApi.Generated.Model.primitive_types.H160, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Primitive.U8>, Substrate.NetApi.Model.Types.Primitive.U128, Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Primitive.U32>>
    {
    }
}
