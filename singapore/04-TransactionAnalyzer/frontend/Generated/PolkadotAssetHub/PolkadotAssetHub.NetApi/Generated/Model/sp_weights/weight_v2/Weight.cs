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


namespace PolkadotAssetHub.NetApi.Generated.Model.sp_weights.weight_v2
{
    
    
    /// <summary>
    /// >> 9 - Composite[sp_weights.weight_v2.Weight]
    /// </summary>
    [SubstrateNodeType(TypeDefEnum.Composite)]
    public sealed class Weight : BaseType
    {
        
        /// <summary>
        /// >> ref_time
        /// </summary>
        public Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64> RefTime { get; set; }
        /// <summary>
        /// >> proof_size
        /// </summary>
        public Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64> ProofSize { get; set; }
        
        /// <inheritdoc/>
        public override string TypeName()
        {
            return "Weight";
        }
        
        /// <inheritdoc/>
        public override byte[] Encode()
        {
            var result = new List<byte>();
            result.AddRange(RefTime.Encode());
            result.AddRange(ProofSize.Encode());
            return result.ToArray();
        }
        
        /// <inheritdoc/>
        public override void Decode(byte[] byteArray, ref int p)
        {
            var start = p;
            RefTime = new Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>();
            RefTime.Decode(byteArray, ref p);
            ProofSize = new Substrate.NetApi.Model.Types.Base.BaseCom<Substrate.NetApi.Model.Types.Primitive.U64>();
            ProofSize.Decode(byteArray, ref p);
            var bytesLength = p - start;
            TypeSize = bytesLength;
            Bytes = new byte[bytesLength];
            global::System.Array.Copy(byteArray, start, Bytes, 0, bytesLength);
        }
    }
}
