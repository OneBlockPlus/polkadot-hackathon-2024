using System.Drawing;
using System.Linq.Expressions;
using System.Text;
using Android.Views;
using System.Linq;
using Android.Widget;
using Android.App;
using Android.OS;
using Newtonsoft.Json;
using Android.Content;
using Android.Nfc;
using Android.Nfc.Tech;
using Android.Print;
using AndroidX.Annotations;
using AndroidX.RecyclerView.Widget;
using Square.Picasso;
using Xamarin.Essentials;
using Color = Android.Graphics.Color;

namespace FigoApp
{
    [Activity(Label = "Main", Theme = "@style/Theme.AppCompat.Light.NoActionBar")]
    public class MainActivity : Activity
    {   
        Button showPopupButton;
        ImageView playButton;
        ImageView homeButton;
        Dialog overlayDialog;
        Dialog nfcDialog;
        NfcAdapter nfcAdapter;
        PendingIntent pendingIntent;
        IntentFilter[] intentFiltersArray;
        private MongoDbHelper dbHelper;
        string name;
        string serialNumber;
        string walletAddress;   // Added variable to store wallet address
        int coinBalance;        // Added variable to store coin balance

        private enum ActivityState
        {
            Home,
            Play,
            Store,
        }

        private ActivityState currentState;

        protected override async void OnCreate(Bundle? savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.activity_main);
            
            currentState = ActivityState.Home;
            
            name = Intent.GetStringExtra("Name");
            serialNumber = Intent.GetStringExtra("SerialNumber");

            dbHelper = new MongoDbHelper();
            dbHelper.SelectAccountsDatabase_Collection();
            
            // Initialize the NFC Adapter
            nfcAdapter = NfcAdapter.GetDefaultAdapter(this);
    
            // Set up a PendingIntent so the NFC events get delivered to your activity
            pendingIntent = PendingIntent.GetActivity(this, 0, new Intent(this, typeof(MainActivity)).AddFlags(ActivityFlags.SingleTop), 0);
    
            // Set up an intent filter for NDEF discovery
            IntentFilter ndefFilter = new IntentFilter(NfcAdapter.ActionNdefDiscovered);
            ndefFilter.AddCategory(Intent.CategoryDefault);
            IntentFilter[] intentFiltersArray = new IntentFilter[] { ndefFilter };
            
            // Check if the account exists
            Account existingAccount = dbHelper.GetAccountByUid(serialNumber);

            if (existingAccount == null)
            {
                dbHelper.AddAccount(serialNumber, "jgfdhkjgfdhgkfj8");

                walletAddress = "jgfdhkjgfdhgkfj8"; // Store the wallet address
                
                var wallet_addr = FindViewById<TextView>(Resource.Id.wallet_address_text);
                if (wallet_addr != null)
                {
                    wallet_addr.Text = walletAddress;
                }
    
                // Show Toast message for account creation
                Toast.MakeText(this, "New account created and added to the database.", ToastLength.Long).Show();

                var account = dbHelper.GetAccountByUid(serialNumber);
                var coinBal = FindViewById<TextView>(Resource.Id.coin_balance);

                if (account != null)
                {
                    // Store and display coin balance
                    coinBalance = account.CoinBalance;
                    if (coinBal != null)
                    {
                        coinBal.Text = coinBalance.ToString();
                    }
                }
                else
                {
                    // Account not found, return 0 or some default value
                    Toast.MakeText(this, "Account not found for serial number: " + serialNumber, ToastLength.Long).Show();
                }
            }
            else
            {
                walletAddress = "jgfdhkjgfdhgkfj8"; // Store the wallet address

                var wallet_addr = FindViewById<TextView>(Resource.Id.wallet_address_text);
                if (wallet_addr != null)
                {
                    wallet_addr.Text = walletAddress;
                }

                var account = dbHelper.GetAccountByUid(serialNumber);
                var coinBal = FindViewById<TextView>(Resource.Id.coin_balance);

                if (account != null)
                {
                    // Store and display coin balance
                    coinBalance = account.CoinBalance;
                    if (coinBal != null)
                    {
                        coinBal.Text = coinBalance.ToString();
                    }
                }
                else
                {
                    // Account not found, return 0 or some default value
                    Toast.MakeText(this, "Account not found for serial number: " + serialNumber, ToastLength.Long).Show();
                }

            }
            
            UpdateEquippedPlaceholders(serialNumber);
            
            // Try to retrieve the private key from SecureStorage
            string privateKey = await SecureStorage.GetAsync("private_key_alias");

            if (string.IsNullOrEmpty(privateKey))
            {
                // Private key is missing
                Toast.MakeText(this, "Private key is missing", ToastLength.Short).Show();
            }
            else
            {
                // Show the private key in a toast
                Toast.MakeText(this, $"Private key: {privateKey}", ToastLength.Long).Show();
            }
            // Initialize UI with current state
            InitializeUI(currentState);
        }
        
        private void UpdateEquippedPlaceholders(string serialNumber)
{
    // Get the placeholders from activity_main
    ImageView weaponPlaceholder = FindViewById<ImageView>(Resource.Id.weapon_image_placeholder);
    ImageView equipmentPlaceholder = FindViewById<ImageView>(Resource.Id.equipment_image_placeholder);
    ImageView footwearPlaceholder = FindViewById<ImageView>(Resource.Id.footwear_image_placeholder);

    // List of gear types to check
    var gearTypes = new[] { "Weapon", "Equipment", "Footwear" };

    foreach (var gearType in gearTypes)
    {

        // Fetch the equipped gear for the current gear type
        var equippedGear = dbHelper.GetEquippedGearBySlot(serialNumber, gearType);

        if (equippedGear != null && equippedGear.UnlockedUrl != null)
        {
            // Load the image into the respective placeholder based on the gear type
            switch (gearType)
            {
                case "Weapon":
                    Picasso.Get().Load(equippedGear.UnlockedUrl).Into(weaponPlaceholder);
                    break;

                case "Equipment":
                    Picasso.Get().Load(equippedGear.UnlockedUrl).Into(equipmentPlaceholder);
                    break;

                case "Footwear":
                    Picasso.Get().Load(equippedGear.UnlockedUrl).Into(footwearPlaceholder);
                    break;
            }
        }
        else
        {
            // Clear the placeholder if no gear is equipped
            switch (gearType)
            {
                case "Weapon":
                    weaponPlaceholder.SetImageResource(Android.Resource.Color.Transparent);
                    break;

                case "Equipment":
                    equipmentPlaceholder.SetImageResource(Android.Resource.Color.Transparent);
                    break;

                case "Footwear":
                    footwearPlaceholder.SetImageResource(Android.Resource.Color.Transparent);
                    break;
            }
        }
    }
}
       
        
        private void InitializeUI(ActivityState currentState)
        {
            // Find views and ensure they're not null before using them
            var storeButton = FindViewById<ImageView>(Resource.Id.icon_store);
            playButton = FindViewById<ImageView>(Resource.Id.icon_play);
            homeButton = FindViewById<ImageView>(Resource.Id.icon_home);
            var homeIndicator = FindViewById<View>(Resource.Id.home_indicator);
            var playIndicator = FindViewById<View>(Resource.Id.play_indicator);
            var storeIndicator = FindViewById<View>(Resource.Id.store_indicator);
            var weaponButton = FindViewById<Button>(Resource.Id.weapon_button);
            var equipmentButton = FindViewById<Button>(Resource.Id.equipment_button);
            var footwearButton = FindViewById<Button>(Resource.Id.footwear_button);
            
            beamsViewer(name);
            
            // Restore wallet address and coin balance
            RestoreAccountInfo();

            // Button click event logic for UI elements
            if (weaponButton != null)
            {
                weaponButton.Click += (s, e) => 
                {
                    ShowGearPopup("Weapon");
                };
            }

            if (equipmentButton != null)
            {
                equipmentButton.Click += (s, e) => ShowGearPopup("Equipment");
            }

            if (footwearButton != null)
            {
                footwearButton.Click += (s, e) => ShowGearPopup("Footwear");
            }

            if (storeButton != null)
            {
                storeButton.Click += (s, e) => SwitchToStoreLayout();
            }

            if (playButton != null)
            {
                playButton.Click += (s, e) => SwitchToPlayLayout();
            }

            if (homeButton != null)
            {
                homeButton.Click += (s, e) => SwitchToHomeLayout();
            }

            // Handle state changes
            switch (currentState)
            {
                case ActivityState.Home:
                    if (homeIndicator != null)
                    {
                        homeIndicator.Visibility = ViewStates.Visible;
                    }

                    if (homeButton != null)
                    {
                        homeButton.SetColorFilter(Color.ParseColor("#ffe2195E"));
                    }
                    break;

                case ActivityState.Play:
                    if (playButton != null && playIndicator != null)
                    {
                        playIndicator.Visibility = ViewStates.Visible;
                        playButton.SetColorFilter(Color.ParseColor("#ffe2195E"));
                    }
                    break;
                
                case ActivityState.Store:
                    if (storeButton != null && storeIndicator != null)
                    {
                        storeIndicator.Visibility = ViewStates.Visible;
                        storeButton.SetColorFilter(Color.ParseColor("#ffe2195E"));
                    }
                    break;
            }
        }

        private void RestoreAccountInfo()
        {
            // Restore the wallet address
            var wallet_addr = FindViewById<TextView>(Resource.Id.wallet_address_text);
            if (wallet_addr != null && !string.IsNullOrEmpty(walletAddress))
            {
                wallet_addr.Text = walletAddress;
            }

            // Restore the coin balance
            var coinBal = FindViewById<TextView>(Resource.Id.coin_balance);
            if (coinBal != null)
            {
                coinBal.Text = coinBalance.ToString();
            }
        }
        
        private void beamsViewer(string name)
        {
            var beamsViewerImg = FindViewById<ImageView>(Resource.Id.beams_owned_image);
            
            Dictionary<string, int> beamsImageDict = new Dictionary<string, int>()
            {
                {"Tetris", Resource.Drawable.tetris_box },
                {"Garfield", Resource.Drawable.garfield_box },
                {"Gary", Resource.Drawable.gary_box },
                {"Ted2", Resource.Drawable.ted2_box },
                {"Peach", Resource.Drawable.peach_box},
                {"Grafitti", Resource.Drawable.graffiti_box},
                // Add other beams as needed
            };
            
            // Check if the name exists in the dictionary
            if (beamsViewerImg != null && beamsImageDict.TryGetValue(name, out int imageResource))
            {
                // Set the image resource to the ImageView
                beamsViewerImg.SetImageResource(imageResource);
            }
        }
        
       
        private void ShowGearPopup(string gearSlot)
        {
            dbHelper = new MongoDbHelper();

            // Query MongoDB for all account data by gear slot
            var accountDataList = dbHelper.GetAccountDataBySlot(serialNumber, gearSlot);
    
            if (accountDataList == null || !accountDataList.Any())
            {
                Toast.MakeText(this, "No data found for this gear slot.", ToastLength.Short).Show();
                return;  // Exit method if no data is found
            }

            // Loop through all gear entries in the list
            foreach (var accountData in accountDataList)
            {
                // Check if the current gear is equipped
                if (dbHelper.IsGearEquipped(accountData.Id, accountData.GearType))
                {
                    // Handle case for equipped gear
                    ShowUnequipPopup(accountData);
                    return;  // Exit after handling the equipped gear
                }
            }

            // If no gear is equipped, show the gear equip popup for the specified gear slot
            ShowEquipPopup(gearSlot);
        }

        
                  
// Method to show the gear equip popup
private void ShowEquipPopup(string gearSlot)
{
    // Create the dialog
    overlayDialog = new Dialog(this, Resource.Style.CustomOverlayDialog);
    overlayDialog.SetContentView(Resource.Layout.gears_option_popup);

    // Access the RecyclerView in the popup layout
    RecyclerView recyclerView = overlayDialog.FindViewById<RecyclerView>(Resource.Id.gears_option_recycler_view);

    // Set up layout manager
    recyclerView.SetLayoutManager(new GridLayoutManager(this, 2));

    // Fetch the account data (filtered by the current gear slot) from MongoDB
    var accountDataList = dbHelper.GetUnlockedGearsBySlot(serialNumber, gearSlot);

    AccountDataAdapter adapter = new AccountDataAdapter(accountDataList, (selectedGear) =>
    {
        // Dismiss the dialog or provide feedback
        overlayDialog.Dismiss();
    });
    recyclerView.SetAdapter(adapter);

    Button equipButton = overlayDialog.FindViewById<Button>(Resource.Id.equip_button_gears_option);
    equipButton.Click += (s, e) =>
    {
        ShowOverlayPopup();
        // Ensure the selected gear is equipped (if any)
        var selectedGear = accountDataList.FirstOrDefault(g => g.GearId == adapter.SelectedGearId);

        if (selectedGear != null)
        {  
            dbHelper.EquipGear(serialNumber, selectedGear.GearId); // Set equipped_status to true
            overlayDialog.Dismiss();

            // Get the placeholders from activity_main
            ImageView weaponPlaceholder = FindViewById<ImageView>(Resource.Id.weapon_image_placeholder);
            ImageView equipmentPlaceholder = FindViewById<ImageView>(Resource.Id.equipment_image_placeholder);
            ImageView footwearPlaceholder = FindViewById<ImageView>(Resource.Id.footwear_image_placeholder);

            // Switch based on gearSlot to update the appropriate placeholder with the unlocked_url
            switch (gearSlot)
            {
                case "Weapon":
                    if (!string.IsNullOrEmpty(selectedGear.UnlockedUrl))
                    {
                        Picasso.Get().Load(selectedGear.UnlockedUrl).Into(weaponPlaceholder);
                    }
                    break;

                case "Equipment":
                    if (!string.IsNullOrEmpty(selectedGear.UnlockedUrl))
                    {
                        Picasso.Get().Load(selectedGear.UnlockedUrl).Into(equipmentPlaceholder);
                    }

                    break;

                case "Footwear":
                    if (!string.IsNullOrEmpty(selectedGear.UnlockedUrl))
                    {
                        Picasso.Get().Load(selectedGear.UnlockedUrl).Into(footwearPlaceholder);
                    }
                    break;
            }
        }
        else
        {
            Toast.MakeText(this, "No gear selected!", ToastLength.Short).Show();
        }

    };

    overlayDialog.Show();
}

// Method to show the unequip dialog
private void ShowUnequipPopup(AccountData equippedGear)
{
    // Create the dialog
    overlayDialog = new Dialog(this, Resource.Style.CustomOverlayDialog);
    overlayDialog.SetContentView(Resource.Layout.gears_option_unequip_popup);

    // Access UI elements if necessary, e.g., unequip button
    Button unequipButton = overlayDialog.FindViewById<Button>(Resource.Id.unequip_button);
    unequipButton.Click += (s, e) =>
    {
        ShowOverlayPopup();
        // Update MongoDB to set equipped_status to false
        dbHelper.UnequipGear(serialNumber, equippedGear.GearId);

        // Dismiss the dialog after unequipping
        overlayDialog.Dismiss();
        
        // Get the placeholders from activity_main
        ImageView weaponPlaceholder = FindViewById<ImageView>(Resource.Id.weapon_image_placeholder);
        ImageView equipmentPlaceholder = FindViewById<ImageView>(Resource.Id.equipment_image_placeholder);
        ImageView footwearPlaceholder = FindViewById<ImageView>(Resource.Id.footwear_image_placeholder);

        // Switch based on gearSlot to update the appropriate placeholder with the unlocked_url
        switch (equippedGear.GearType)
        {
            case "Weapon":
                weaponPlaceholder.SetImageResource(Android.Resource.Color.Transparent);
                break;

            case "Equipment":
                equipmentPlaceholder.SetImageResource(Android.Resource.Color.Transparent);

                break;

            case "Footwear":
                    footwearPlaceholder.SetImageResource(Android.Resource.Color.Transparent);
                break;
        }
        

    };

    overlayDialog.Show();
}


        private void SwitchToPlayLayout()
        {
            // Create an intent to start StoreActivity
            Intent storeIntent = new Intent(this, typeof(PlayActivity));
            StartActivity(storeIntent);

            InitializeUI(currentState);
        }

        private void SwitchToStoreLayout()
        {
            currentState = ActivityState.Store;

            // Create an intent to start StoreActivity
            Intent storeIntent = new Intent(this, typeof(StoreActivity));
            StartActivity(storeIntent);

            // Initialize UI for the current state, if necessary
            InitializeUI(currentState);
        }


        private void SwitchToHomeLayout()
        {
            currentState = ActivityState.Home;
            SetContentView(Resource.Layout.activity_main);

            // Reinitialize the UI and restore wallet/coin data
            InitializeUI(currentState);
        }
        
        
        protected override void OnNewIntent(Intent intent)
        {
            base.OnNewIntent(intent);
    
            if (NfcAdapter.ActionNdefDiscovered.Equals(intent.Action))
            { 
                // Retrieve the tag from the intent
                var tag = intent.GetParcelableExtra(NfcAdapter.ExtraTag) as Tag;
        
                if (tag != null)
                {
                    byte[] tagIdBytes = tag.GetId();
                    string serialNumber = BitConverter.ToString(tagIdBytes).Replace("-", ""); // Converts byte[] to hex string, removes colons
            
                    // Process the NDEF data
                    Ndef ndef = Ndef.Get(tag);
                    if (ndef != null)
                    {
                        ReadNdefMessage(ndef, serialNumber);
                    }
                }
            }
        }
        
        private async void ReadNdefMessage(Ndef ndef, String serialNumber)
        {
            try
            {
                ndef.Connect();
                NdefMessage ndefMessage = ndef.NdefMessage;

                if (ndefMessage != null)
                {
                    foreach (NdefRecord record in ndefMessage.GetRecords())
                    {
                        byte[] payloadBytes = record.GetPayload();
                        if (payloadBytes.Length > 3)
                        {
                            byte[] urlBytes = payloadBytes.Skip(3).ToArray();
                            string jsonUrl = Encoding.UTF8.GetString(urlBytes);

                            string jsonString = await FetchJsonFromUrl(jsonUrl);

                            var jsonObject = JsonConvert.DeserializeObject<dynamic>(jsonString);
                            string name = jsonObject.name;
                            
                            if (dbHelper.GetEquippedGearBySlot(serialNumber, "Weapon") != null ||
                                dbHelper.GetEquippedGearBySlot(serialNumber, "Equipment") != null ||
                                dbHelper.GetEquippedGearBySlot(serialNumber, "Footwear") != null)
                            {
                                // If any of the gear is equipped, show a toast that says "Gear equipped!"
                                Toast.MakeText(this, "Gear equipped!", ToastLength.Short).Show();
                            }
                            else
                            {
                                // If none of the gear is equipped, show a toast that says "Gear unequipped!"
                                Toast.MakeText(this, "Gear unequipped!", ToastLength.Short).Show();
                            }

                            nfcDialog.Dismiss();

                        }
                    }
                }
                ndef.Close();
            }
            catch (Exception ex)
            {
                Toast.MakeText(this, "Error reading NFC Tag: " + ex.Message, ToastLength.Long).Show();
            }
        }


    private async Task<string> FetchJsonFromUrl(string url)
    {
    try
    {
        using (HttpClient client = new HttpClient())
        {
            // Fetch the JSON content from the URL
            HttpResponseMessage response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
    }
    catch (Exception ex)
    {
        // Handle HTTP or network errors
        Toast.MakeText(this, "Error fetching JSON: " + ex.Message, ToastLength.Long).Show();
        return string.Empty;
    }
    }


        protected override void OnResume()
        {
            base.OnResume();
            if (nfcAdapter != null)
            {
                nfcAdapter.EnableForegroundDispatch(this, pendingIntent, intentFiltersArray, null);
            }
        }

        protected override void OnPause()
        {
            base.OnPause();
            if (nfcAdapter != null)
            {
                nfcAdapter.DisableForegroundDispatch(this);
            }
        }


        private void ShowOverlayPopup()
        {
        nfcDialog = new Dialog(this, Resource.Style.CustomOverlayDialog);
        nfcDialog.SetContentView(Resource.Layout.nfc_popup);
        nfcDialog.Window.SetBackgroundDrawable(new Android.Graphics.Drawables.ColorDrawable(Android.Graphics.Color.Transparent));
        
        // Initialize NFC Adapter inside the popup method
        nfcAdapter = NfcAdapter.GetDefaultAdapter(this);

        // Button to dismiss the popup
        Button cancelButton = nfcDialog.FindViewById<Button>(Resource.Id.cancel_button);
        cancelButton.Click += (s, e) => nfcDialog.Dismiss();

        nfcDialog.Show();
        }

        public override void OnBackPressed()
        {
            if (currentState == ActivityState.Play)
            {
                SwitchToHomeLayout();
            }
            else
            {
                base.OnBackPressed();
            }
        }
    }
}
