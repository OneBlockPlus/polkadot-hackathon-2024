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


namespace Bajun.NetApi.Generated.Model.pallet_nfts.pallet
{
    
    
    /// <summary>
    /// >> Event
    /// The `Event` enum of this pallet
    /// </summary>
    public enum Event
    {
        
        /// <summary>
        /// >> Created
        /// A `collection` was created.
        /// </summary>
        Created = 0,
        
        /// <summary>
        /// >> ForceCreated
        /// A `collection` was force-created.
        /// </summary>
        ForceCreated = 1,
        
        /// <summary>
        /// >> Destroyed
        /// A `collection` was destroyed.
        /// </summary>
        Destroyed = 2,
        
        /// <summary>
        /// >> Issued
        /// An `item` was issued.
        /// </summary>
        Issued = 3,
        
        /// <summary>
        /// >> Transferred
        /// An `item` was transferred.
        /// </summary>
        Transferred = 4,
        
        /// <summary>
        /// >> Burned
        /// An `item` was destroyed.
        /// </summary>
        Burned = 5,
        
        /// <summary>
        /// >> ItemTransferLocked
        /// An `item` became non-transferable.
        /// </summary>
        ItemTransferLocked = 6,
        
        /// <summary>
        /// >> ItemTransferUnlocked
        /// An `item` became transferable.
        /// </summary>
        ItemTransferUnlocked = 7,
        
        /// <summary>
        /// >> ItemPropertiesLocked
        /// `item` metadata or attributes were locked.
        /// </summary>
        ItemPropertiesLocked = 8,
        
        /// <summary>
        /// >> CollectionLocked
        /// Some `collection` was locked.
        /// </summary>
        CollectionLocked = 9,
        
        /// <summary>
        /// >> OwnerChanged
        /// The owner changed.
        /// </summary>
        OwnerChanged = 10,
        
        /// <summary>
        /// >> TeamChanged
        /// The management team changed.
        /// </summary>
        TeamChanged = 11,
        
        /// <summary>
        /// >> TransferApproved
        /// An `item` of a `collection` has been approved by the `owner` for transfer by
        /// a `delegate`.
        /// </summary>
        TransferApproved = 12,
        
        /// <summary>
        /// >> ApprovalCancelled
        /// An approval for a `delegate` account to transfer the `item` of an item
        /// `collection` was cancelled by its `owner`.
        /// </summary>
        ApprovalCancelled = 13,
        
        /// <summary>
        /// >> AllApprovalsCancelled
        /// All approvals of an item got cancelled.
        /// </summary>
        AllApprovalsCancelled = 14,
        
        /// <summary>
        /// >> CollectionConfigChanged
        /// A `collection` has had its config changed by the `Force` origin.
        /// </summary>
        CollectionConfigChanged = 15,
        
        /// <summary>
        /// >> CollectionMetadataSet
        /// New metadata has been set for a `collection`.
        /// </summary>
        CollectionMetadataSet = 16,
        
        /// <summary>
        /// >> CollectionMetadataCleared
        /// Metadata has been cleared for a `collection`.
        /// </summary>
        CollectionMetadataCleared = 17,
        
        /// <summary>
        /// >> ItemMetadataSet
        /// New metadata has been set for an item.
        /// </summary>
        ItemMetadataSet = 18,
        
        /// <summary>
        /// >> ItemMetadataCleared
        /// Metadata has been cleared for an item.
        /// </summary>
        ItemMetadataCleared = 19,
        
        /// <summary>
        /// >> Redeposited
        /// The deposit for a set of `item`s within a `collection` has been updated.
        /// </summary>
        Redeposited = 20,
        
        /// <summary>
        /// >> AttributeSet
        /// New attribute metadata has been set for a `collection` or `item`.
        /// </summary>
        AttributeSet = 21,
        
        /// <summary>
        /// >> AttributeCleared
        /// Attribute metadata has been cleared for a `collection` or `item`.
        /// </summary>
        AttributeCleared = 22,
        
        /// <summary>
        /// >> ItemAttributesApprovalAdded
        /// A new approval to modify item attributes was added.
        /// </summary>
        ItemAttributesApprovalAdded = 23,
        
        /// <summary>
        /// >> ItemAttributesApprovalRemoved
        /// A new approval to modify item attributes was removed.
        /// </summary>
        ItemAttributesApprovalRemoved = 24,
        
        /// <summary>
        /// >> OwnershipAcceptanceChanged
        /// Ownership acceptance has changed for an account.
        /// </summary>
        OwnershipAcceptanceChanged = 25,
        
        /// <summary>
        /// >> CollectionMaxSupplySet
        /// Max supply has been set for a collection.
        /// </summary>
        CollectionMaxSupplySet = 26,
        
        /// <summary>
        /// >> CollectionMintSettingsUpdated
        /// Mint settings for a collection had changed.
        /// </summary>
        CollectionMintSettingsUpdated = 27,
        
        /// <summary>
        /// >> NextCollectionIdIncremented
        /// Event gets emitted when the `NextCollectionId` gets incremented.
        /// </summary>
        NextCollectionIdIncremented = 28,
        
        /// <summary>
        /// >> ItemPriceSet
        /// The price was set for the item.
        /// </summary>
        ItemPriceSet = 29,
        
        /// <summary>
        /// >> ItemPriceRemoved
        /// The price for the item was removed.
        /// </summary>
        ItemPriceRemoved = 30,
        
        /// <summary>
        /// >> ItemBought
        /// An item was bought.
        /// </summary>
        ItemBought = 31,
        
        /// <summary>
        /// >> TipSent
        /// A tip was sent.
        /// </summary>
        TipSent = 32,
        
        /// <summary>
        /// >> SwapCreated
        /// An `item` swap intent was created.
        /// </summary>
        SwapCreated = 33,
        
        /// <summary>
        /// >> SwapCancelled
        /// The swap was cancelled.
        /// </summary>
        SwapCancelled = 34,
        
        /// <summary>
        /// >> SwapClaimed
        /// The swap has been claimed.
        /// </summary>
        SwapClaimed = 35,
        
        /// <summary>
        /// >> PreSignedAttributesSet
        /// New attributes have been set for an `item` of the `collection`.
        /// </summary>
        PreSignedAttributesSet = 36,
        
        /// <summary>
        /// >> PalletAttributeSet
        /// A new attribute in the `Pallet` namespace was set for the `collection` or an `item`
        /// within that `collection`.
        /// </summary>
        PalletAttributeSet = 37,
    }
    
    /// <summary>
    /// >> 187 - Variant[pallet_nfts.pallet.Event]
    /// The `Event` enum of this pallet
    /// </summary>
    public sealed class EnumEvent : BaseEnumExt<Event, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>, Substrate.NetApi.Model.Types.Primitive.U32, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Substrate.NetApi.Model.Types.Primitive.Bool, Substrate.NetApi.Model.Types.Primitive.Bool>, Substrate.NetApi.Model.Types.Primitive.U32, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Base.BaseOpt<Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>, Substrate.NetApi.Model.Types.Base.BaseOpt<Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>, Substrate.NetApi.Model.Types.Base.BaseOpt<Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Primitive.U32>>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>, Substrate.NetApi.Model.Types.Primitive.U32, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.bounded_collections.bounded_vec.BoundedVecT11>, Substrate.NetApi.Model.Types.Primitive.U32, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Bajun.NetApi.Generated.Model.bounded_collections.bounded_vec.BoundedVecT11>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Base.BaseVec<Bajun.NetApi.Generated.Model.primitive_types.H256>>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Base.BaseOpt<Bajun.NetApi.Generated.Model.primitive_types.H256>, Bajun.NetApi.Generated.Model.bounded_collections.bounded_vec.BoundedVecT12, Bajun.NetApi.Generated.Model.bounded_collections.bounded_vec.BoundedVecT13, Bajun.NetApi.Generated.Model.pallet_nfts.types.EnumAttributeNamespace>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Base.BaseOpt<Bajun.NetApi.Generated.Model.primitive_types.H256>, Bajun.NetApi.Generated.Model.bounded_collections.bounded_vec.BoundedVecT12, Bajun.NetApi.Generated.Model.pallet_nfts.types.EnumAttributeNamespace>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>, BaseTuple<Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Primitive.U32>>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Primitive.U32>, Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Base.BaseOpt<Substrate.NetApi.Model.Types.Primitive.U32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Substrate.NetApi.Model.Types.Primitive.U128, Substrate.NetApi.Model.Types.Base.BaseOpt<Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Substrate.NetApi.Model.Types.Primitive.U128, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U128>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Base.BaseOpt<Bajun.NetApi.Generated.Model.primitive_types.H256>, Substrate.NetApi.Model.Types.Base.BaseOpt<Bajun.NetApi.Generated.Model.pallet_nfts.types.PriceWithDirection>, Substrate.NetApi.Model.Types.Primitive.U32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Base.BaseOpt<Bajun.NetApi.Generated.Model.primitive_types.H256>, Substrate.NetApi.Model.Types.Base.BaseOpt<Bajun.NetApi.Generated.Model.pallet_nfts.types.PriceWithDirection>, Substrate.NetApi.Model.Types.Primitive.U32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Bajun.NetApi.Generated.Model.sp_core.crypto.AccountId32, Substrate.NetApi.Model.Types.Base.BaseOpt<Bajun.NetApi.Generated.Model.pallet_nfts.types.PriceWithDirection>, Substrate.NetApi.Model.Types.Primitive.U32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Bajun.NetApi.Generated.Model.primitive_types.H256, Bajun.NetApi.Generated.Model.pallet_nfts.types.EnumAttributeNamespace>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Base.BaseOpt<Bajun.NetApi.Generated.Model.primitive_types.H256>, Bajun.NetApi.Generated.Model.pallet_nfts.types.EnumPalletAttributes, Bajun.NetApi.Generated.Model.bounded_collections.bounded_vec.BoundedVecT13>>
    {
    }
}
