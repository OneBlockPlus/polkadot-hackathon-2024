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


namespace Opal.NetApi.Generated.Storage
{
    
    
    /// <summary>
    /// >> EvmMigrationStorage
    /// </summary>
    public sealed class EvmMigrationStorage
    {
        
        // Substrate client for the storage calls.
        private SubstrateClientExt _client;
        
        /// <summary>
        /// >> EvmMigrationStorage Constructor
        /// </summary>
        public EvmMigrationStorage(SubstrateClientExt client)
        {
            this._client = client;
            _client.StorageKeyDict.Add(new System.Tuple<string, string>("EvmMigration", "MigrationPending"), new System.Tuple<Substrate.NetApi.Model.Meta.Storage.Hasher[], System.Type, System.Type>(new Substrate.NetApi.Model.Meta.Storage.Hasher[] {
                            Substrate.NetApi.Model.Meta.Storage.Hasher.Twox64Concat}, typeof(Opal.NetApi.Generated.Model.primitive_types.H160), typeof(Substrate.NetApi.Model.Types.Primitive.Bool)));
        }
        
        /// <summary>
        /// >> MigrationPendingParams
        /// </summary>
        public static string MigrationPendingParams(Opal.NetApi.Generated.Model.primitive_types.H160 key)
        {
            return RequestGenerator.GetStorage("EvmMigration", "MigrationPending", Substrate.NetApi.Model.Meta.Storage.Type.Map, new Substrate.NetApi.Model.Meta.Storage.Hasher[] {
                        Substrate.NetApi.Model.Meta.Storage.Hasher.Twox64Concat}, new Substrate.NetApi.Model.Types.IType[] {
                        key});
        }
        
        /// <summary>
        /// >> MigrationPendingDefault
        /// Default value as hex string
        /// </summary>
        public static string MigrationPendingDefault()
        {
            return "0x00";
        }
        
        /// <summary>
        /// >> MigrationPending
        /// </summary>
        public async Task<Substrate.NetApi.Model.Types.Primitive.Bool> MigrationPending(Opal.NetApi.Generated.Model.primitive_types.H160 key, string blockhash, CancellationToken token)
        {
            string parameters = EvmMigrationStorage.MigrationPendingParams(key);
            var result = await _client.GetStorageAsync<Substrate.NetApi.Model.Types.Primitive.Bool>(parameters, blockhash, token);
            return result;
        }
    }
    
    /// <summary>
    /// >> EvmMigrationCalls
    /// </summary>
    public sealed class EvmMigrationCalls
    {
        
        /// <summary>
        /// >> begin
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method Begin(Opal.NetApi.Generated.Model.primitive_types.H160 address)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(address.Encode());
            return new Method(153, "EvmMigration", 0, "begin", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> set_data
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method SetData(Opal.NetApi.Generated.Model.primitive_types.H160 address, Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Base.BaseTuple<Opal.NetApi.Generated.Model.primitive_types.H256, Opal.NetApi.Generated.Model.primitive_types.H256>> data)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(address.Encode());
            byteArray.AddRange(data.Encode());
            return new Method(153, "EvmMigration", 1, "set_data", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> finish
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method Finish(Opal.NetApi.Generated.Model.primitive_types.H160 address, Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Primitive.U8> code)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(address.Encode());
            byteArray.AddRange(code.Encode());
            return new Method(153, "EvmMigration", 2, "finish", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> insert_eth_logs
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method InsertEthLogs(Substrate.NetApi.Model.Types.Base.BaseVec<Opal.NetApi.Generated.Model.ethereum.log.Log> logs)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(logs.Encode());
            return new Method(153, "EvmMigration", 3, "insert_eth_logs", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> insert_events
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method InsertEvents(Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Primitive.U8>> events)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(events.Encode());
            return new Method(153, "EvmMigration", 4, "insert_events", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> remove_rmrk_data
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method RemoveRmrkData()
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            return new Method(153, "EvmMigration", 5, "remove_rmrk_data", byteArray.ToArray());
        }
    }
    
    /// <summary>
    /// >> EvmMigrationConstants
    /// </summary>
    public sealed class EvmMigrationConstants
    {
    }
    
    /// <summary>
    /// >> EvmMigrationErrors
    /// </summary>
    public enum EvmMigrationErrors
    {
        
        /// <summary>
        /// >> AccountNotEmpty
        /// Can only migrate to empty address.
        /// </summary>
        AccountNotEmpty,
        
        /// <summary>
        /// >> AccountIsNotMigrating
        /// Migration of this account is not yet started, or already finished.
        /// </summary>
        AccountIsNotMigrating,
        
        /// <summary>
        /// >> BadEvent
        /// Failed to decode event bytes
        /// </summary>
        BadEvent,
    }
}
