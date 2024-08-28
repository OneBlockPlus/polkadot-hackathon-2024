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


namespace Opal.NetApi.Generated.Model.pallet_nonfungible.pallet
{
    
    
    /// <summary>
    /// >> Error
    /// The `Error` enum of this pallet.
    /// </summary>
    public enum Error
    {
        
        /// <summary>
        /// >> NotNonfungibleDataUsedToMintFungibleCollectionToken
        /// Not Nonfungible item data used to mint in Nonfungible collection.
        /// </summary>
        NotNonfungibleDataUsedToMintFungibleCollectionToken = 0,
        
        /// <summary>
        /// >> NonfungibleItemsHaveNoAmount
        /// Used amount > 1 with NFT
        /// </summary>
        NonfungibleItemsHaveNoAmount = 1,
        
        /// <summary>
        /// >> CantBurnNftWithChildren
        /// Unable to burn NFT with children
        /// </summary>
        CantBurnNftWithChildren = 2,
    }
    
    /// <summary>
    /// >> 631 - Variant[pallet_nonfungible.pallet.Error]
    /// The `Error` enum of this pallet.
    /// </summary>
    public sealed class EnumError : BaseEnum<Error>
    {
    }
}
