using Android.Content;
using Android.OS;

namespace FigoApp
{
    [Activity(Label = "Figo",Theme = "@style/Theme.AppCompat.Light.NoActionBar", MainLauncher = true)]
    public class LoadingActivity : Activity
    {
        private const string Tag = "LoadingActivity";

        protected override void OnCreate(Bundle? savedInstanceState)
        {
                base.OnCreate(savedInstanceState);
                SetContentView(Resource.Layout.activity_loading);

                Handler handler = new Handler();
                handler.PostDelayed(() =>
                {
                    var intent = new Intent(this, typeof(ScanActivity));
                    StartActivity(intent);
                    Finish();
                }, 4000);
                
        }
    }
}