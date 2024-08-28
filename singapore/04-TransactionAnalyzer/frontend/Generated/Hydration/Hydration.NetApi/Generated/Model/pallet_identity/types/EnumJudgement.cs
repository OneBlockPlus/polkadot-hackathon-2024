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


namespace Hydration.NetApi.Generated.Model.pallet_identity.types
{
    
    
    /// <summary>
    /// >> Judgement
    /// </summary>
    public enum Judgement
    {
        
        /// <summary>
        /// >> Unknown
        /// </summary>
        Unknown = 0,
        
        /// <summary>
        /// >> FeePaid
        /// </summary>
        FeePaid = 1,
        
        /// <summary>
        /// >> Reasonable
        /// </summary>
        Reasonable = 2,
        
        /// <summary>
        /// >> KnownGood
        /// </summary>
        KnownGood = 3,
        
        /// <summary>
        /// >> OutOfDate
        /// </summary>
        OutOfDate = 4,
        
        /// <summary>
        /// >> LowQuality
        /// </summary>
        LowQuality = 5,
        
        /// <summary>
        /// >> Erroneous
        /// </summary>
        Erroneous = 6,
    }
    
    /// <summary>
    /// >> 326 - Variant[pallet_identity.types.Judgement]
    /// </summary>
    public sealed class EnumJudgement : BaseEnumExt<Judgement, BaseVoid, Substrate.NetApi.Model.Types.Primitive.U128, BaseVoid, BaseVoid, BaseVoid, BaseVoid, BaseVoid>
    {
    }
}
