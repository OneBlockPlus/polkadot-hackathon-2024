using Android.App;
using Android.OS;
using Android.Widget;
using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Timers;
using Android.Content;
using Android.Nfc;
using Android.Nfc.Tech;
using Tag = Android.Nfc.Tag;
using Newtonsoft.Json;
using System.Text;

namespace FigoApp
{
    [Activity(Label = "PlayActivity")]
    public class PlayActivity : Activity
    {
        MongoDbHelper dbHelper;
        private string roomCode;
        string serialNumber;
        private int clickCount = 0;
        private System.Timers.Timer _timer;
        private int timerCountdown = 20;
        NfcAdapter nfcAdapter;
        PendingIntent pendingIntent;
        IntentFilter[] intentFiltersArray;
        Dialog overlayDialog;
        private int playerCount = 0;

        // UI elements
        private Button createRoomButton, joinRoomButton, voteButton, backToMenuButton;
        private TextView timerTextView, roomCodeTextView, playersListTextView, winnerTextView;
        private LinearLayout createJoinLayout, waitingLayout, clickerGameLayout, leaderboardLayout;
        private ImageView player1ImageView, player2ImageView, player3ImageView, player4ImageView;
        private string[] playerNames = new string[4];

        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.activity_play);
            
            dbHelper = new MongoDbHelper();
            dbHelper.SelectRoomDatabase_Collection();
            
            // Initialize the NFC Adapter
            nfcAdapter = NfcAdapter.GetDefaultAdapter(this);
            pendingIntent = PendingIntent.GetActivity(
                this, 0, new Intent(this, typeof(PlayActivity)).AddFlags(ActivityFlags.ClearTop | ActivityFlags.SingleTop), PendingIntentFlags.UpdateCurrent);
            IntentFilter tagFilter = new IntentFilter(NfcAdapter.ActionTagDiscovered);
            intentFiltersArray = new IntentFilter[] { tagFilter };

            // Get UI elements
            CreateUiElements();

            // Button click events
            createRoomButton.Click += CreateRoom;
            joinRoomButton.Click += JoinRoom;
            backToMenuButton.Click += (s, e) => RestartGame();

            // Initialize timer
            _timer = new System.Timers.Timer(1000); // Timer with 1-second intervals
            _timer.Elapsed += OnGameTimerElapsed;
        }

        private void CreateUiElements()
        {
            createRoomButton = FindViewById<Button>(Resource.Id.createRoomButton);
            joinRoomButton = FindViewById<Button>(Resource.Id.joinRoomButton);
            voteButton = FindViewById<Button>(Resource.Id.voteButton);
            backToMenuButton = FindViewById<Button>(Resource.Id.backToMenuButton);
            timerTextView = FindViewById<TextView>(Resource.Id.timerTextView);
            roomCodeTextView = FindViewById<TextView>(Resource.Id.roomCodeTextView);
            playersListTextView = FindViewById<TextView>(Resource.Id.playersListTextView);
            winnerTextView = FindViewById<TextView>(Resource.Id.winnerTextView);
            player1ImageView = FindViewById<ImageView>(Resource.Id.player1ImageView);
            player2ImageView = FindViewById<ImageView>(Resource.Id.player2ImageView);
            player3ImageView = FindViewById<ImageView>(Resource.Id.player3ImageView);
            player4ImageView = FindViewById<ImageView>(Resource.Id.player4ImageView);
            createJoinLayout = FindViewById<LinearLayout>(Resource.Id.createJoinLayout);
            waitingLayout = FindViewById<LinearLayout>(Resource.Id.waitingLayout);
            clickerGameLayout = FindViewById<LinearLayout>(Resource.Id.clickerGameLayout);
            leaderboardLayout = FindViewById<LinearLayout>(Resource.Id.leaderboardLayout);
        }

        public void CreateRoom(object sender, EventArgs e)
        {
            ShowOverlayPopup();
            // Hide the create/join layout
            createJoinLayout.Visibility = Android.Views.ViewStates.Gone;

            // Update room code display and player images
            roomCodeTextView.Text = "Room Code: " + roomCode;
            UpdatePlayerImages();
            waitingLayout.Visibility = Android.Views.ViewStates.Visible; // Switch to waiting layout
        }

        private string GenerateRoomCode(int length = 6)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            Random random = new Random();
            char[] roomCode = new char[length];

            for (int i = 0; i < length; i++)
            {
                roomCode[i] = chars[random.Next(chars.Length)];
            }

            return new string(roomCode);
        }

        private void JoinRoom(object sender, EventArgs e)
        {
            string inputRoomCode = FindViewById<EditText>(Resource.Id.roomCodeEditText).Text;
            if (dbHelper.JoinRoom(inputRoomCode, serialNumber))
            {
                roomCode = inputRoomCode;

                // Hide the create/join layout
                createJoinLayout.Visibility = Android.Views.ViewStates.Gone;

                // Update room code display and player images
                roomCodeTextView.Text = "Room Code: " + roomCode;
                UpdatePlayerImages();
                SwitchToWaitingPage(); // Switch to waiting page
            }
            else
            {
                Toast.MakeText(this, "Room not found or already joined.", ToastLength.Short).Show();
            }
        }

        private void UpdatePlayerImages()
        {
            // Assuming playerNames array is populated when a player joins
            for (int i = 0; i < playerCount; i++)
            {
                UpdatePlayerImage(i, playerNames[i]); // Update player images based on names
            }
        }

        private void SwitchToWaitingPage()
        {
            createJoinLayout.Visibility = Android.Views.ViewStates.Gone;
            waitingLayout.Visibility = Android.Views.ViewStates.Visible;
            playersListTextView.Text = "Players:\nWaiting for players...";
        }

        private void OnVoteClick(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(serialNumber))
            {
                Toast.MakeText(this, "No NFC tag detected! Please scan the NFC tag first.", ToastLength.Short).Show();
                return;
            }

            clickCount++;
           dbHelper.IncrementClick(roomCode, serialNumber); // Call to MongoDbHelper to increment click
        }

        private void OnGameTimerElapsed(object sender, ElapsedEventArgs e)
        {
            timerCountdown--;
            RunOnUiThread(() => timerTextView.Text = timerCountdown.ToString());

            if (timerCountdown <= 0)
            {
                _timer.Stop();
                EndGame();
            }
        }

        private async void EndGame()
        {
            _timer.Stop();

            // Hide game-specific layouts
            RunOnUiThread(() =>
            {
                clickerGameLayout.Visibility = Android.Views.ViewStates.Gone;
                leaderboardLayout.Visibility = Android.Views.ViewStates.Visible; // Hide leaderboard layout if needed
                waitingLayout.Visibility = Android.Views.ViewStates.Visible; // Hide waiting layout if necessary

                // Show only the winner text and the main menu button
                winnerTextView.Visibility = Android.Views.ViewStates.Visible; // Ensure winner text is visible
                backToMenuButton.Visibility = Android.Views.ViewStates.Visible; // Ensure main menu button is visible
            });

            // Fetch the leaderboard from the database
            var room = await dbHelper.GetRoom(roomCode); // Ensure you're fetching the room
            if (room?.Players != null && room.Players.Count > 0)
            {
                var sortedPlayers = room.Players.OrderByDescending(p => p.Clicks).ToList(); // Sort players by clicks

                var winner = sortedPlayers.First(); // Get the winner

                RunOnUiThread(() =>
                {
                    // Update the players list for the leaderboard if necessary
                    StringBuilder leaderboardBuilder = new StringBuilder();
                    foreach (var player in sortedPlayers)
                    {
                        leaderboardBuilder.AppendLine(string.Format("Winner {0}: , With {1} Clicks", player.SerialNumber ?? "Unknown", player.Clicks));
                    }
                    playersListTextView.Text = leaderboardBuilder.ToString(); // Show all scores if needed, or keep it hidden.
                });
            }
        }
 
        private void RestartGame()
        {
            _timer.Stop();
            leaderboardLayout.Visibility = Android.Views.ViewStates.Gone;
            createJoinLayout.Visibility = Android.Views.ViewStates.Visible;
            waitingLayout.Visibility = Android.Views.ViewStates.Gone;
            winnerTextView.Visibility = Android.Views.ViewStates.Gone;
            backToMenuButton.Visibility = Android.Views.ViewStates.Gone;
            
            clickCount = 0;
            timerCountdown = 60;
            timerTextView.Text = timerCountdown.ToString();
        }

        protected override void OnNewIntent(Intent intent)
        {
            base.OnNewIntent(intent);
            if (NfcAdapter.ActionTagDiscovered.Equals(intent.Action))
            {
                var tag = intent.GetParcelableExtra(NfcAdapter.ExtraTag) as Tag;
                if (tag != null)
                {
                    byte[] tagIdBytes = tag.GetId();
                    string _serialNumber = BitConverter.ToString(tagIdBytes).Replace("-", "");
                    serialNumber = _serialNumber;  // Set the serialNumber globally

                    Ndef ndef = Ndef.Get(tag);
                    if (ndef != null)
                    {
                        ReadNdefMessage(ndef, _serialNumber);
                    }
                    else
                    {
                        Toast.MakeText(this, "Non-NDEF NFC tag scanned", ToastLength.Short).Show();
                    }
                }
            }
        }

        private async void ReadNdefMessage(Ndef ndef, string _serialNumber)
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
                            

                            // Use the retrieved serialNumber and player name
                            serialNumber = _serialNumber;
                            
                            roomCode = GenerateRoomCode();
                            dbHelper.CreateRoom(serialNumber,roomCode); 

                            // Add player to the room
                            AddPlayerToRoom(name, serialNumber);
                            roomCodeTextView.Text = "Room Code: " + roomCode;

                            voteButton.Click += OnVoteClick; // Subscribe to vote button click event
                            overlayDialog?.Dismiss();
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

        private void AddPlayerToRoom(string name, string serialNumber)
        {
            if (playerCount < 4)
            {
                playerNames[playerCount] = name;
                UpdatePlayerImage(playerCount, name);
                playerCount++;
            }

            if (playerCount == 1)
            {
                StartGame();
            }
            else
            {
                playersListTextView.Text = $"Players: {string.Join(", ", playerNames.Take(playerCount))}\nWaiting for players...";
            }
        }

        private void StartGame()
        {
            waitingLayout.Visibility = Android.Views.ViewStates.Gone;
            clickerGameLayout.Visibility = Android.Views.ViewStates.Visible;

            clickCount = 0;
            timerCountdown = 5;
            timerTextView.Text = timerCountdown.ToString();

            _timer.Start();
        }

        private void UpdatePlayerImage(int playerIndex, string name)
        {
            switch (playerIndex)
            {
                case 0:
                    player1ImageView.SetImageResource(GetImageResourceByName(name));
                    break;
                case 1:
                    player2ImageView.SetImageResource(GetImageResourceByName(name));
                    break;
                case 2:
                    player3ImageView.SetImageResource(GetImageResourceByName(name));
                    break;
                case 3:
                    player4ImageView.SetImageResource(GetImageResourceByName(name));
                    break;
            }
        }

        private int GetImageResourceByName(string name)
        {
            switch (name)
            {
                case "Ted2":
                    return Resource.Drawable.ted2_box;
                case "Grafitti":
                    return Resource.Drawable.graffiti_box;
                case "Tetris":
                    return Resource.Drawable.tetris_box;
                case "Garfield":
                    return Resource.Drawable.garfield_box;
                case "Gary":
                    return Resource.Drawable.gary_box;
                case "Peach":
                    return Resource.Drawable.peach_box;
                default:
                    return Resource.Drawable.white;
            }
        }

        private async Task<string> FetchJsonFromUrl(string url)
        {
            using (HttpClient httpClient = new HttpClient())
            {
                HttpResponseMessage response = await httpClient.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadAsStringAsync();
                }
            }
            return null;
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
