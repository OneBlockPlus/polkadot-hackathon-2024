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


namespace PolkadotAssetHub.NetApi.Generated.Model.xcm.v2
{
    
    
    /// <summary>
    /// >> Instruction
    /// </summary>
    public enum Instruction
    {
        
        /// <summary>
        /// >> WithdrawAsset
        /// </summary>
        WithdrawAsset = 0,
        
        /// <summary>
        /// >> ReserveAssetDeposited
        /// </summary>
        ReserveAssetDeposited = 1,
        
        /// <summary>
        /// >> ReceiveTeleportedAsset
        /// </summary>
        ReceiveTeleportedAsset = 2,
        
        /// <summary>
        /// >> QueryResponse
        /// </summary>
        QueryResponse = 3,
        
        /// <summary>
        /// >> TransferAsset
        /// </summary>
        TransferAsset = 4,
        
        /// <summary>
        /// >> TransferReserveAsset
        /// </summary>
        TransferReserveAsset = 5,
        
        /// <summary>
        /// >> Transact
        /// </summary>
        Transact = 6,
        
        /// <summary>
        /// >> HrmpNewChannelOpenRequest
        /// </summary>
        HrmpNewChannelOpenRequest = 7,
        
        /// <summary>
        /// >> HrmpChannelAccepted
        /// </summary>
        HrmpChannelAccepted = 8,
        
        /// <summary>
        /// >> HrmpChannelClosing
        /// </summary>
        HrmpChannelClosing = 9,
        
        /// <summary>
        /// >> ClearOrigin
        /// </summary>
        ClearOrigin = 10,
        
        /// <summary>
        /// >> DescendOrigin
        /// </summary>
        DescendOrigin = 11,
        
        /// <summary>
        /// >> ReportError
        /// </summary>
        ReportError = 12,
        
        /// <summary>
        /// >> DepositAsset
        /// </summary>
        DepositAsset = 13,
        
        /// <summary>
        /// >> DepositReserveAsset
        /// </summary>
        DepositReserveAsset = 14,
        
        /// <summary>
        /// >> ExchangeAsset
        /// </summary>
        ExchangeAsset = 15,
        
        /// <summary>
        /// >> InitiateReserveWithdraw
        /// </summary>
        InitiateReserveWithdraw = 16,
        
        /// <summary>
        /// >> InitiateTeleport
        /// </summary>
        InitiateTeleport = 17,
        
        /// <summary>
        /// >> QueryHolding
        /// </summary>
        QueryHolding = 18,
        
        /// <summary>
        /// >> BuyExecution
        /// </summary>
        BuyExecution = 19,
        
        /// <summary>
        /// >> RefundSurplus
        /// </summary>
        RefundSurplus = 20,
        
        /// <summary>
        /// >> SetErrorHandler
        /// </summary>
        SetErrorHandler = 21,
        
        /// <summary>
        /// >> SetAppendix
        /// </summary>
        SetAppendix = 22,
        
        /// <summary>
        /// >> ClearError
        /// </summary>
        ClearError = 23,
        
        /// <summary>
        /// >> ClaimAsset
        /// </summary>
        ClaimAsset = 24,
        
        /// <summary>
        /// >> Trap
        /// </summary>
        Trap = 25,
        
        /// <summary>
        /// >> SubscribeVersion
        /// </summary>
        SubscribeVersion = 26,
        
        /// <summary>
        /// >> UnsubscribeVersion
        /// </summary>
        UnsubscribeVersion = 27,
    }
    
    /// <summary>
    /// >> 323 - Variant[xcm.v2.Instruction]
    /// </summary>
    public sealed class EnumInstruction : BaseEnumExt<Instruction, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.MultiAssets, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.MultiAssets, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.MultiAssets, BaseTuple<Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.EnumResponse, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>>, BaseTuple<PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.MultiAssets, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multilocation.MultiLocation>, BaseTuple<PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.MultiAssets, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multilocation.MultiLocation, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.XcmT1>, BaseTuple<PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.EnumOriginKind, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>, PolkadotAssetHub.NetApi.Generated.Model.xcm.double_encoded.DoubleEncodedT2>, BaseTuple<Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U32>, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U32>, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U32>>, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U32>, BaseTuple<Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U32>, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U32>, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U32>>, BaseVoid, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multilocation.EnumJunctions, BaseTuple<Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multilocation.MultiLocation, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>>, BaseTuple<PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.EnumMultiAssetFilter, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U32>, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multilocation.MultiLocation>, BaseTuple<PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.EnumMultiAssetFilter, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U32>, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multilocation.MultiLocation, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.XcmT1>, BaseTuple<PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.EnumMultiAssetFilter, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.MultiAssets>, BaseTuple<PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.EnumMultiAssetFilter, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multilocation.MultiLocation, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.XcmT1>, BaseTuple<PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.EnumMultiAssetFilter, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multilocation.MultiLocation, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.XcmT1>, BaseTuple<Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multilocation.MultiLocation, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.EnumMultiAssetFilter, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>>, BaseTuple<PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.MultiAsset, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.EnumWeightLimit>, BaseVoid, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.XcmT2, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.XcmT2, BaseVoid, BaseTuple<PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multiasset.MultiAssets, PolkadotAssetHub.NetApi.Generated.Model.xcm.v2.multilocation.MultiLocation>, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>, BaseTuple<Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>, Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>>, BaseVoid>
    {
    }
}
