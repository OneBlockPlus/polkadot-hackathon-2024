using LostThoughtStudios.DemterGift.DataManager;
using Newtonsoft.Json;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using UnityEngine;

namespace LostThoughtStudios.DemterGift.DataManager
{
    public class DataTranslator
    {
        public async Task<List<EventDataContainer>> DataTranslation(string EventJsonData)
        {
            var DeserializeData = ExtractDataFromJson(EventJsonData);

            List<EventDataContainer> TranslatedData = new List<EventDataContainer>();

            TranslatedData = await DeserializeData.GetTranslatedScreenData();

            return TranslatedData;
        }

        private DataTranslation.JsonEventData ExtractDataFromJson(string EventJsonData)
        {
            JsonTextReader Reader = new JsonTextReader(new StringReader(EventJsonData));

            JsonSerializer Serializer = new JsonSerializer();

            Serializer.NullValueHandling = NullValueHandling.Ignore;

            var deserializedData = Serializer.Deserialize<DataTranslation.JsonEventData>(Reader);

            return deserializedData;
        }
        public async Task<List<NftDetails>> NftDataTranslation(string EventJsonData)
        {
            var DeserializeData = ExtractDataFromNftJson(EventJsonData);

            List<NftDetails> BidDetails = new List<NftDetails>();

            BidDetails = await DeserializeData.GetTranslatedNftData();

            return BidDetails;
        }
        private NftDataTranslation.JsonEventData ExtractDataFromNftJson(string EventJsonData)
        {
            JsonTextReader Reader = new JsonTextReader(new StringReader(EventJsonData));

            JsonSerializer Serializer = new JsonSerializer();

            Serializer.NullValueHandling = NullValueHandling.Ignore;

            var deserializedData = Serializer.Deserialize<NftDataTranslation.JsonEventData>(Reader);

            return deserializedData;
        }
    }
}