﻿using PlutoWallet.Model;
using System;
using System.Linq;
using Substrate.NetApi;
using Substrate.NetApi.Model.Extrinsics;
using Substrate.NetApi.Model.Meta;
using Substrate.NetApi.Model.Types.Base;
using Substrate.NetApi.Model.Types.Primitive;
using Newtonsoft.Json;
using PlutoWallet.Model.AjunaExt;
using Substrate.NetApi.Generated.Model.sp_core.crypto;
using Substrate.NetApi.Generated.Model.sp_runtime.multiaddress;
using PlutoWallet.Types;
using Substrate.NetApi.Model.Rpc;
using PlutoWallet.Components.Extrinsic;
using Substrate.NetApi.Generated.Model.sp_weights.weight_v2;
using Newtonsoft.Json.Linq;

namespace PlutoWallet.Components.Contract;

public partial class ContractView : ContentView
{
	public ContractView()
	{
		InitializeComponent();

	}

	private async Task Setup()
	{
        var client = await Model.AjunaClientModel.GetMainClientAsync();

        try
        {
            var result = await client.SubstrateClient.InvokeAsync<string>("childstate_getStorage", new object[2] {
                "0x3a6368696c645f73746f726167653a64656661756c743a902a38b8b1a57ba428b384b941199431aac82ebda1ba798cc4d7921c176a9682",
                "0x11d2df4e979aa105cf552e9544ebd2b500000000"
            }, CancellationToken.None);

            Console.WriteLine("Done");
            Console.WriteLine(result);

            var number = new U64();
            number.Create(Utils.HexToByteArray(result));
             
            Console.WriteLine(number.Value);

            valueText.Text = number.Value.ToString();

        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }

    async void OnIncrementClicked(System.Object sender, System.EventArgs e)
    {
        try
        {
            var contractAddress = "5CzQEMFAdLg5tRsbd8cKfVoHtcA9Xqkp9ZjawB4sLTwiSwe1";
            var value = 0;
            ulong refTime = 3912368128;
            ulong proofSize = 131072;


            var accountId = new AccountId32();
            accountId.Create(Utils.GetPublicKeyFrom(contractAddress));

            var dest = new EnumMultiAddress();
            dest.Create(0, accountId);

            var baseComValue = new BaseCom<U128>();
            baseComValue.Create(value);

            var refTimeParam = new BaseCom<U64>();
            refTimeParam.Create(new CompactInteger(refTime));
            var proofSizeParam = new BaseCom<U64>();
            proofSizeParam.Create(new CompactInteger(proofSize));
            var gasLimit = new Substrate.NetApi.Generated.Model.sp_weights.weight_v2.Weight();
            gasLimit.RefTime = refTimeParam;
            gasLimit.ProofSize = proofSizeParam;

            var storageDepositLimitParam = new BaseOpt<BaseCom<U128>>();

            var dataParam = new BaseVec<U8>();
            dataParam.Create(Utils.HexToByteArray("0x12bd51d3").Select(p => {
                var u8 = new U8();
                u8.Create(p);
                return u8;
            }).ToArray());

            System.Collections.Generic.List<byte> byteArray = new List<byte>();
            byteArray.AddRange(dest.Encode());
            byteArray.AddRange(baseComValue.Encode());
            byteArray.AddRange(gasLimit.Encode());
            byteArray.AddRange(storageDepositLimitParam.Encode());
            byteArray.AddRange(dataParam.Encode());

            var client = await Model.AjunaClientModel.GetMainClientAsync();

            var (palletIndex, callIndex) = PalletCallModel.GetPalletAndCallIndex(client, "Contracts", "call");




            Method transfer = new Method(palletIndex, "Contracts", callIndex, "call", byteArray.ToArray());

            var charge = ChargeTransactionPayment.Default();

            if ((await KeysModel.GetAccount()).IsSome(out var account))
            {
                string extrinsicId = await client.SubmitExtrinsicAsync(transfer, account, token: CancellationToken.None);
            }
            else
            {
                // Verification failed, do something about it
            }
        }
        catch(Exception ex)
        {
            Console.WriteLine(ex);
        }
    }

    async void OnReloadClicked(System.Object sender, Microsoft.Maui.Controls.TappedEventArgs e)
    {
        await Setup();
    }
}

