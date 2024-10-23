using Android.Views;
using AndroidX.RecyclerView.Widget;

namespace FigoApp;

public class GearViewHolder : RecyclerView.ViewHolder
{
    public ImageView GearImage { get; private set; }
    public TextView GearDescription { get; private set; }
    public TextView GearPrice { get; private set; }

    public GearViewHolder(View itemView) : base(itemView)
    {
        GearImage = itemView.FindViewById<ImageView>(Resource.Id.nft_image);
        GearDescription = itemView.FindViewById<TextView>(Resource.Id.nft_name);
        GearPrice = itemView.FindViewById<TextView>(Resource.Id.nft_price);
    }
}
