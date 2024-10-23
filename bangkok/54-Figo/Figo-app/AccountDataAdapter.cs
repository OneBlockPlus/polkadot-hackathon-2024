using Android.Views;
using AndroidX.RecyclerView.Widget;
using System;
using System.Collections.Generic;

namespace FigoApp
{
    public class AccountDataAdapter : RecyclerView.Adapter
    {
        private readonly List<AccountData> _gearList;
        private readonly Action<AccountData> _onGearSelected;
        private string _selectedGearId = null; // Track the currently selected gear ID

        // Public property to get the selected gear ID
        public string SelectedGearId => _selectedGearId;

        public AccountDataAdapter(List<AccountData> gearList, Action<AccountData> onGearSelected)
        {
            _gearList = gearList;
            _onGearSelected = onGearSelected;
        }

        public override RecyclerView.ViewHolder OnCreateViewHolder(ViewGroup parent, int viewType)
        {
            var itemView = LayoutInflater.From(parent.Context).Inflate(Resource.Layout.unlocked_gear_item, parent, false);
            return new EquipGearViewHolder(itemView);
        }

        public override void OnBindViewHolder(RecyclerView.ViewHolder holder, int position)
        {
            var gear = _gearList[position];
            var viewHolder = holder as EquipGearViewHolder;

            // Pass whether this gear is selected (highlight if selected)
            viewHolder.Bind(gear, _selectedGearId == gear.GearId, OnGearSelected);
        }

        public override int ItemCount => _gearList.Count;

        private void OnGearSelected(AccountData selectedGear)
        {
            // Update the selected gear ID in the adapter
            _selectedGearId = selectedGear.GearId;

            // Refresh the RecyclerView to reflect changes (highlight selected gear)
            NotifyDataSetChanged();
        }
    }
}