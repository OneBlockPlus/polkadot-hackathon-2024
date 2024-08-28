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


namespace Bifrost.NetApi.Generated.Model.pallet_prices.pallet
{
    
    
    /// <summary>
    /// >> Event
    /// The `Event` enum of this pallet
    /// </summary>
    public enum Event
    {
        
        /// <summary>
        /// >> SetPrice
        /// Set emergency price. \[asset_id, price_detail\]
        /// </summary>
        SetPrice = 0,
        
        /// <summary>
        /// >> ResetPrice
        /// Reset emergency price. \[asset_id\]
        /// </summary>
        ResetPrice = 1,
    }
    
    /// <summary>
    /// >> 501 - Variant[pallet_prices.pallet.Event]
    /// The `Event` enum of this pallet
    /// </summary>
    public sealed class EnumEvent : BaseEnumExt<Event, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Bifrost.NetApi.Generated.Model.sp_arithmetic.fixed_point.FixedU128>, Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId>
    {
    }
}
