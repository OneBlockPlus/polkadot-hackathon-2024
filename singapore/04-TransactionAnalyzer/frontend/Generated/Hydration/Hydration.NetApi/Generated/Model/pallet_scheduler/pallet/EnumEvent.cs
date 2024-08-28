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


namespace Hydration.NetApi.Generated.Model.pallet_scheduler.pallet
{
    
    
    /// <summary>
    /// >> Event
    /// Events type.
    /// </summary>
    public enum Event
    {
        
        /// <summary>
        /// >> Scheduled
        /// Scheduled some task.
        /// </summary>
        Scheduled = 0,
        
        /// <summary>
        /// >> Canceled
        /// Canceled some task.
        /// </summary>
        Canceled = 1,
        
        /// <summary>
        /// >> Dispatched
        /// Dispatched some task.
        /// </summary>
        Dispatched = 2,
        
        /// <summary>
        /// >> CallUnavailable
        /// The call for the provided hash was not found so the task has been aborted.
        /// </summary>
        CallUnavailable = 3,
        
        /// <summary>
        /// >> PeriodicFailed
        /// The given task was unable to be renewed since the agenda is full at that block.
        /// </summary>
        PeriodicFailed = 4,
        
        /// <summary>
        /// >> PermanentlyOverweight
        /// The given task can never be executed since it is overweight.
        /// </summary>
        PermanentlyOverweight = 5,
    }
    
    /// <summary>
    /// >> 153 - Variant[pallet_scheduler.pallet.Event]
    /// Events type.
    /// </summary>
    public sealed class EnumEvent : BaseEnumExt<Event, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Primitive.U32>, BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Primitive.U32>, BaseTuple<Substrate.NetApi.Model.Types.Base.BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Primitive.U32>, Substrate.NetApi.Model.Types.Base.BaseOpt<Hydration.NetApi.Generated.Types.Base.Arr32U8>, Hydration.NetApi.Generated.Types.Base.EnumResult>, BaseTuple<Substrate.NetApi.Model.Types.Base.BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Primitive.U32>, Substrate.NetApi.Model.Types.Base.BaseOpt<Hydration.NetApi.Generated.Types.Base.Arr32U8>>, BaseTuple<Substrate.NetApi.Model.Types.Base.BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Primitive.U32>, Substrate.NetApi.Model.Types.Base.BaseOpt<Hydration.NetApi.Generated.Types.Base.Arr32U8>>, BaseTuple<Substrate.NetApi.Model.Types.Base.BaseTuple<Substrate.NetApi.Model.Types.Primitive.U32, Substrate.NetApi.Model.Types.Primitive.U32>, Substrate.NetApi.Model.Types.Base.BaseOpt<Hydration.NetApi.Generated.Types.Base.Arr32U8>>>
    {
    }
}
