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
using Xamarin.Essentials;

namespace FigoApp
{
    [Activity(Label = "ScanActivity", Theme = "@style/Theme.AppCompat.Light.NoActionBar")]
    public class ScanActivity : Activity
    {
        Button scanButton;
        NfcAdapter nfcAdapter;
        PendingIntent pendingIntent;
        IntentFilter[] intentFiltersArray;
        Dialog overlayDialog;
        MongoDbHelper dbhelper;

        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.activity_scan);

            scanButton = FindViewById<Button>(Resource.Id.scan_button_scpg);

            // Initialize the NFC Adapter
            nfcAdapter = NfcAdapter.GetDefaultAdapter(this);
    
            // Set up a PendingIntent so the NFC events get delivered to your activity
            pendingIntent = PendingIntent.GetActivity(this, 0, new Intent(this, typeof(ScanActivity)).AddFlags(ActivityFlags.SingleTop), 0);
    
            // Set up an intent filter for NDEF discovery
            IntentFilter ndefFilter = new IntentFilter(NfcAdapter.ActionNdefDiscovered);
            ndefFilter.AddCategory(Intent.CategoryDefault);
            IntentFilter[] intentFiltersArray = new IntentFilter[] { ndefFilter };
            
            // Assume you receive the private key from some method
            string privateKey = "34c5d8e43f1f696f1f51487d549e551b03ea5d6027482c667d6e379f488cf432";

            // Save the private key using Xamarin Essentials SecureStorage
            SecureStorage.SetAsync("private_key_alias", privateKey);
            
            // Set the click event for scanButton
            scanButton.Click += (s, e) =>
            {
                ShowOverlayPopup();
            };
            
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
                            
                            Intent intent = new Intent(this, typeof(MainActivity));
                            intent.PutExtra("Name", name);
                            intent.PutExtra("SerialNumber", serialNumber);
                            StartActivity(intent);
                            
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
        overlayDialog = new Dialog(this, Resource.Style.CustomOverlayDialog);
        overlayDialog.SetContentView(Resource.Layout.nfc_popup);
        overlayDialog.Window.SetBackgroundDrawable(new Android.Graphics.Drawables.ColorDrawable(Android.Graphics.Color.Transparent));
        
        // Initialize NFC Adapter inside the popup method
        nfcAdapter = NfcAdapter.GetDefaultAdapter(this);

        // Button to dismiss the popup
        Button cancelButton = overlayDialog.FindViewById<Button>(Resource.Id.cancel_button);
        cancelButton.Click += (s, e) => overlayDialog.Dismiss();

        overlayDialog.Show();
        }
    }
}
