﻿using PlutoWallet.Constants;

namespace PlutoWallet.Components.Xcm
{
    public class XcmNetworkSelectInfo
    {
        public EndpointEnum EndpointKey { get; set; }
        public bool ShowName { get; set; }
        public string Name { get; set; }
        public string Icon { get; set; }
        public string DarkIcon { get; set; }
        public bool IsSelected { get; set; }
        public EndpointConnectionStatus EndpointConnectionStatus { get; set; }
        public ParachainId ParachainId { get; set; }
    }

    public enum EndpointConnectionStatus
    {
        None, // This is the ViewModel bug in .net MAUI, it has to be here
        Loading,
        Connected,
        Failed,
    }
}

