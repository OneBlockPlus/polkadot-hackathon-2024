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


namespace Substrate.NetApi.Generated.Model.polkadot_primitives.v2
{
    
    
    /// <summary>
    /// >> 389 - Composite[polkadot_primitives.v2.CommittedCandidateReceipt]
    /// </summary>
    [SubstrateNodeType(TypeDefEnum.Composite)]
    public sealed class CommittedCandidateReceipt : BaseType
    {
        
        /// <summary>
        /// >> descriptor
        /// </summary>
        private Substrate.NetApi.Generated.Model.polkadot_primitives.v2.CandidateDescriptor _descriptor;
        
        /// <summary>
        /// >> commitments
        /// </summary>
        private Substrate.NetApi.Generated.Model.polkadot_primitives.v2.CandidateCommitments _commitments;
        
        public Substrate.NetApi.Generated.Model.polkadot_primitives.v2.CandidateDescriptor Descriptor
        {
            get
            {
                return this._descriptor;
            }
            set
            {
                this._descriptor = value;
            }
        }
        
        public Substrate.NetApi.Generated.Model.polkadot_primitives.v2.CandidateCommitments Commitments
        {
            get
            {
                return this._commitments;
            }
            set
            {
                this._commitments = value;
            }
        }
        
        public override string TypeName()
        {
            return "CommittedCandidateReceipt";
        }
        
        public override byte[] Encode()
        {
            var result = new List<byte>();
            result.AddRange(Descriptor.Encode());
            result.AddRange(Commitments.Encode());
            return result.ToArray();
        }
        
        public override void Decode(byte[] byteArray, ref int p)
        {
            var start = p;
            Descriptor = new Substrate.NetApi.Generated.Model.polkadot_primitives.v2.CandidateDescriptor();
            Descriptor.Decode(byteArray, ref p);
            Commitments = new Substrate.NetApi.Generated.Model.polkadot_primitives.v2.CandidateCommitments();
            Commitments.Decode(byteArray, ref p);
            TypeSize = p - start;
        }
    }
}
