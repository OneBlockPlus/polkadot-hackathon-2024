using Android.Views;
using AndroidX.RecyclerView.Widget;
using Square.Picasso;
using Android.Widget;
using System;

namespace FigoApp
{
    public class EquipGearViewHolder : RecyclerView.ViewHolder
    {
        ImageView UnlockedGearImage;

        public EquipGearViewHolder(View itemView) : base(itemView)
        {
            // Bind the view in the unlocked_gear_item layout
            UnlockedGearImage = itemView.FindViewById<ImageView>(Resource.Id.unlocked_gear_placeholder);
        }

        public void Bind(AccountData accountData, bool isSelected, Action<AccountData> onGearSelected)
        {
            if (accountData == null)
            {
                throw new ArgumentNullException(nameof(accountData), "AccountData cannot be null.");
            }
            if (onGearSelected == null)
            {
                throw new ArgumentNullException(nameof(onGearSelected), "Gear selected action cannot be null.");
            }

            // Load the image using Picasso
            if (!string.IsNullOrEmpty(accountData.UnlockedUrl))
            {
                Picasso.Get().Load(accountData.UnlockedUrl).Into(UnlockedGearImage);
            }
            else
            {
                UnlockedGearImage.SetImageResource(Resource.Layout.unlocked_gear_item); // Default image
            }

            // Highlight the selected item visually (change background color if selected)
            if (isSelected)
            {
                ItemView.SetBackgroundColor(Android.Graphics.Color.LightGreen); // Highlight color
            }
            else
            {
                ItemView.SetBackgroundColor(Android.Graphics.Color.Transparent); // Default color
            }

            // Set click listener to select this gear
            ItemView.Click += (s, e) => onGearSelected(accountData);
        }

    }
}
