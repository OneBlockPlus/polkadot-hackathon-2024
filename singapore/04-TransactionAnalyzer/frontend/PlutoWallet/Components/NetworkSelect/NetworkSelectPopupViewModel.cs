﻿using System;
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using PlutoWallet.Constants;
using PlutoWallet.Model;

namespace PlutoWallet.Components.NetworkSelect
{
	public partial class NetworkSelectPopupViewModel : ObservableObject, IPopup
    {
		
		private bool isVisible;

		public bool IsVisible
		{
			get => isVisible;
			set
			{
				SetProperty(ref isVisible, value);

				if (!value)
				{
					// Save and change the endpoints
					List<EndpointEnum> keys = new List<EndpointEnum>();

					foreach (NetworkSelectInfo info in Networks)
					{
						if (info.IsSelected)
						{
							keys.Add(info.EndpointKey);
						}
					}

					EndpointsModel.SaveEndpoints(keys);
				}
			}
		}

        [ObservableProperty]
        private ObservableCollection<NetworkSelectInfo> networks = new ObservableCollection<NetworkSelectInfo>();

        public NetworkSelectPopupViewModel()
		{
			isVisible = false;
		}

		public void SetNetworks()
		{
            var endpoints = Endpoints.GetEndpointDictionary;
            var keys = EndpointsModel.GetSelectedEndpointKeys();

			List<NetworkSelectInfo> tempNetworks = new List<NetworkSelectInfo>();

			foreach (EndpointEnum key in endpoints.Keys)
			{
				tempNetworks.Add(new NetworkSelectInfo
				{
					EndpointKey = key,
					Icon = endpoints[key].Icon,
					DarkIcon = endpoints[key].DarkIcon,
                    Name = endpoints[key].Name,
					IsSelected = keys.Contains(key),
					EndpointConnectionStatus = EndpointConnectionStatus.Loading,
				});
			}

			Networks = new ObservableCollection<NetworkSelectInfo>(tempNetworks);

			IsVisible = true;
        }

		public void SelectEndpoint(EndpointEnum key)
		{
			List<NetworkSelectInfo> tempNetworks = new List<NetworkSelectInfo>(Networks);
			List<EndpointEnum> selectedKeys = new List<EndpointEnum>();

			for(int i = 0; i < tempNetworks.Count(); i++)
			{
				if (tempNetworks[i].EndpointKey == key)
				{
                    tempNetworks[i].IsSelected = !tempNetworks[i].IsSelected;
				}

				if (tempNetworks[i].IsSelected)
				{
					selectedKeys.Add(tempNetworks[i].EndpointKey);
				}
			}

			Networks = new ObservableCollection<NetworkSelectInfo>(tempNetworks);
		}
	}
}

