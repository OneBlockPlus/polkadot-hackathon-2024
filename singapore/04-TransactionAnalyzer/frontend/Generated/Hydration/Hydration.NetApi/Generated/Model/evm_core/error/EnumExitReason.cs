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


namespace Hydration.NetApi.Generated.Model.evm_core.error
{
    
    
    /// <summary>
    /// >> ExitReason
    /// </summary>
    public enum ExitReason
    {
        
        /// <summary>
        /// >> Succeed
        /// </summary>
        Succeed = 0,
        
        /// <summary>
        /// >> Error
        /// </summary>
        Error = 1,
        
        /// <summary>
        /// >> Revert
        /// </summary>
        Revert = 2,
        
        /// <summary>
        /// >> Fatal
        /// </summary>
        Fatal = 3,
    }
    
    /// <summary>
    /// >> 134 - Variant[evm_core.error.ExitReason]
    /// </summary>
    public sealed class EnumExitReason : BaseEnumExt<ExitReason, Hydration.NetApi.Generated.Model.evm_core.error.EnumExitSucceed, Hydration.NetApi.Generated.Model.evm_core.error.EnumExitError, Hydration.NetApi.Generated.Model.evm_core.error.EnumExitRevert, Hydration.NetApi.Generated.Model.evm_core.error.EnumExitFatal>
    {
    }
}
