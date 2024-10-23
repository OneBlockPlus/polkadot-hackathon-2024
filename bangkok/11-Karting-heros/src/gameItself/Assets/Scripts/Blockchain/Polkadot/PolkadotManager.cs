using UnityEngine;
using Substrate.NET.Wallet;
using Substrate.NET.Wallet.Keyring;
using Substrate.NetApi;
using Substrate.NetApi.Model.Types;
using static Substrate.NetApi.Mnemonic;
using System;
using System.IO;
using Substrate.NetApi.Model.Extrinsics;
using Cysharp.Threading.Tasks;
public class PolkadotManager : IBlockchainManager, IDisposable{
    private Wallet _wallet;   
    public string Address => _wallet.Address;
    private readonly string _polkadotNode = "wss://polkadot.public.curie.radiumblock.co/ws";
    private readonly string _kusamaNode = "wss://kusama-rpc.dwellir.com";
    private readonly string _localNode = "ws://127.0.0.1:9944";


    private SubstrateClient _client;

    public PolkadotManager(){ 
        SetupFileSystem();
        LoadWallet();
        SetupNode();
    }

    private void SetupNode(){
        _client = new SubstrateClient(new System.Uri(_polkadotNode),ChargeTransactionPayment.Default());                
    }

    public async UniTask Connect(){
        await _client.ConnectAsync();
    }
    
    private void SetupFileSystem(){
        Func<string, string> dir = f => Path.Combine(Application.persistentDataPath, f);
        SystemInteraction.ReadData = f => File.ReadAllText(dir(f));
        SystemInteraction.DataExists = f => File.Exists(dir(f));
        SystemInteraction.ReadPersistent = f => File.ReadAllText(dir(f));
        SystemInteraction.PersistentExists = f => File.Exists(dir(f));
        SystemInteraction.Persist = (f, c) => File.WriteAllText(dir(f), c);
    }

    private void LoadWallet(){
        if(Wallet.TryLoad("wallet3",out _wallet)){
            _wallet.Unlock("1BCDefg");            
        }else{
            if(_wallet != null){
                throw new Exception("Wallet is already created");
            }
            var keyring = new Keyring();      
            keyring.AddWallet(_wallet);                        
            _wallet = keyring.AddFromMnemonic(
            Mnemonic.GenerateMnemonic(MnemonicSize.Words12), 
            new Meta(), 
            KeyType.Sr25519);
            Debug.Log(_wallet);
            _wallet.Save("wallet3","1BCDefg");            
        }        
    }

    public void Dispose()
    {
        if(_client != null)
            _client.Dispose();

    }
}



    

//     // public enum SubstrateCmds
//     // {
//     //     Runtime,
//     //     Properties,
//     //     Block,
//     //     Custom
//     // }

// public class PolkadotManager 
// {
//     public static MiniSecret MiniSecretAlice => new MiniSecret(Utils.HexToByteArray("0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a"), ExpandMode.Ed25519);
//     public static Account Alice => Account.Build(KeyType.Sr25519, MiniSecretAlice.ExpandToSecret().ToBytes(), MiniSecretAlice.GetPair().Public.Key);

//     private string _polkadotNode = "wss://polkadot.public.curie.radiumblock.co/ws";

//     private string _kusamaNode = "wss://kusama-rpc.dwellir.com";


//     private SubstrateClient _client;
//     private bool _running = false;

//     private Func<CancellationToken, Task<RuntimeVersion>> StateRuntimeVersion { get; set; }
//     private Func<CancellationToken, Task<Properties>> SystemProperties { get; set; }
//     private Func<CancellationToken, Task<U32>> SystemStorageNumber { get; set; }
//     private Func<CancellationToken, Task<U32>> SystemStorageCustom { get; set; }

//     private JsonSerializerOptions _jsonSerializerOptions;

//     /// <summary>
//     ///
//     /// </summary>
//     public PolkadotManager()
//     {
//         _jsonSerializerOptions = new JsonSerializerOptions
//         {
//             WriteIndented = true,
//             //Converters = { new BigIntegerConverter() }
//         };
       
//     }

    

//     /// <summary>
//     /// Drop down menu initialising a new client specific to each relay- or parachain.
//     /// </summary>
//     /// <param name="dropdown"></param>
//     public async UniTask getBlockchainInfo(SubstrateChains substrateChain)
//     {
//         string url = string.Empty;
//         switch (substrateChain)
//         {
//             case SubstrateChains.Polkadot:
//                 {
//                     url = _polkadotNode;
//                     _lblNodeUrl.text = url;
//                     _velChainLogo.style.backgroundImage = _polkadotLogo;
//                     _client = new PolkadotExt.SubstrateClientExt(new Uri(url), ChargeTransactionPayment.Default());

//                     StateRuntimeVersion = ((PolkadotExt.SubstrateClientExt)_client).State.GetRuntimeVersionAsync;
//                     SystemProperties = ((PolkadotExt.SubstrateClientExt)_client).System.PropertiesAsync;
//                     SystemStorageNumber = ((PolkadotExt.SubstrateClientExt)_client).SystemStorage.Number;

//                     SystemStorageCustom = ((PolkadotExt.SubstrateClientExt)_client).SystemStorage.EventCount;
//                 }
//                 break;

//             case SubstrateChains.Kusama:
//                 {
//                     url = _kusamaNode;
//                     _lblNodeUrl.text = url;
//                     _velChainLogo.style.backgroundImage = _kusamaLogo;
//                     _client = new KusamaExt.SubstrateClientExt(new Uri(url), ChargeTransactionPayment.Default());

//                     StateRuntimeVersion = ((KusamaExt.SubstrateClientExt)_client).State.GetRuntimeVersionAsync;
//                     SystemProperties = ((KusamaExt.SubstrateClientExt)_client).System.PropertiesAsync;
//                     SystemStorageNumber = ((KusamaExt.SubstrateClientExt)_client).SystemStorage.Number;

//                     SystemStorageCustom = ((KusamaExt.SubstrateClientExt)_client).SystemStorage.EventCount;
//                 }
//                 break;

//             case SubstrateChains.Local:
//                 {
//                     url = "ws://127.0.0.1:9944";
//                     _lblNodeUrl.text = url;
//                     _velChainLogo.style.backgroundImage = _hostLogo;
//                     _client = new LocalExt.SubstrateClientExt(new Uri(url), ChargeTransactionPayment.Default());

//                     StateRuntimeVersion = ((LocalExt.SubstrateClientExt)_client).State.GetRuntimeVersionAsync;
//                     SystemProperties = ((LocalExt.SubstrateClientExt)_client).System.PropertiesAsync;
//                     SystemStorageNumber = ((LocalExt.SubstrateClientExt)_client).SystemStorage.Number;

//                     SystemStorageCustom = ((LocalExt.SubstrateClientExt)_client).SystemStorage.EventCount;
//                 }
//                 break;

//             default:
//                 Debug.LogError($"Unhandled enumeration value {substrateChain}!");
//                 break;
//         }
//     }

    

//     private async Task ExecuteCommand(SubstrateCmds command)
//     {
//         switch (command)
//         {
//             case SubstrateCmds.Runtime:
//                 await HandleRuntimeCommand();
//                 break;

//             case SubstrateCmds.Properties:
//                 await HandlePropertiesCommand();
//                 break;

//             case SubstrateCmds.Block:
//                 await HandleBlockCommand();
//                 break;

//             case SubstrateCmds.Custom:
//                 await HandleCustomCommand();
//                 break;
//         }
//     }

//     private async Task HandleRuntimeCommand()
//     {
//         string commandText = SubstrateCmds.Runtime.ToString().ToLower();
//         _lblNodeInfo.text = $"{commandText}\n -> {commandText} = ...";
//         var runtimeVersion = await StateRuntimeVersion(CancellationToken.None);

//         _lblNodeInfo.text = runtimeVersion == null
//             ? $"{commandText}\n -> {commandText} = null"
//             : $"{commandText}\n -> {commandText} = {JsonSerializer.Serialize(runtimeVersion, _jsonSerializerOptions)}";
//     }

//     private async Task HandlePropertiesCommand()
//     {
//         string commandText = SubstrateCmds.Properties.ToString().ToLower();
//         _lblNodeInfo.text = $"{commandText}\n -> {commandText} = ...";
//         var properties = await SystemProperties(CancellationToken.None);

//         _lblNodeInfo.text = properties == null
//             ? $"{commandText}\n -> {commandText} = null"
//             : $"{commandText}\n -> {commandText} = {JsonSerializer.Serialize(properties, _jsonSerializerOptions)}";
//     }

//     private async Task HandleBlockCommand()
//     {
//         string commandText = SubstrateCmds.Block.ToString().ToLower();
//         _lblNodeInfo.text = $"{commandText}\n -> {commandText} = ...";
//         var blockNumber = await SystemStorageNumber(CancellationToken.None);

//         _lblNodeInfo.text = blockNumber == null
//             ? $"{commandText}\n -> {commandText} = null"
//             : $"{commandText}\n -> {commandText} = {blockNumber.Value}";
//     }

//     private async Task HandleCustomCommand()
//     {
//         string commandText = SubstrateCmds.Custom.ToString().ToLower();
//         string customName = "event count";
//         _lblNodeInfo.text = $"{commandText}\n -> {customName} = ...";
//         var blockNumber = await SystemStorageCustom(CancellationToken.None);

//         _lblNodeInfo.text = blockNumber == null
//             ? $"{commandText}\n -> {customName} = null"
//             : $"{commandText}\n -> {customName} = {blockNumber.Value}";
//     }

//     public async UniTask Connect(){
//         await _client.ConnectAsync(false, true, CancellationToken.None);        
//     }

//     public async UniTask Disconnect(){
//         if (_client.IsConnected)
//         {
//             await _client.CloseAsync();
//         }
//     }

    

//     /// <summary>
//     /// On transfer button clicked.
//     /// </summary>
//     private async UniTask Transfer()
//     {        
//         if(! _client.IsConnected)
//             throw new Exception("Client not connected, transfer failed!");

//         var accountAlice = new LocalExt.Model.sp_core.crypto.AccountId32();
//         accountAlice.New())
//         accountAlice.Create(Utils.GetPublicKeyFrom(Alice.Value));

//         var properties = await SystemProperties(CancellationToken.None);
//         var tokenDecimals = BigInteger.Pow(10, properties.TokenDecimals);

//         var accountInfo = await ((LocalExt.SubstrateClientExt)_client).SystemStorage.Account(accountAlice, CancellationToken.None);
//         if (accountInfo == null)
//         {
//             Debug.Log("No account found!");
//         }

//         // logStr += $"Alice account has: {BigInteger.Divide(accountInfo.Data.Free.Value, tokenDecimals)} {properties.TokenSymbol}\n";
//         // _lblNodeInfo.text = logStr;

//         var account32 = new LocalExt.Model.sp_core.crypto.AccountId32();
//         account32.Create(Utils.GetPublicKeyFrom("5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"));

//         var multiAddress = new LocalExt.Model.sp_runtime.multiaddress.EnumMultiAddress();
//         multiAddress.Create(LocalExt.Model.sp_runtime.multiaddress.MultiAddress.Id, account32);

//         var amount = new BaseCom<U128>();
//         amount.Create(BigInteger.Multiply(42, tokenDecimals));
//         // logStr += $"Sending Bob: {amount.Value.Value} {properties.TokenSymbol}\n";
//         // _lblNodeInfo.text = logStr;

//         var transferKeepAlive = LocalExt.Storage.BalancesCalls.TransferKeepAlive(multiAddress, amount);

//         try
//         {
//             var subscription = await GenericExtrinsicAsync(_client, Alice, transferKeepAlive, CancellationToken.None);
//             // Debug.Log($"subscription id => {subscription}");
//         }
//         catch (Exception e)
//         {
//             Debug.LogError(e.Message);
//         }

//     }

//     /// <summary>
//     /// Generic extrinsic method.
//     /// </summary>
//     /// <param name="extrinsicType"></param>
//     /// <param name="extrinsicMethod"></param>
//     /// <param name="concurrentTasks"></param>
//     /// <param name="token"></param>
//     /// <returns></returns>
//     internal async Task<string> GenericExtrinsicAsync(SubstrateClient client, Account account, Method extrinsicMethod, CancellationToken token)
//     {
//         string subscription = await client.Author.SubmitAndWatchExtrinsicAsync(ActionExtrinsicUpdate, extrinsicMethod, account, ChargeTransactionPayment.Default(), 64, token);

//         if (subscription == null)
//         {
//             return null;
//         }

//         Debug.Log($"Generic extrinsic sent {extrinsicMethod.ModuleName}_{extrinsicMethod.CallName} with {subscription}");

//         return subscription;
//     }

//     /// <summary>
//     /// Callback for extrinsic updates.
//     /// </summary>
//     /// <param name="subscriptionId"></param>
//     /// <param name="extrinsicUpdate"></param>
//     public void ActionExtrinsicUpdate(string subscriptionId, ExtrinsicStatus extrinsicUpdate)
//     {
//         var broadcast = extrinsicUpdate.Broadcast != null ? string.Join(",", extrinsicUpdate.Broadcast) : "";
//         var hash = extrinsicUpdate.Hash != null ? extrinsicUpdate.Hash.Value : "";

//         Debug.Log($"{subscriptionId} => {extrinsicUpdate.ExtrinsicState} [HASH: {hash}] [BROADCAST: {broadcast}]");

//         // UnityMainThreadDispatcher.Instance().Enqueue(() =>
//         // {
//         //     _lblNodeInfo.text = _lblNodeInfo.text + $"" +
//         //     $"\n{subscriptionId}" +
//         //     $"\n => {extrinsicUpdate.ExtrinsicState} {(hash.Length > 0 ? $"[{hash}]" : "")}{(broadcast.Length > 0 ? $"[{broadcast}]" : "")}";
//         // });
//     }
// }
