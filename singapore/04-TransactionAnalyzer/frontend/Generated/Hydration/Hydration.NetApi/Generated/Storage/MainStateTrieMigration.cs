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


namespace Hydration.NetApi.Generated.Storage
{
    
    
    /// <summary>
    /// >> StateTrieMigrationStorage
    /// </summary>
    public sealed class StateTrieMigrationStorage
    {
        
        // Substrate client for the storage calls.
        private SubstrateClientExt _client;
        
        /// <summary>
        /// >> StateTrieMigrationStorage Constructor
        /// </summary>
        public StateTrieMigrationStorage(SubstrateClientExt client)
        {
            this._client = client;
            _client.StorageKeyDict.Add(new System.Tuple<string, string>("StateTrieMigration", "MigrationProcess"), new System.Tuple<Substrate.NetApi.Model.Meta.Storage.Hasher[], System.Type, System.Type>(null, null, typeof(Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.MigrationTask)));
            _client.StorageKeyDict.Add(new System.Tuple<string, string>("StateTrieMigration", "AutoLimits"), new System.Tuple<Substrate.NetApi.Model.Meta.Storage.Hasher[], System.Type, System.Type>(null, null, typeof(Substrate.NetApi.Model.Types.Base.BaseOpt<Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.MigrationLimits>)));
            _client.StorageKeyDict.Add(new System.Tuple<string, string>("StateTrieMigration", "SignedMigrationMaxLimits"), new System.Tuple<Substrate.NetApi.Model.Meta.Storage.Hasher[], System.Type, System.Type>(null, null, typeof(Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.MigrationLimits)));
        }
        
        /// <summary>
        /// >> MigrationProcessParams
        ///  Migration progress.
        /// 
        ///  This stores the snapshot of the last migrated keys. It can be set into motion and move
        ///  forward by any of the means provided by this pallet.
        /// </summary>
        public static string MigrationProcessParams()
        {
            return RequestGenerator.GetStorage("StateTrieMigration", "MigrationProcess", Substrate.NetApi.Model.Meta.Storage.Type.Plain);
        }
        
        /// <summary>
        /// >> MigrationProcessDefault
        /// Default value as hex string
        /// </summary>
        public static string MigrationProcessDefault()
        {
            return "0x0000000000000000000000000000";
        }
        
        /// <summary>
        /// >> MigrationProcess
        ///  Migration progress.
        /// 
        ///  This stores the snapshot of the last migrated keys. It can be set into motion and move
        ///  forward by any of the means provided by this pallet.
        /// </summary>
        public async Task<Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.MigrationTask> MigrationProcess(string blockhash, CancellationToken token)
        {
            string parameters = StateTrieMigrationStorage.MigrationProcessParams();
            var result = await _client.GetStorageAsync<Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.MigrationTask>(parameters, blockhash, token);
            return result;
        }
        
        /// <summary>
        /// >> AutoLimitsParams
        ///  The limits that are imposed on automatic migrations.
        /// 
        ///  If set to None, then no automatic migration happens.
        /// </summary>
        public static string AutoLimitsParams()
        {
            return RequestGenerator.GetStorage("StateTrieMigration", "AutoLimits", Substrate.NetApi.Model.Meta.Storage.Type.Plain);
        }
        
        /// <summary>
        /// >> AutoLimitsDefault
        /// Default value as hex string
        /// </summary>
        public static string AutoLimitsDefault()
        {
            return "0x00";
        }
        
        /// <summary>
        /// >> AutoLimits
        ///  The limits that are imposed on automatic migrations.
        /// 
        ///  If set to None, then no automatic migration happens.
        /// </summary>
        public async Task<Substrate.NetApi.Model.Types.Base.BaseOpt<Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.MigrationLimits>> AutoLimits(string blockhash, CancellationToken token)
        {
            string parameters = StateTrieMigrationStorage.AutoLimitsParams();
            var result = await _client.GetStorageAsync<Substrate.NetApi.Model.Types.Base.BaseOpt<Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.MigrationLimits>>(parameters, blockhash, token);
            return result;
        }
        
        /// <summary>
        /// >> SignedMigrationMaxLimitsParams
        ///  The maximum limits that the signed migration could use.
        /// 
        ///  If not set, no signed submission is allowed.
        /// </summary>
        public static string SignedMigrationMaxLimitsParams()
        {
            return RequestGenerator.GetStorage("StateTrieMigration", "SignedMigrationMaxLimits", Substrate.NetApi.Model.Meta.Storage.Type.Plain);
        }
        
        /// <summary>
        /// >> SignedMigrationMaxLimitsDefault
        /// Default value as hex string
        /// </summary>
        public static string SignedMigrationMaxLimitsDefault()
        {
            return "0x00";
        }
        
        /// <summary>
        /// >> SignedMigrationMaxLimits
        ///  The maximum limits that the signed migration could use.
        /// 
        ///  If not set, no signed submission is allowed.
        /// </summary>
        public async Task<Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.MigrationLimits> SignedMigrationMaxLimits(string blockhash, CancellationToken token)
        {
            string parameters = StateTrieMigrationStorage.SignedMigrationMaxLimitsParams();
            var result = await _client.GetStorageAsync<Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.MigrationLimits>(parameters, blockhash, token);
            return result;
        }
    }
    
    /// <summary>
    /// >> StateTrieMigrationCalls
    /// </summary>
    public sealed class StateTrieMigrationCalls
    {
        
        /// <summary>
        /// >> control_auto_migration
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method ControlAutoMigration(Substrate.NetApi.Model.Types.Base.BaseOpt<Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.MigrationLimits> maybe_config)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(maybe_config.Encode());
            return new Method(35, "StateTrieMigration", 0, "control_auto_migration", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> continue_migrate
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method ContinueMigrate(Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.MigrationLimits limits, Substrate.NetApi.Model.Types.Primitive.U32 real_size_upper, Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.MigrationTask witness_task)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(limits.Encode());
            byteArray.AddRange(real_size_upper.Encode());
            byteArray.AddRange(witness_task.Encode());
            return new Method(35, "StateTrieMigration", 1, "continue_migrate", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> migrate_custom_top
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method MigrateCustomTop(Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Primitive.U8>> keys, Substrate.NetApi.Model.Types.Primitive.U32 witness_size)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(keys.Encode());
            byteArray.AddRange(witness_size.Encode());
            return new Method(35, "StateTrieMigration", 2, "migrate_custom_top", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> migrate_custom_child
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method MigrateCustomChild(Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Primitive.U8> root, Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Base.BaseVec<Substrate.NetApi.Model.Types.Primitive.U8>> child_keys, Substrate.NetApi.Model.Types.Primitive.U32 total_size)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(root.Encode());
            byteArray.AddRange(child_keys.Encode());
            byteArray.AddRange(total_size.Encode());
            return new Method(35, "StateTrieMigration", 3, "migrate_custom_child", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> set_signed_max_limits
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method SetSignedMaxLimits(Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.MigrationLimits limits)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(limits.Encode());
            return new Method(35, "StateTrieMigration", 4, "set_signed_max_limits", byteArray.ToArray());
        }
        
        /// <summary>
        /// >> force_set_progress
        /// Contains a variant per dispatchable extrinsic that this pallet has.
        /// </summary>
        public static Method ForceSetProgress(Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.EnumProgress progress_top, Hydration.NetApi.Generated.Model.pallet_state_trie_migration.pallet.EnumProgress progress_child)
        {
            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(progress_top.Encode());
            byteArray.AddRange(progress_child.Encode());
            return new Method(35, "StateTrieMigration", 5, "force_set_progress", byteArray.ToArray());
        }
    }
    
    /// <summary>
    /// >> StateTrieMigrationConstants
    /// </summary>
    public sealed class StateTrieMigrationConstants
    {
        
        /// <summary>
        /// >> MaxKeyLen
        ///  Maximal number of bytes that a key can have.
        /// 
        ///  FRAME itself does not limit the key length.
        ///  The concrete value must therefore depend on your storage usage.
        ///  A [`frame_support::storage::StorageNMap`] for example can have an arbitrary number of
        ///  keys which are then hashed and concatenated, resulting in arbitrarily long keys.
        /// 
        ///  Use the *state migration RPC* to retrieve the length of the longest key in your
        ///  storage: <https://github.com/paritytech/substrate/issues/11642>
        /// 
        ///  The migration will halt with a `Halted` event if this value is too small.
        ///  Since there is no real penalty from over-estimating, it is advised to use a large
        ///  value. The default is 512 byte.
        /// 
        ///  Some key lengths for reference:
        ///  - [`frame_support::storage::StorageValue`]: 32 byte
        ///  - [`frame_support::storage::StorageMap`]: 64 byte
        ///  - [`frame_support::storage::StorageDoubleMap`]: 96 byte
        /// 
        ///  For more info see
        ///  <https://www.shawntabrizi.com/blog/substrate/querying-substrate-storage-via-rpc/>
        /// </summary>
        public Substrate.NetApi.Model.Types.Primitive.U32 MaxKeyLen()
        {
            var result = new Substrate.NetApi.Model.Types.Primitive.U32();
            result.Create("0x00020000");
            return result;
        }
    }
    
    /// <summary>
    /// >> StateTrieMigrationErrors
    /// </summary>
    public enum StateTrieMigrationErrors
    {
        
        /// <summary>
        /// >> MaxSignedLimits
        /// Max signed limits not respected.
        /// </summary>
        MaxSignedLimits,
        
        /// <summary>
        /// >> KeyTooLong
        /// A key was longer than the configured maximum.
        /// 
        /// This means that the migration halted at the current [`Progress`] and
        /// can be resumed with a larger [`crate::Config::MaxKeyLen`] value.
        /// Retrying with the same [`crate::Config::MaxKeyLen`] value will not work.
        /// The value should only be increased to avoid a storage migration for the currently
        /// stored [`crate::Progress::LastKey`].
        /// </summary>
        KeyTooLong,
        
        /// <summary>
        /// >> NotEnoughFunds
        /// submitter does not have enough funds.
        /// </summary>
        NotEnoughFunds,
        
        /// <summary>
        /// >> BadWitness
        /// Bad witness data provided.
        /// </summary>
        BadWitness,
        
        /// <summary>
        /// >> SignedMigrationNotAllowed
        /// Signed migration is not allowed because the maximum limit is not set yet.
        /// </summary>
        SignedMigrationNotAllowed,
        
        /// <summary>
        /// >> BadChildRoot
        /// Bad child root provided.
        /// </summary>
        BadChildRoot,
    }
}
