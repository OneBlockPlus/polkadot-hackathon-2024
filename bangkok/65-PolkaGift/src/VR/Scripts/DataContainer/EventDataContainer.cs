using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace LostThoughtStudios.DemterGift.DataManager
{
    public class EventDataContainer 
    {
        public int EventId { get; set; }

        public string EventName { get; set; }

        public string EventDate { get; set; }

        public string EventGoal { get; set; }

        public string EventLogo { get; set; }

        public string EventImage { get; set; }

        public string EventVideo { get; set; }

        public List<NftDetails> NftDonatedPerEvent { get; set; }

        public EventDataContainer()
        {
            NftDonatedPerEvent = new List<NftDetails>();
        }
    }
    public class NftDetails
    {
        public string NftTitle { get; set; }

        public string BidPrice { get; set; }

        public Uri NftImageUrl { get; set; }
    }
}