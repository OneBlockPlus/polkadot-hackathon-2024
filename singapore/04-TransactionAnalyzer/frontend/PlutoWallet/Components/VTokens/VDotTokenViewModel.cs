﻿using System;
using System.Numerics;
using Bifrost.NetApi.Generated;
using CommunityToolkit.Mvvm.ComponentModel;
using PlutoWallet.Model;
using PlutoWallet.Types;

namespace PlutoWallet.Components.VTokens
{
    public partial class VDotTokenViewModel : ObservableObject
    {
        [ObservableProperty]
        private string conversion;

        [ObservableProperty]
        private string from;

        public VDotTokenViewModel()
        {
            conversion = "Loading";

            from = "";
        }

        public async Task GetConversionRate(SubstrateClientExt client, CancellationToken token)
        {
            if (client is null)
            {
                Conversion = "Failed";
            }

            Conversion = "Loading";

            From = "";

            var vdots = Model.AssetsModel.GetAssetsWithSymbol("vDOT").ToList();

            if (!vdots.Any())
            {
                Conversion = "None";

                return;
            }

            BigInteger vDotsSum = 0;
            foreach (Asset vdot in vdots)
            {
                vDotsSum += (BigInteger)(vdot.Amount * Math.Pow(10, vdot.Decimals));
            }

            BigInteger dotsEquivalent = await VTokenModel.VDotToDot(client, vDotsSum, token);

            Conversion = String.Format("{0:0.00}", (double)dotsEquivalent / Math.Pow(10, vdots[0].Decimals)) + " DOT";

            BigInteger singleVDot = (BigInteger)Math.Pow(10, vdots[0].Decimals);

            BigInteger dotsEquivalentSingle = await VTokenModel.VDotToDot(client, singleVDot, token);

            From = "From " + String.Format("{0:0.00}", (double)vDotsSum / Math.Pow(10, vdots[0].Decimals)) + " vDOT";
        }
    }
}

