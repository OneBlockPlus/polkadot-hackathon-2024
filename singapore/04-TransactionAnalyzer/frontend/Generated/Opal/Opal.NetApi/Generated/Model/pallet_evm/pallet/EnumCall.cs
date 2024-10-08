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


namespace Opal.NetApi.Generated.Model.pallet_evm.pallet
{
    
    
    /// <summary>
    /// >> Call
    /// Contains a variant per dispatchable extrinsic that this pallet has.
    /// </summary>
    public enum Call
    {
        
        /// <summary>
        /// >> withdraw
        /// See [`Pallet::withdraw`].
        /// </summary>
        withdraw = 0,
        
        /// <summary>
        /// >> call
        /// See [`Pallet::call`].
        /// </summary>
        call = 1,
        
        /// <summary>
        /// >> create
        /// See [`Pallet::create`].
        /// </summary>
        create = 2,
        
        /// <summary>
        /// >> create2
        /// See [`Pallet::create2`].
        /// </summary>
        create2 = 3,
    }
    
    /// <summary>
    /// >> 333 - Variant[pallet_evm.pallet.Call]
    /// Contains a variant per dispatchable extrinsic that this pallet has.
    /// </summary>
    public sealed class EnumCall : BaseEnumExt<Call, BaseTuple<Opal.NetApi.Generated.Model.primitive_types.H160, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Opal.NetApi.Generated.Model.primitive_types.H160, Opal.NetApi.Generated.Model.primitive_types.H160, Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Primitive.U8>, Opal.NetApi.Generated.Model.primitive_types.U256, Substrate.NetApi.Model.Types.Primitive.U64, Opal.NetApi.Generated.Model.primitive_types.U256, Substrate.NetApi.Model.Types.Base.BaseOpt<Opal.NetApi.Generated.Model.primitive_types.U256>, Substrate.NetApi.Model.Types.Base.BaseOpt<Opal.NetApi.Generated.Model.primitive_types.U256>, Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Base.BaseTuple<Opal.NetApi.Generated.Model.primitive_types.H160, Substrate.NetApi.Model.Types.Base.BaseVec<Opal.NetApi.Generated.Model.primitive_types.H256>>>>, BaseTuple<Opal.NetApi.Generated.Model.primitive_types.H160, Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Primitive.U8>, Opal.NetApi.Generated.Model.primitive_types.U256, Substrate.NetApi.Model.Types.Primitive.U64, Opal.NetApi.Generated.Model.primitive_types.U256, Substrate.NetApi.Model.Types.Base.BaseOpt<Opal.NetApi.Generated.Model.primitive_types.U256>, Substrate.NetApi.Model.Types.Base.BaseOpt<Opal.NetApi.Generated.Model.primitive_types.U256>, Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Base.BaseTuple<Opal.NetApi.Generated.Model.primitive_types.H160, Substrate.NetApi.Model.Types.Base.BaseVec<Opal.NetApi.Generated.Model.primitive_types.H256>>>>, BaseTuple<Opal.NetApi.Generated.Model.primitive_types.H160, Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Primitive.U8>, Opal.NetApi.Generated.Model.primitive_types.H256, Opal.NetApi.Generated.Model.primitive_types.U256, Substrate.NetApi.Model.Types.Primitive.U64, Opal.NetApi.Generated.Model.primitive_types.U256, Substrate.NetApi.Model.Types.Base.BaseOpt<Opal.NetApi.Generated.Model.primitive_types.U256>, Substrate.NetApi.Model.Types.Base.BaseOpt<Opal.NetApi.Generated.Model.primitive_types.U256>, Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Base.BaseTuple<Opal.NetApi.Generated.Model.primitive_types.H160, Substrate.NetApi.Model.Types.Base.BaseVec<Opal.NetApi.Generated.Model.primitive_types.H256>>>>>
    {
    }
}
