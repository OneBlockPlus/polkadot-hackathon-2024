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


namespace PolkadotPeople.NetApi.Generated.Model.xcm.v2.junction
{
    
    
    /// <summary>
    /// >> Junction
    /// </summary>
    public enum Junction
    {
        
        /// <summary>
        /// >> Parachain
        /// </summary>
        Parachain = 0,
        
        /// <summary>
        /// >> AccountId32
        /// </summary>
        AccountId32 = 1,
        
        /// <summary>
        /// >> AccountIndex64
        /// </summary>
        AccountIndex64 = 2,
        
        /// <summary>
        /// >> AccountKey20
        /// </summary>
        AccountKey20 = 3,
        
        /// <summary>
        /// >> PalletInstance
        /// </summary>
        PalletInstance = 4,
        
        /// <summary>
        /// >> GeneralIndex
        /// </summary>
        GeneralIndex = 5,
        
        /// <summary>
        /// >> GeneralKey
        /// </summary>
        GeneralKey = 6,
        
        /// <summary>
        /// >> OnlyChild
        /// </summary>
        OnlyChild = 7,
        
        /// <summary>
        /// >> Plurality
        /// </summary>
        Plurality = 8,
    }
    
    /// <summary>
    /// >> 96 - Variant[xcm.v2.junction.Junction]
    /// </summary>
    public sealed class EnumJunction : BaseEnumExt<Junction, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U32>, BaseTuple<PolkadotPeople.NetApi.Generated.Model.xcm.v2.EnumNetworkId, PolkadotPeople.NetApi.Generated.Types.Base.Arr32U8>, BaseTuple<PolkadotPeople.NetApi.Generated.Model.xcm.v2.EnumNetworkId, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>>, BaseTuple<PolkadotPeople.NetApi.Generated.Model.xcm.v2.EnumNetworkId, PolkadotPeople.NetApi.Generated.Types.Base.Arr20U8>, Substrate.NetApi.Model.Types.Primitive.U8, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U128>, PolkadotPeople.NetApi.Generated.Model.bounded_collections.weak_bounded_vec.WeakBoundedVecT1, BaseVoid, BaseTuple<PolkadotPeople.NetApi.Generated.Model.xcm.v2.EnumBodyId, PolkadotPeople.NetApi.Generated.Model.xcm.v2.EnumBodyPart>>
    {
    }
}
