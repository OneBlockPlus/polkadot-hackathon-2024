using LostThoughtStudios.DemterGift.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LostThoughtStudios.DemterGift.DataManager
{
    public class NftDataTranslation
    {
        public delegate void IterateNftElements(List<EventNftDatum> DemeterEventData, List<NftDetails> translatedData, out List<NftDetails> outTranslatedData);
        public class JsonEventData
        {
            [JsonProperty("eventNFTData")]
            public List<EventNftDatum> EventNftData { get; set; }

            public async Task<List<NftDetails>> GetTranslatedNftData()
            {
                List<NftDetails> TranslatedData = new List<NftDetails>();

                IterateNftElements IterateOverNftInfo = new IterateNftElements(HelperElement.IterateEventNftElements);

                await Task.Run(() => { IterateOverNftInfo?.Invoke(EventNftData, TranslatedData, out TranslatedData); });

                return TranslatedData;
            }
        }

        public class EventNftDatum
        {
            [JsonProperty("Id")]
            public long Id { get; set; }

            [JsonProperty("name")]
            public string Name { get; set; }

            [JsonProperty("description")]
            public string Description { get; set; }

            [JsonProperty("Bidprice")]
            public string Bidprice { get; set; }

            [JsonProperty("price")]
            public long Price { get; set; }

            [JsonProperty("type")]
            public string Type { get; set; }

            [JsonProperty("image")]
            public Uri Image { get; set; }

            public void ProcessEventNftInfo(NftDetails translatedData, out NftDetails outTranslatedData, ref List<NftDetails> EventData)
            {
                outTranslatedData = translatedData;

                outTranslatedData.NftTitle = this.Name;

                outTranslatedData.BidPrice = this.Bidprice;

                outTranslatedData.NftImageUrl = this.Image;

                EventData.Add(outTranslatedData);
            }
        }
    }
}