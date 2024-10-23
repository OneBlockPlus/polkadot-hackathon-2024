
using CommunityToolkit.Mvvm.ComponentModel;
using PlutoWallet.Model;

namespace PlutoWallet.ViewModel
{
    internal partial class MainViewModel : ObservableObject
    {
        [ObservableProperty]
        private bool scrollIsEnabled;

        public MainViewModel()
        {
            scrollIsEnabled = true;
        }
    }
}
