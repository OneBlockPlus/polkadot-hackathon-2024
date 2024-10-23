//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using Substrate.NetApi;
using Substrate.NetApi.Model.Extrinsics;
using Substrate.NetApi.Model.Meta;
using Substrate.NetApi.Model.Types;
using Substrate.NetApi.Model.Types.Base;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;


namespace Polkadot.NetApi.Generated.Storage
{
    
    
    /// <summary>
    /// >> OffencesStorage
    /// </summary>
    public sealed class OffencesStorage
    {
        
        // Substrate client for the storage calls.
        private SubstrateClientExt _client;
        
        /// <summary>
        /// >> OffencesStorage Constructor
        /// </summary>
        public OffencesStorage(SubstrateClientExt client)
        {
            this._client = client;
            _client.StorageKeyDict.Add(new System.Tuple<string, string>("Offences", "Reports"), new System.Tuple<Substrate.NetApi.Model.Meta.Storage.Hasher[], System.Type, System.Type>(new Substrate.NetApi.Model.Meta.Storage.Hasher[] {
                            Substrate.NetApi.Model.Meta.Storage.Hasher.Twox64Concat}, typeof(Polkadot.NetApi.Generated.Model.primitive_types.H256), typeof(Polkadot.NetApi.Generated.Model.sp_staking.offence.OffenceDetails)));
            _client.StorageKeyDict.Add(new System.Tuple<string, string>("Offences", "ConcurrentReportsIndex"), new System.Tuple<Substrate.NetApi.Model.Meta.Storage.Hasher[], System.Type, System.Type>(new Substrate.NetApi.Model.Meta.Storage.Hasher[] {
                            Substrate.NetApi.Model.Meta.Storage.Hasher.Twox64Concat,
                            Substrate.NetApi.Model.Meta.Storage.Hasher.Twox64Concat}, typeof(Substrate.NetApi.Model.Types.Base.BaseTuple<Polkadot.NetApi.Generated.Types.Base.Arr16U8, Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Primitive.U8>>), typeof(Substrate.NetApi.Model.Types.Base.BaseVec<Polkadot.NetApi.Generated.Model.primitive_types.H256>)));
        }
        
        /// <summary>
        /// >> ReportsParams
        ///  The primary structure that holds all offence records keyed by report identifiers.
        /// </summary>
        public static string ReportsParams(Polkadot.NetApi.Generated.Model.primitive_types.H256 key)
        {
            return RequestGenerator.GetStorage("Offences", "Reports", Substrate.NetApi.Model.Meta.Storage.Type.Map, new Substrate.NetApi.Model.Meta.Storage.Hasher[] {
                        Substrate.NetApi.Model.Meta.Storage.Hasher.Twox64Concat}, new Substrate.NetApi.Model.Types.IType[] {
                        key});
        }
        
        /// <summary>
        /// >> ReportsDefault
        /// Default value as hex string
        /// </summary>
        public static string ReportsDefault()
        {
            return "0x00";
        }
        
        /// <summary>
        /// >> Reports
        ///  The primary structure that holds all offence records keyed by report identifiers.
        /// </summary>
        public async Task<Polkadot.NetApi.Generated.Model.sp_staking.offence.OffenceDetails> Reports(Polkadot.NetApi.Generated.Model.primitive_types.H256 key, string blockhash, CancellationToken token)
        {
            string parameters = OffencesStorage.ReportsParams(key);
            var result = await _client.GetStorageAsync<Polkadot.NetApi.Generated.Model.sp_staking.offence.OffenceDetails>(parameters, blockhash, token);
            return result;
        }
        
        /// <summary>
        /// >> ConcurrentReportsIndexParams
        ///  A vector of reports of the same kind that happened at the same time slot.
        /// </summary>
        public static string ConcurrentReportsIndexParams(Substrate.NetApi.Model.Types.Base.BaseTuple<Polkadot.NetApi.Generated.Types.Base.Arr16U8, Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Primitive.U8>> key)
        {
            return RequestGenerator.GetStorage("Offences", "ConcurrentReportsIndex", Substrate.NetApi.Model.Meta.Storage.Type.Map, new Substrate.NetApi.Model.Meta.Storage.Hasher[] {
                        Substrate.NetApi.Model.Meta.Storage.Hasher.Twox64Concat,
                        Substrate.NetApi.Model.Meta.Storage.Hasher.Twox64Concat}, key.Value);
        }
        
        /// <summary>
        /// >> ConcurrentReportsIndexDefault
        /// Default value as hex string
        /// </summary>
        public static string ConcurrentReportsIndexDefault()
        {
            return "0x00";
        }
        
        /// <summary>
        /// >> ConcurrentReportsIndex
        ///  A vector of reports of the same kind that happened at the same time slot.
        /// </summary>
        public async Task<Substrate.NetApi.Model.Types.Base.BaseVec<Polkadot.NetApi.Generated.Model.primitive_types.H256>> ConcurrentReportsIndex(Substrate.NetApi.Model.Types.Base.BaseTuple<Polkadot.NetApi.Generated.Types.Base.Arr16U8, Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Primitive.U8>> key, string blockhash, CancellationToken token)
        {
            string parameters = OffencesStorage.ConcurrentReportsIndexParams(key);
            var result = await _client.GetStorageAsync<Substrate.NetApi.Model.Types.Base.BaseVec<Polkadot.NetApi.Generated.Model.primitive_types.H256>>(parameters, blockhash, token);
            return result;
        }
    }
    
    /// <summary>
    /// >> OffencesCalls
    /// </summary>
    public sealed class OffencesCalls
    {
    }
    
    /// <summary>
    /// >> OffencesConstants
    /// </summary>
    public sealed class OffencesConstants
    {
    }
}
