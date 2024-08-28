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


namespace Bajun.NetApi.Generated.Model.orml_vesting.module
{
    
    
    /// <summary>
    /// >> Call
    /// Contains a variant per dispatchable extrinsic that this pallet has.
    /// </summary>
    public enum Call
    {
        
        /// <summary>
        /// >> claim
        /// </summary>
        claim = 0,
        
        /// <summary>
        /// >> vested_transfer
        /// </summary>
        vested_transfer = 1,
        
        /// <summary>
        /// >> update_vesting_schedules
        /// </summary>
        update_vesting_schedules = 2,
        
        /// <summary>
        /// >> claim_for
        /// </summary>
        claim_for = 3,
    }
    
    /// <summary>
    /// >> 341 - Variant[orml_vesting.module.Call]
    /// Contains a variant per dispatchable extrinsic that this pallet has.
    /// </summary>
    public sealed class EnumCall : BaseEnumExt<Call, BaseVoid, BaseTuple<Bajun.NetApi.Generated.Model.sp_runtime.multiaddress.EnumMultiAddress, Bajun.NetApi.Generated.Model.orml_vesting.VestingSchedule>, BaseTuple<Bajun.NetApi.Generated.Model.sp_runtime.multiaddress.EnumMultiAddress, Substrate.NetApi.Model.Types.Base.BaseVec<Bajun.NetApi.Generated.Model.orml_vesting.VestingSchedule>>, Bajun.NetApi.Generated.Model.sp_runtime.multiaddress.EnumMultiAddress>
    {
    }
}
