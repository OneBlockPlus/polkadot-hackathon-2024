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


namespace Bifrost.NetApi.Generated.Model.bifrost_slp.pallet
{
    
    
    /// <summary>
    /// >> Call
    /// Contains a variant per dispatchable extrinsic that this pallet has.
    /// </summary>
    public enum Call
    {
        
        /// <summary>
        /// >> initialize_delegator
        /// See [`Pallet::initialize_delegator`].
        /// </summary>
        initialize_delegator = 0,
        
        /// <summary>
        /// >> bond
        /// See [`Pallet::bond`].
        /// </summary>
        bond = 1,
        
        /// <summary>
        /// >> bond_extra
        /// See [`Pallet::bond_extra`].
        /// </summary>
        bond_extra = 2,
        
        /// <summary>
        /// >> unbond
        /// See [`Pallet::unbond`].
        /// </summary>
        unbond = 3,
        
        /// <summary>
        /// >> unbond_all
        /// See [`Pallet::unbond_all`].
        /// </summary>
        unbond_all = 4,
        
        /// <summary>
        /// >> rebond
        /// See [`Pallet::rebond`].
        /// </summary>
        rebond = 5,
        
        /// <summary>
        /// >> delegate
        /// See [`Pallet::delegate`].
        /// </summary>
        @delegate = 6,
        
        /// <summary>
        /// >> undelegate
        /// See [`Pallet::undelegate`].
        /// </summary>
        undelegate = 7,
        
        /// <summary>
        /// >> redelegate
        /// See [`Pallet::redelegate`].
        /// </summary>
        redelegate = 8,
        
        /// <summary>
        /// >> payout
        /// See [`Pallet::payout`].
        /// </summary>
        payout = 9,
        
        /// <summary>
        /// >> liquidize
        /// See [`Pallet::liquidize`].
        /// </summary>
        liquidize = 10,
        
        /// <summary>
        /// >> chill
        /// See [`Pallet::chill`].
        /// </summary>
        chill = 11,
        
        /// <summary>
        /// >> transfer_back
        /// See [`Pallet::transfer_back`].
        /// </summary>
        transfer_back = 12,
        
        /// <summary>
        /// >> transfer_to
        /// See [`Pallet::transfer_to`].
        /// </summary>
        transfer_to = 13,
        
        /// <summary>
        /// >> convert_asset
        /// See [`Pallet::convert_asset`].
        /// </summary>
        convert_asset = 14,
        
        /// <summary>
        /// >> increase_token_pool
        /// See [`Pallet::increase_token_pool`].
        /// </summary>
        increase_token_pool = 15,
        
        /// <summary>
        /// >> decrease_token_pool
        /// See [`Pallet::decrease_token_pool`].
        /// </summary>
        decrease_token_pool = 16,
        
        /// <summary>
        /// >> update_ongoing_time_unit
        /// See [`Pallet::update_ongoing_time_unit`].
        /// </summary>
        update_ongoing_time_unit = 17,
        
        /// <summary>
        /// >> refund_currency_due_unbond
        /// See [`Pallet::refund_currency_due_unbond`].
        /// </summary>
        refund_currency_due_unbond = 18,
        
        /// <summary>
        /// >> supplement_fee_reserve
        /// See [`Pallet::supplement_fee_reserve`].
        /// </summary>
        supplement_fee_reserve = 19,
        
        /// <summary>
        /// >> charge_host_fee_and_tune_vtoken_exchange_rate
        /// See [`Pallet::charge_host_fee_and_tune_vtoken_exchange_rate`].
        /// </summary>
        charge_host_fee_and_tune_vtoken_exchange_rate = 20,
        
        /// <summary>
        /// >> set_operate_origin
        /// See [`Pallet::set_operate_origin`].
        /// </summary>
        set_operate_origin = 22,
        
        /// <summary>
        /// >> set_fee_source
        /// See [`Pallet::set_fee_source`].
        /// </summary>
        set_fee_source = 23,
        
        /// <summary>
        /// >> add_delegator
        /// See [`Pallet::add_delegator`].
        /// </summary>
        add_delegator = 24,
        
        /// <summary>
        /// >> remove_delegator
        /// See [`Pallet::remove_delegator`].
        /// </summary>
        remove_delegator = 25,
        
        /// <summary>
        /// >> add_validator
        /// See [`Pallet::add_validator`].
        /// </summary>
        add_validator = 26,
        
        /// <summary>
        /// >> remove_validator
        /// See [`Pallet::remove_validator`].
        /// </summary>
        remove_validator = 27,
        
        /// <summary>
        /// >> set_validators_by_delegator
        /// See [`Pallet::set_validators_by_delegator`].
        /// </summary>
        set_validators_by_delegator = 28,
        
        /// <summary>
        /// >> set_delegator_ledger
        /// See [`Pallet::set_delegator_ledger`].
        /// </summary>
        set_delegator_ledger = 29,
        
        /// <summary>
        /// >> set_minimums_and_maximums
        /// See [`Pallet::set_minimums_and_maximums`].
        /// </summary>
        set_minimums_and_maximums = 30,
        
        /// <summary>
        /// >> set_currency_delays
        /// See [`Pallet::set_currency_delays`].
        /// </summary>
        set_currency_delays = 31,
        
        /// <summary>
        /// >> set_hosting_fees
        /// See [`Pallet::set_hosting_fees`].
        /// </summary>
        set_hosting_fees = 32,
        
        /// <summary>
        /// >> set_currency_tune_exchange_rate_limit
        /// See [`Pallet::set_currency_tune_exchange_rate_limit`].
        /// </summary>
        set_currency_tune_exchange_rate_limit = 33,
        
        /// <summary>
        /// >> set_ongoing_time_unit_update_interval
        /// See [`Pallet::set_ongoing_time_unit_update_interval`].
        /// </summary>
        set_ongoing_time_unit_update_interval = 34,
        
        /// <summary>
        /// >> add_supplement_fee_account_to_whitelist
        /// See [`Pallet::add_supplement_fee_account_to_whitelist`].
        /// </summary>
        add_supplement_fee_account_to_whitelist = 35,
        
        /// <summary>
        /// >> remove_supplement_fee_account_from_whitelist
        /// See [`Pallet::remove_supplement_fee_account_from_whitelist`].
        /// </summary>
        remove_supplement_fee_account_from_whitelist = 36,
        
        /// <summary>
        /// >> confirm_delegator_ledger_query_response
        /// See [`Pallet::confirm_delegator_ledger_query_response`].
        /// </summary>
        confirm_delegator_ledger_query_response = 37,
        
        /// <summary>
        /// >> fail_delegator_ledger_query_response
        /// See [`Pallet::fail_delegator_ledger_query_response`].
        /// </summary>
        fail_delegator_ledger_query_response = 38,
        
        /// <summary>
        /// >> confirm_validators_by_delegator_query_response
        /// See [`Pallet::confirm_validators_by_delegator_query_response`].
        /// </summary>
        confirm_validators_by_delegator_query_response = 39,
        
        /// <summary>
        /// >> fail_validators_by_delegator_query_response
        /// See [`Pallet::fail_validators_by_delegator_query_response`].
        /// </summary>
        fail_validators_by_delegator_query_response = 40,
        
        /// <summary>
        /// >> confirm_delegator_ledger
        /// See [`Pallet::confirm_delegator_ledger`].
        /// </summary>
        confirm_delegator_ledger = 41,
        
        /// <summary>
        /// >> confirm_validators_by_delegator
        /// See [`Pallet::confirm_validators_by_delegator`].
        /// </summary>
        confirm_validators_by_delegator = 42,
        
        /// <summary>
        /// >> reset_validators
        /// See [`Pallet::reset_validators`].
        /// </summary>
        reset_validators = 43,
        
        /// <summary>
        /// >> set_validator_boost_list
        /// See [`Pallet::set_validator_boost_list`].
        /// </summary>
        set_validator_boost_list = 44,
        
        /// <summary>
        /// >> add_to_validator_boost_list
        /// See [`Pallet::add_to_validator_boost_list`].
        /// </summary>
        add_to_validator_boost_list = 45,
        
        /// <summary>
        /// >> remove_from_validator_boot_list
        /// See [`Pallet::remove_from_validator_boot_list`].
        /// </summary>
        remove_from_validator_boot_list = 46,
        
        /// <summary>
        /// >> convert_treasury_vtoken
        /// See [`Pallet::convert_treasury_vtoken`].
        /// </summary>
        convert_treasury_vtoken = 47,
        
        /// <summary>
        /// >> clean_outdated_validator_boost_list
        /// See [`Pallet::clean_outdated_validator_boost_list`].
        /// </summary>
        clean_outdated_validator_boost_list = 48,
    }
    
    /// <summary>
    /// >> 324 - Variant[bifrost_slp.pallet.Call]
    /// Contains a variant per dispatchable extrinsic that this pallet has.
    /// </summary>
    public sealed class EnumCall : BaseEnumExt<Call, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U128>, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_weights.weight_v2.Weight, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U128>, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_weights.weight_v2.Weight, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U128>, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_weights.weight_v2.Weight, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_weights.weight_v2.Weight, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Primitive.U128>, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_weights.weight_v2.Weight, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseVec<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_weights.weight_v2.Weight, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseVec<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_weights.weight_v2.Weight, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseVec<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>>, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_weights.weight_v2.Weight, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.bifrost_primitives.EnumTimeUnit>, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_weights.weight_v2.Weight, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.bifrost_primitives.EnumTimeUnit>, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Primitive.U128>, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_weights.weight_v2.Weight, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_weights.weight_v2.Weight, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U128>, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_weights.weight_v2.Weight, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U128>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U128>, Substrate.NetApi.Model.Types.Primitive.Bool, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_weights.weight_v2.Weight, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U128>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U128>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.bifrost_primitives.EnumTimeUnit>, Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U128>, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>>, BaseVoid, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.sp_core.crypto.AccountId32>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Primitive.U128>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U16>, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseVec<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.bifrost_slp.primitives.EnumLedger>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.bifrost_slp.primitives.MinimumsMaximums>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseOpt<Bifrost.NetApi.Generated.Model.bifrost_slp.primitives.Delays>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Bifrost.NetApi.Generated.Model.sp_arithmetic.per_things.Permill, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Base.BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bifrost.NetApi.Generated.Model.sp_arithmetic.per_things.Permill>>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Primitive.U32>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U64, Bifrost.NetApi.Generated.Model.xcm.v3.EnumResponse>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U64, Bifrost.NetApi.Generated.Model.xcm.v3.EnumResponse>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseVec<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Base.BaseVec<Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.staging_xcm.v3.multilocation.MultiLocation>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Primitive.U8>>
    {
    }
}
