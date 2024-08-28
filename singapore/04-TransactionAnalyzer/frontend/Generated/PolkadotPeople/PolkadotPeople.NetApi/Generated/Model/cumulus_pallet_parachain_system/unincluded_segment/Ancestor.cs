//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using Substrate.NetApi.Attributes;
using Substrate.NetApi.Model.Types.Base;
using Substrate.NetApi.Model.Types.Metadata.V14;
using System.Collections.Generic;


namespace PolkadotPeople.NetApi.Generated.Model.cumulus_pallet_parachain_system.unincluded_segment
{
    
    
    /// <summary>
    /// >> 155 - Composite[cumulus_pallet_parachain_system.unincluded_segment.Ancestor]
    /// </summary>
    [SubstrateNodeType(TypeDefEnum.Composite)]
    public sealed class Ancestor : BaseType
    {
        
        /// <summary>
        /// >> used_bandwidth
        /// </summary>
        public PolkadotPeople.NetApi.Generated.Model.cumulus_pallet_parachain_system.unincluded_segment.UsedBandwidth UsedBandwidth { get; set; }
        /// <summary>
        /// >> para_head_hash
        /// </summary>
        public Substrate.NetApi.Model.Types.Base.BaseOpt<PolkadotPeople.NetApi.Generated.Model.primitive_types.H256> ParaHeadHash { get; set; }
        /// <summary>
        /// >> consumed_go_ahead_signal
        /// </summary>
        public Substrate.NetApi.Model.Types.Base.BaseOpt<PolkadotPeople.NetApi.Generated.Model.polkadot_primitives.v6.EnumUpgradeGoAhead> ConsumedGoAheadSignal { get; set; }
        
        /// <inheritdoc/>
        public override string TypeName()
        {
            return "Ancestor";
        }
        
        /// <inheritdoc/>
        public override byte[] Encode()
        {
            var result = new List<byte>();
            result.AddRange(UsedBandwidth.Encode());
            result.AddRange(ParaHeadHash.Encode());
            result.AddRange(ConsumedGoAheadSignal.Encode());
            return result.ToArray();
        }
        
        /// <inheritdoc/>
        public override void Decode(byte[] byteArray, ref int p)
        {
            var start = p;
            UsedBandwidth = new PolkadotPeople.NetApi.Generated.Model.cumulus_pallet_parachain_system.unincluded_segment.UsedBandwidth();
            UsedBandwidth.Decode(byteArray, ref p);
            ParaHeadHash = new Substrate.NetApi.Model.Types.Base.BaseOpt<PolkadotPeople.NetApi.Generated.Model.primitive_types.H256>();
            ParaHeadHash.Decode(byteArray, ref p);
            ConsumedGoAheadSignal = new Substrate.NetApi.Model.Types.Base.BaseOpt<PolkadotPeople.NetApi.Generated.Model.polkadot_primitives.v6.EnumUpgradeGoAhead>();
            ConsumedGoAheadSignal.Decode(byteArray, ref p);
            var bytesLength = p - start;
            TypeSize = bytesLength;
            Bytes = new byte[bytesLength];
            global::System.Array.Copy(byteArray, start, Bytes, 0, bytesLength);
        }
    }
}
