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


namespace Bifrost.NetApi.Generated.Model.bifrost_channel_commission.pallet
{
    
    
    /// <summary>
    /// >> Call
    /// Contains a variant per dispatchable extrinsic that this pallet has.
    /// </summary>
    public enum Call
    {
        
        /// <summary>
        /// >> register_channel
        /// See [`Pallet::register_channel`].
        /// </summary>
        register_channel = 0,
        
        /// <summary>
        /// >> remove_channel
        /// See [`Pallet::remove_channel`].
        /// </summary>
        remove_channel = 1,
        
        /// <summary>
        /// >> update_channel_receive_account
        /// See [`Pallet::update_channel_receive_account`].
        /// </summary>
        update_channel_receive_account = 2,
        
        /// <summary>
        /// >> set_channel_commission_token
        /// See [`Pallet::set_channel_commission_token`].
        /// </summary>
        set_channel_commission_token = 3,
        
        /// <summary>
        /// >> set_commission_tokens
        /// See [`Pallet::set_commission_tokens`].
        /// </summary>
        set_commission_tokens = 4,
        
        /// <summary>
        /// >> claim_commissions
        /// See [`Pallet::claim_commissions`].
        /// </summary>
        claim_commissions = 5,
        
        /// <summary>
        /// >> set_channel_vtoken_shares
        /// See [`Pallet::set_channel_vtoken_shares`].
        /// </summary>
        set_channel_vtoken_shares = 6,
    }
    
    /// <summary>
    /// >> 429 - Variant[bifrost_channel_commission.pallet.Call]
    /// Contains a variant per dispatchable extrinsic that this pallet has.
    /// </summary>
    public sealed class EnumCall : BaseEnumExt<Call, BaseTuple<Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Primitive.U8>, Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32>, Substrate.NetApi.Model.Types.Primitive.U32, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.sp_arithmetic.per_things.Percent>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId>>, Substrate.NetApi.Model.Types.Primitive.U32, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.sp_arithmetic.per_things.Permill>>
    {
    }
}
