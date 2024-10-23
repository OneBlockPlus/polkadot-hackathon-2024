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


namespace Substrate.NetApi.Generated.Model.pallet_contracts.pallet
{
    
    
    public enum Error
    {
        
        InvalidScheduleVersion = 0,
        
        InvalidCallFlags = 1,
        
        OutOfGas = 2,
        
        OutputBufferTooSmall = 3,
        
        TransferFailed = 4,
        
        MaxCallDepthReached = 5,
        
        ContractNotFound = 6,
        
        CodeTooLarge = 7,
        
        CodeNotFound = 8,
        
        OutOfBounds = 9,
        
        DecodingFailed = 10,
        
        ContractTrapped = 11,
        
        ValueTooLarge = 12,
        
        TerminatedWhileReentrant = 13,
        
        InputForwarded = 14,
        
        RandomSubjectTooLong = 15,
        
        TooManyTopics = 16,
        
        NoChainExtension = 17,
        
        DeletionQueueFull = 18,
        
        DuplicateContract = 19,
        
        TerminatedInConstructor = 20,
        
        DebugMessageInvalidUTF8 = 21,
        
        ReentranceDenied = 22,
        
        StorageDepositNotEnoughFunds = 23,
        
        StorageDepositLimitExhausted = 24,
        
        CodeInUse = 25,
        
        ContractReverted = 26,
        
        CodeRejected = 27,
        
        Indeterministic = 28,
    }
    
    /// <summary>
    /// >> 270 - Variant[pallet_contracts.pallet.Error]
    /// 
    ///			Custom [dispatch errors](https://docs.substrate.io/main-docs/build/events-errors/)
    ///			of this pallet.
    ///			
    /// </summary>
    public sealed class EnumError : BaseEnum<Error>
    {
    }
}
