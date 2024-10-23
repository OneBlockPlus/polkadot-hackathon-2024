using Android.App;
using Android.Content;
using Android.Nfc;
using Android.OS;
using Android.Views;
using Android.Widget;
using System;
using Android.Nfc.Tech;
using System.Text;
using System.Linq;
using Newtonsoft.Json;
using System.Net.Http;
using System.Threading.Tasks;
using AndroidX.RecyclerView.Widget;
using Square.Picasso;

namespace FigoApp
{
    [Activity(Label = "StoreActivity", Theme = "@style/Theme.AppCompat.Light.NoActionBar")]
    public class StoreActivity : Activity
    {
        RecyclerView gearRecyclerView;
        GearAdapter gearAdapter;
        List<Gear> gearList;
        MongoDbHelper dbHelper;
        Dialog overlayDialog;

        private EditText searchEditText;
        private ImageButton searchButton;

        NfcAdapter nfcAdapter; 
        PendingIntent pendingIntent;
        IntentFilter[] intentFiltersArray;
        string scannedSerialNumber;

        private bool isDialogOpen = false; // Flag to track if the dialog is open
        private Gear selectedGearForPurchase;

        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.store_page);

            // Initialize the database helper
            dbHelper = new MongoDbHelper();
            dbHelper.SelectGearsDatabase_Collection();

            // Initialize the NFC Adapter
            nfcAdapter = NfcAdapter.GetDefaultAdapter(this);
    
            // Set up a PendingIntent so the NFC events get delivered to your activity
            pendingIntent = PendingIntent.GetActivity(this, 0, new Intent(this, typeof(StoreActivity)).AddFlags(ActivityFlags.SingleTop), 0);
    
            // Set up an intent filter for NDEF discovery
            IntentFilter ndefFilter = new IntentFilter(NfcAdapter.ActionNdefDiscovered);
            ndefFilter.AddCategory(Intent.CategoryDefault);
            IntentFilter[] intentFiltersArray = new IntentFilter[] { ndefFilter };
            
            FindGears(); // Initialize search functionality
            SetupStoreRecyclerView(); // Setup the RecyclerView with available gears
            
            ImageView homeButton = FindViewById<ImageView>(Resource.Id.icon_home);
            homeButton.Click += (s, e) =>
            {
                Intent mainIntent = new Intent(this, typeof(MainActivity));
                StartActivity(mainIntent);
                Finish();  // Call finish to close StoreActivity
            };
            
            ImageView playButton = FindViewById<ImageView>(Resource.Id.icon_play);
            playButton.Click += (s, e) =>
            {
                Intent intent = new Intent(this, typeof(MainActivity));
                intent.PutExtra("ShowPlayPage", true); // Pass flag to load play_page
                StartActivity(intent);
                Finish(); // Close StoreActivity
            };
            

        }

        public void FindGears()
        {
            searchEditText = FindViewById<EditText>(Resource.Id.search_bar);
            searchButton = FindViewById<ImageButton>(Resource.Id.search_button);

            searchButton.Click += (s, e) => OnSearchButtonClicked(searchEditText.Text);
        }

        private void OnSearchButtonClicked(string searchText)
        {
            List<Gear> foundGearList = dbHelper.FindGearsByName(searchText);

            gearRecyclerView = FindViewById<RecyclerView>(Resource.Id.nft_recycler_view);
            gearRecyclerView.SetLayoutManager(new GridLayoutManager(this, 2));

            gearAdapter = new GearAdapter(foundGearList, (position) =>
            {
                Gear selectedGear = foundGearList[position];
                ShowPopup(selectedGear);
            });

            gearRecyclerView.SetAdapter(gearAdapter);

            if (foundGearList == null || foundGearList.Count == 0)
            {
                Toast.MakeText(this, "No results found", ToastLength.Short).Show();
            }
        }

        public void SetupStoreRecyclerView()
        {
            gearList = dbHelper.GetAllGears();
            gearRecyclerView = FindViewById<RecyclerView>(Resource.Id.nft_recycler_view);
            gearRecyclerView.SetLayoutManager(new GridLayoutManager(this, 2));

            gearAdapter = new GearAdapter(gearList, (position) =>
            {
                Gear selectedGear = gearList[position];
                selectedGearForPurchase = selectedGear; 
                ShowPopup(selectedGear);
            });

            gearRecyclerView.SetAdapter(gearAdapter);
        }

        private void ShowPopup(Gear gear)
        {
            if (gear == null) 
            {
                Toast.MakeText(this, "Gear data not found", ToastLength.Short).Show();
                return;
            }

            overlayDialog = new Dialog(this, Resource.Style.CustomOverlayDialog);
            overlayDialog.SetContentView(Resource.Layout.gears_metadata_popup);
            overlayDialog.Window.SetBackgroundDrawable(new Android.Graphics.Drawables.ColorDrawable(Android.Graphics.Color.Transparent));

            TextView priceTextView = overlayDialog.FindViewById<TextView>(Resource.Id.gears_price);
            TextView descriptionTextView = overlayDialog.FindViewById<TextView>(Resource.Id.gears_description);
            TextView gearSlot = overlayDialog.FindViewById<TextView>(Resource.Id.gears_slot);
            ImageView image = overlayDialog.FindViewById<ImageView>(Resource.Id.gears_image);

            priceTextView.Text = gear.Price;
            descriptionTextView.Text = gear.Description;
            gearSlot.Text = gear.Slot;

            Picasso.Get().Load(gear.imageUrl).Into(image);
            
            nfcAdapter = NfcAdapter.GetDefaultAdapter(overlayDialog.Context);
            
            Button buyButton = overlayDialog.FindViewById<Button>(Resource.Id.mint_now);
            buyButton.Click += (sender, args) =>
            {
                if (gear != null)
                {
                    // Pass the gear details for purchase
                    ShowOverlayPopup(gear);
                }
                else
                {
                    Toast.MakeText(this, "Unable to proceed with purchase", ToastLength.Short).Show();
                }
            };

            overlayDialog.Show();

            Button closeButton = overlayDialog.FindViewById<Button>(Resource.Id.close_button_metadata);
            closeButton.Click += (sender, args) => OverlayDialogDismissed();
        }

        private void OverlayDialogDismissed()
        {
            overlayDialog.Dismiss();
            isDialogOpen = false; // Reset the flag when the dialog is dismissed
        }

        private void ShowOverlayPopup(Gear gear)
        {
            overlayDialog = new Dialog(this, Resource.Style.CustomOverlayDialog);
            overlayDialog.SetContentView(Resource.Layout.nfc_popup);
            overlayDialog.Window.SetBackgroundDrawable(new Android.Graphics.Drawables.ColorDrawable(Android.Graphics.Color.Transparent));
            
            nfcAdapter = NfcAdapter.GetDefaultAdapter(overlayDialog.Context);

            // Optionally, display a message to the user
            Toast.MakeText(this, "Scan your NFC tag now!", ToastLength.Short).Show();

            overlayDialog.Show();
            isDialogOpen = true; // Set flag to true when the dialog is open

            // Start NFC scanning when the overlay is shown
            nfcAdapter.EnableForegroundDispatch(this, pendingIntent, intentFiltersArray, null);
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

        private async void ReadNdefMessage(Ndef ndef, string serialNumber)
        {
                    try
{
    ndef.Connect();
    NdefMessage ndefMessage = ndef.NdefMessage;

    if (ndefMessage == null)
    {
        Toast.MakeText(this, "NDEF message is null.", ToastLength.Long).Show();
        return; // Exit if ndefMessage is null
    }

    foreach (NdefRecord record in ndefMessage.GetRecords())
    {
        if (record == null)
        {
            Toast.MakeText(this, "NDEF record is null.", ToastLength.Long).Show();
            continue; // Skip null records
        }

        byte[] payloadBytes = record.GetPayload();
        if (payloadBytes == null || payloadBytes.Length <= 3)
        {
            Toast.MakeText(this, "Payload is null or too short.", ToastLength.Long).Show();
            continue; // Skip if payload is null or too short
        }

        // Process the payload
        byte[] urlBytes = payloadBytes.Skip(3).ToArray();
        string jsonUrl = Encoding.UTF8.GetString(urlBytes);

        if (string.IsNullOrEmpty(jsonUrl))
        {
            Toast.MakeText(this, "URL is empty after processing payload.", ToastLength.Long).Show();
            continue; // Skip if URL is empty
        }

        // Fetch JSON from URL
        string jsonString = await FetchJsonFromUrl(jsonUrl);
        if (string.IsNullOrEmpty(jsonString))
        {
            Toast.MakeText(this, "Fetched JSON is null or empty.", ToastLength.Long).Show();
            continue; // Skip if JSON string is null or empty
        }

        // Deserialize the JSON
        var jsonObject = JsonConvert.DeserializeObject<dynamic>(jsonString);
        if (jsonObject == null || jsonObject.name == null)
        {
            Toast.MakeText(this, "JSON object or name is null.", ToastLength.Long).Show();
            continue; // Skip if JSON object or name is null
        }

        string name = jsonObject.name;

        // Validate selected gear before purchasing
        if (selectedGearForPurchase == null)
        {
            Toast.MakeText(this, "No gear selected for purchase.", ToastLength.Long).Show();
            return; // Exit if no gear is selected
        }

        // Pass both serialNumber and the selected gear to BuyGear
        dbHelper.BuyGear(serialNumber, selectedGearForPurchase);
        Toast.MakeText(this, $"Successfully bought: {selectedGearForPurchase.Name}", ToastLength.Short).Show();
    }
}
catch (Exception ex)
{
    Toast.MakeText(this, "Error reading NFC Tag: " + ex.Message, ToastLength.Long).Show();
}
finally
{
    ndef.Close();
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

            // Reset the dialog open flag when the activity is paused
            isDialogOpen = false; 
        }
    }
}
