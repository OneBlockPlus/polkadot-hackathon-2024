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


namespace Bifrost.NetApi.Generated.Model.bifrost_flexible_fee.pallet
{
    
    
    /// <summary>
    /// >> Event
    /// The `Event` enum of this pallet
    /// </summary>
    public enum Event
    {
        
        /// <summary>
        /// >> FlexibleFeeExchanged
        /// </summary>
        FlexibleFeeExchanged = 0,
        
        /// <summary>
        /// >> FixedRateFeeExchanged
        /// </summary>
        FixedRateFeeExchanged = 1,
        
        /// <summary>
        /// >> ExtraFeeDeducted
        /// </summary>
        ExtraFeeDeducted = 2,
    }
    
    /// <summary>
    /// >> 460 - Variant[bifrost_flexible_fee.pallet.Event]
    /// The `Event` enum of this pallet
    /// </summary>
    public sealed class EnumEvent : BaseEnumExt<Event, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Bifrost.NetApi.Generated.Model.bifrost_primitives.EnumExtraFeeName, Bifrost.NetApi.Generated.Model.bifrost_primitives.currency.EnumCurrencyId, Substrate.NetApi.Model.Types.Primitive.U128, Substrate.NetApi.Model.Types.Primitive.U128>>
    {
    }
}
