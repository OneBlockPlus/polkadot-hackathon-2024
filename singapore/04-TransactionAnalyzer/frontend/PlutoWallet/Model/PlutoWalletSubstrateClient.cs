﻿using Substrate.NetApi;
using Substrate.NetApi.Model.Extrinsics;
using Substrate.NetApi.Model.Rpc;
using PlutoWallet.Components.Extrinsic;
using PlutoWallet.Constants;
using Substrate.NetApi.Model.Types.Base;
using PlutoWallet.Model.AjunaExt;
using System.Collections.ObjectModel;
using PlutoWallet.Components.NetworkSelect;
using System.Net;
using Substrate.NetApi.Model.Types;

namespace PlutoWallet.Model
{
    public class PlutoWalletSubstrateClient : SubstrateClientExt
    {
        public PlutoWalletSubstrateClient(Endpoint endpoint, Uri fastestWebSocket, Substrate.NetApi.Model.Extrinsics.ChargeType chargeType) :
                base(endpoint, fastestWebSocket, chargeType)
        {

        }

        public void Disconnect()
        {
            SubstrateClient.Dispose();

            // Better dispose this? Ok, later :)

            var multiNetworkSelectViewModel = DependencyService.Get<MultiNetworkSelectViewModel>();

            if (multiNetworkSelectViewModel.NetworkInfoDict.ContainsKey(Endpoint.Key))
            {
                multiNetworkSelectViewModel.NetworkInfoDict.Remove(Endpoint.Key);

                if (multiNetworkSelectViewModel.SelectedKey == Endpoint.Key)
                {
                    var selectedEndpointKey = multiNetworkSelectViewModel.SelectFirst();

                    multiNetworkSelectViewModel.UpdateNetworkInfos();

                    Task change = Model.AjunaClientModel.ChangeChainAsync(selectedEndpointKey);
                }
            }

            multiNetworkSelectViewModel.UpdateNetworkInfos();
        }

        public override async Task<bool> ConnectAndLoadMetadataAsync()
        {
            var multiNetworkSelectViewModel = DependencyService.Get<MultiNetworkSelectViewModel>();

            if (multiNetworkSelectViewModel.NetworkInfoDict.ContainsKey(Endpoint.Key)) {
                multiNetworkSelectViewModel.NetworkInfoDict[Endpoint.Key].EndpointConnectionStatus = EndpointConnectionStatus.Loading;
            }
            else
            {
                multiNetworkSelectViewModel.NetworkInfoDict.Add(Endpoint.Key, new NetworkSelectInfo
                {
                    EndpointKey = Endpoint.Key,
                    ShowName = false,
                    Name = Endpoint.Name,
                    Icon = Endpoint.Icon,
                    DarkIcon = Endpoint.DarkIcon,
                    EndpointConnectionStatus = EndpointConnectionStatus.Loading,
                });

                EndpointsModel.SaveEndpoint(Endpoint.Key, setupMultiNetworkSelect: false);
            }

            multiNetworkSelectViewModel.UpdateNetworkInfos();

            var connected = await base.ConnectAndLoadMetadataAsync();

            multiNetworkSelectViewModel.NetworkInfoDict[Endpoint.Key].EndpointConnectionStatus = connected ? EndpointConnectionStatus.Connected : EndpointConnectionStatus.Failed;

            multiNetworkSelectViewModel.UpdateNetworkInfos();

            return connected;
        }

        /// <summary>
        /// A custom method for submitting extrinsics.
        /// Please prefer using this one.
        /// </summary>
        /// <returns>subscription ID</returns>
        public override async Task<string> SubmitExtrinsicAsync(Method method, Account account, Action<string, ExtrinsicStatus> callback = null, uint lifeTime = 64, CancellationToken token = default)
        {
            ///
            /// This part is temporary fix before the next Substrate.Net.Api version, that would fix the code gen and sign metadata checks
            ///
            #region Temp
            var extrinsic = await GetTempUnCheckedExtrinsicAsync(method, account, lifeTime, token);
            #endregion

            Hash extrinsicHash = new Hash(HashExtension.Blake2(extrinsic.Encode(), 256));
            string extrinsicHashString = Utils.Bytes2HexString(extrinsicHash);

            var (palletName, callName) = Model.PalletCallModel.GetPalletAndCallName(this, extrinsic.Method.ModuleIndex, extrinsic.Method.CallIndex);

            var extrinsicStackViewModel = DependencyService.Get<ExtrinsicStatusStackViewModel>();

            extrinsicStackViewModel.Update();

            extrinsicStackViewModel.Extrinsics.Add(
                extrinsicHashString,
                new ExtrinsicInfo
                {
                    ExtrinsicId = extrinsicHashString,
                    Status = ExtrinsicStatusEnum.Submitting,
                    Endpoint = this.Endpoint,
                    Hash = extrinsicHash,
                    CallName = palletName + " " + callName,
                });

            extrinsicStackViewModel.Update();

#pragma warning disable VSTHRD101 // Avoid unsupported async delegates
            Action<string, ExtrinsicStatus> updateExtrinsicsCallback = async (string id, ExtrinsicStatus status) =>
            {
                if (status.ExtrinsicState == ExtrinsicState.Ready)
                {
                    extrinsicStackViewModel.Extrinsics[extrinsicHashString].Status = ExtrinsicStatusEnum.Pending;
                    extrinsicStackViewModel.Update();
                }
                else if (status.ExtrinsicState == ExtrinsicState.Dropped)
                {
                    extrinsicStackViewModel.Extrinsics[extrinsicHashString].Status = ExtrinsicStatusEnum.Dropped;
                    extrinsicStackViewModel.Update();
                }

                else if (status.ExtrinsicState == ExtrinsicState.InBlock)
                {
                    var extrinsicDetails = await EventsModel.GetExtrinsicEventsAsync(
                         this,
                         status.Hash,
                         extrinsicHash.Encode()
                    );
                    extrinsicStackViewModel.Extrinsics[extrinsicHashString].EventsListViewModel.ExtrinsicEvents = new ObservableCollection<ExtrinsicEvent>(extrinsicDetails.Events);
                    extrinsicStackViewModel.Extrinsics[extrinsicHashString].BlockNumber = extrinsicDetails.BlockNumber;
                    extrinsicStackViewModel.Extrinsics[extrinsicHashString].ExtrinsicIndex = extrinsicDetails.ExtrinsicIndex;

                    var lastEvent = extrinsicDetails.Events.Last();

                    if (lastEvent.PalletName == "System" && lastEvent.EventName == "ExtrinsicSuccess")
                    {
                        extrinsicStackViewModel.Extrinsics[extrinsicHashString].Status = ExtrinsicStatusEnum.InBlockSuccess;
                    }
                    else if (lastEvent.PalletName == "System" && lastEvent.EventName == "ExtrinsicFailed")
                    {
                        extrinsicStackViewModel.Extrinsics[extrinsicHashString].Status = ExtrinsicStatusEnum.InBlockFailed;
                    }
                    else
                    {
                        extrinsicStackViewModel.Extrinsics[extrinsicHashString].Status = ExtrinsicStatusEnum.Unknown;
                    }

                    extrinsicStackViewModel.Update();
                }

                else if (status.ExtrinsicState == ExtrinsicState.Finalized)
                {
                    var lastEvent = extrinsicStackViewModel.Extrinsics[extrinsicHashString].EventsListViewModel.ExtrinsicEvents.Last();

                    if (lastEvent.PalletName == "System" && lastEvent.EventName == "ExtrinsicSuccess")
                    {
                        extrinsicStackViewModel.Extrinsics[extrinsicHashString].Status = ExtrinsicStatusEnum.FinalizedSuccess;
                    }
                    else if (lastEvent.PalletName == "System" && lastEvent.EventName == "ExtrinsicFailed")
                    {
                        extrinsicStackViewModel.Extrinsics[extrinsicHashString].Status = ExtrinsicStatusEnum.FinalizedFailed;
                    }
                    else
                    {
                        extrinsicStackViewModel.Extrinsics[extrinsicHashString].Status = ExtrinsicStatusEnum.Unknown;
                    }

                    extrinsicStackViewModel.Update();
                }

                else
                    Console.WriteLine(status.ExtrinsicState);
            };
#pragma warning restore VSTHRD101 // Avoid unsupported async delegates

            string extrinsicId = await this.SubstrateClient.Author.SubmitAndWatchExtrinsicAsync(callback, Utils.Bytes2HexString(extrinsic.Encode()).ToLower(), token);

            return extrinsicId;
        }
    }
}

