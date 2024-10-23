using Android.Views;
using AndroidX.RecyclerView.Widget;
using Square.Picasso;

namespace FigoApp;

public class GearAdapter : RecyclerView.Adapter
{
    private List<Gear> gearList;
    private Action<int> itemClickListener;

    public GearAdapter(List<Gear> gearList, Action<int> itemClickListener)
    {
        this.gearList = gearList;
        this.itemClickListener = itemClickListener;
    }

    public override int ItemCount => gearList.Count;

    public override void OnBindViewHolder(RecyclerView.ViewHolder holder, int position)
    {
        GearViewHolder viewHolder = holder as GearViewHolder;
        viewHolder.GearDescription.Text = gearList[position].Name;
        viewHolder.GearPrice.Text = gearList[position].Price;
        
        Picasso.Get().Load(gearList[position].imageUrl).Into(viewHolder.GearImage);

       // Set the click listener for this item
        viewHolder.ItemView.Click += (sender, e) => itemClickListener(position);
    }

    public override RecyclerView.ViewHolder OnCreateViewHolder(ViewGroup parent, int viewType)
    {
        View itemView = LayoutInflater.From(parent.Context).Inflate(Resource.Layout.nft_card_item, parent, false);
        return new GearViewHolder(itemView);
    }
}
