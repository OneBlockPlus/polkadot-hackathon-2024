﻿using Markdig;
using PlutoWallet.Constants;
using PlutoWallet.Model;
using PlutoWallet.ViewModel;
using PlutoWallet.View;
using System.Numerics;
using static PlutoWallet.Model.NftsStorageModel;

namespace PlutoWallet.Components.Nft;

public partial class NftThumbnailView : ContentView
{
    public static readonly BindableProperty NameProperty = BindableProperty.Create(
        nameof(Name), typeof(string), typeof(NftThumbnailView),
        defaultBindingMode: BindingMode.TwoWay,
        propertyChanging: (bindable, oldValue, newValue) => {
            var control = (NftThumbnailView)bindable;

            control.nameLabelText.Text = (string)newValue;
        });

    public static readonly BindableProperty FavouriteProperty = BindableProperty.Create(
        nameof(Favourite), typeof(bool), typeof(NftThumbnailView),
        defaultBindingMode: BindingMode.TwoWay,
        propertyChanging: (bindable, oldValue, newValue) =>
        {
            var control = (NftThumbnailView)bindable;

            control.filledFavouriteIcon.IsVisible = (bool)newValue;
        });

    public static readonly BindableProperty DescriptionProperty = BindableProperty.Create(
        nameof(Description), typeof(string), typeof(NftThumbnailView),
        defaultBindingMode: BindingMode.TwoWay,
        propertyChanging: (bindable, oldValue, newValue) => {
            var control = (NftThumbnailView)bindable;

            control.descriptionLabel.Text = Markdown.ToHtml((string)newValue);
        });

    public static readonly BindableProperty ImageProperty = BindableProperty.Create(
        nameof(Image), typeof(string), typeof(NftThumbnailView),
        defaultBindingMode: BindingMode.TwoWay,
        propertyChanging: (bindable, oldValue, newValue) => {
            var control = (NftThumbnailView)bindable;

            control.image.Source = (string)newValue;
        });

    public static readonly BindableProperty EndpointProperty = BindableProperty.Create(
        nameof(Endpoint), typeof(Endpoint), typeof(NftThumbnailView),
        defaultBindingMode: BindingMode.TwoWay,
        propertyChanging: (bindable, oldValue, newValue) => {
            var control = (NftThumbnailView)bindable;

            control.networkBubble.Name = ((Endpoint)newValue).Name;
            control.networkBubble.EndpointKey = ((Endpoint)newValue).Key;
        });

    public static readonly BindableProperty AttributesProperty = BindableProperty.Create(
        nameof(Attributes), typeof(string[]), typeof(NftThumbnailView),
        defaultBindingMode: BindingMode.TwoWay,
        propertyChanging: (bindable, oldValue, newValue) => {
            // ..
        });

    public static readonly BindableProperty CollectionIdProperty = BindableProperty.Create(
        nameof(CollectionId), typeof(BigInteger), typeof(NftThumbnailView),
        defaultBindingMode: BindingMode.TwoWay,
        propertyChanging: (bindable, oldValue, newValue) => {
            // ..
        });

    public static readonly BindableProperty ItemIdProperty = BindableProperty.Create(
        nameof(ItemId), typeof(BigInteger), typeof(NftThumbnailView),
        defaultBindingMode: BindingMode.TwoWay,
        propertyChanging: (bindable, oldValue, newValue) => {
            // ..
        });

    public NftThumbnailView()
	{
		InitializeComponent();
	}

    public string Name
    {
        get => (string)GetValue(NameProperty);

        set => SetValue(NameProperty, value);
    }

    public bool Favourite
    {
        get => (bool)GetValue(FavouriteProperty);

        set => SetValue(FavouriteProperty, value);
    }

    public string Description
    {
        get => (string)GetValue(DescriptionProperty);

        set => SetValue(DescriptionProperty, value);
    }

    public string Image
    {
        get => (string)GetValue(ImageProperty);

        set => SetValue(ImageProperty, value);
    }

    public Endpoint Endpoint
    {
        get => (Endpoint)GetValue(EndpointProperty);

        set => SetValue(EndpointProperty, value);
    }

    public string[] Attributes
    {
        get => (string[])GetValue(AttributesProperty);

        set => SetValue(AttributesProperty, value);
    }

    public BigInteger CollectionId
    {
        get => (BigInteger)GetValue(CollectionIdProperty);

        set => SetValue(CollectionIdProperty, value);
    }

    public BigInteger ItemId
    {
        get => (BigInteger)GetValue(ItemIdProperty);

        set => SetValue(ItemIdProperty, value);
    }

    private StorageNFT GetStorageNft()
    {
        return new StorageNFT
        {
            Name = this.Name,
            Description = this.Description,
            Image = this.Image,
            EndpointKey = this.Endpoint.Key,
            Attributes = this.Attributes,
            CollectionId = this.CollectionId.ToString(),
            ItemId = this.ItemId.ToString(),
            Favourite = this.Favourite,
        };
    }
    
    void OnFavouriteClicked(System.Object sender, Microsoft.Maui.Controls.TappedEventArgs e)
    {
        Favourite = !Favourite;
        if (Favourite)
        {
            NftsStorageModel.AddFavourite(GetStorageNft());
        }
        else
        {
            NftsStorageModel.RemoveFavourite(GetStorageNft());
        }
    }

    async void OnMoreClicked(System.Object sender, Microsoft.Maui.Controls.TappedEventArgs e)
    {
        var viewModel = new NftDetailViewModel();

        viewModel.Name = this.Name;
        viewModel.Description = this.Description;
        viewModel.Image = this.Image;
        viewModel.Endpoint = this.Endpoint;
        viewModel.Attributes = this.Attributes;
        viewModel.CollectionId = this.CollectionId;
        viewModel.ItemId = this.ItemId;
        viewModel.Favourite = this.Favourite;

        if (this.Endpoint.Name == "Aleph Zero Testnet")
        {
            viewModel.AzeroIdReservedUntil = await Model.AzeroId.AzeroIdModel.GetReservedUntilStringForName(this.Name);
        }

        await Navigation.PushAsync(new NftDetailPage(viewModel));

        // load these details after
        viewModel.KodadotUnlockableUrl = await Model.Kodadot.UnlockablesModel.FetchKeywiseAsync(this.Endpoint, this.CollectionId);
    }
}
