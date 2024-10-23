using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using LostThoughtStudios.DemterGift.Helpers;

namespace LostThoughtStudios.DemterGift.DataManager
{
    public class DataTranslation
    {
        public delegate void IterateElements(List<EventDatum> DemeterEventData, List<EventDataContainer> translatedData, out List<EventDataContainer> outTranslatedData);
        
        public delegate void IterateMediaElements(List<Logo> EventMediaData, ref EventDataContainer outTranslatedData);
        public class JsonEventData
        {
            [JsonProperty("eventData")]
            public List<EventDatum> EventData { get; set; }

            public async Task<List<EventDataContainer>> GetTranslatedScreenData()
            {
                List<EventDataContainer> TranslatedData = new List<EventDataContainer>();

                IterateElements IterateOverEventInfo = new IterateElements(HelperElement.IterateEventElements);

                await Task.Run(() => { IterateOverEventInfo?.Invoke(EventData, TranslatedData, out TranslatedData); });                

                return TranslatedData;
            }
        }
        public class EventDatum
        {
            [JsonProperty("eventId")]
            public int EventId { get; set; }

            [JsonProperty("Title")]
            public string Title { get; set; }

            [JsonProperty("Date")]
            public string Date { get; set; }

            [JsonProperty("Goalusd")]
            public double Goalusd { get; set; }

            [JsonProperty("Goal")]
            public int Goal { get; set; }

            [JsonProperty("logo")]
            public Logo Logo { get; set; }

            [JsonProperty("allfiles")]
            public List<Logo> Allfiles { get; set; }

            public void ProcessEventInfo(EventDataContainer translatedData, out EventDataContainer outTranslatedData, ref List<EventDataContainer> EventData)
            {
                outTranslatedData = translatedData;

                outTranslatedData.EventId = this.EventId;

                outTranslatedData.EventName = this.Title;

                outTranslatedData.EventDate = this.Date;
                
                outTranslatedData.EventGoal = this.Goalusd.ToString();

                outTranslatedData.EventLogo = this.Logo.Url.ToString();

                IterateMediaElements MediaElements = new IterateMediaElements(HelperElement.IterateEventMediaContents);

                MediaElements?.Invoke(this.Allfiles, ref outTranslatedData);

                EventData.Add(outTranslatedData);
            }
        }
        public class Logo
        {
            [JsonProperty("url")]
            public Uri Url { get; set; }

            [JsonProperty("type")]
            public string Type { get; set; }
        }
    }
}