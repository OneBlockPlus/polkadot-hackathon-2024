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


namespace Bifrost.NetApi.Generated.Model.bifrost_asset_registry.pallet
{
    
    
    /// <summary>
    /// >> Error
    /// The `Error` enum of this pallet.
    /// </summary>
    public enum Error
    {
        
        /// <summary>
        /// >> BadLocation
        /// The given location could not be used (e.g. because it cannot be expressed in the
        /// desired version of XCM).
        /// </summary>
        BadLocation = 0,
        
        /// <summary>
        /// >> LocationExisted
        /// Location existed
        /// </summary>
        LocationExisted = 1,
        
        /// <summary>
        /// >> AssetIdNotExists
        /// AssetId not exists
        /// </summary>
        AssetIdNotExists = 2,
        
        /// <summary>
        /// >> AssetIdExisted
        /// AssetId exists
        /// </summary>
        AssetIdExisted = 3,
        
        /// <summary>
        /// >> CurrencyIdNotExists
        /// CurrencyId not exists
        /// </summary>
        CurrencyIdNotExists = 4,
        
        /// <summary>
        /// >> CurrencyIdExisted
        /// CurrencyId exists
        /// </summary>
        CurrencyIdExisted = 5,
    }
    
    /// <summary>
    /// >> 777 - Variant[bifrost_asset_registry.pallet.Error]
    /// The `Error` enum of this pallet.
    /// </summary>
    public sealed class EnumError : BaseEnum<Error>
    {
    }
}
