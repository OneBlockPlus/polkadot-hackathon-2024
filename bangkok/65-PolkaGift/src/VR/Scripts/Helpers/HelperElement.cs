using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using LostThoughtStudios.DemterGift.DataManager;

namespace LostThoughtStudios.DemterGift.Helpers
{
    public class HelperElement 
    {
        public static void IterateEventElements(List<DataTranslation.EventDatum> EventInfo, List<EventDataContainer> TranslatedData, out List<EventDataContainer> OutTranslatedData)
        {
            OutTranslatedData = TranslatedData;

            foreach (var Info in EventInfo)
            {
                EventDataContainer EventData = new EventDataContainer();

                Info.ProcessEventInfo(EventData, out EventData, ref OutTranslatedData);
            }
        }
        public static void IterateEventMediaContents(List<DataTranslation.Logo> MediaInfo, ref EventDataContainer OutTranslatedData)
        {
            foreach (var Info in MediaInfo)
            {
                switch (Info.Type)
                {
                    case "image/jpeg":
                        OutTranslatedData.EventImage = Info.Url.AbsoluteUri;
                        break;
                    case "video/mp4":
                        OutTranslatedData.EventVideo = Info.Url.AbsoluteUri;
                        break;
                }
            }
        }
        public static void IterateEventNftElements(List<NftDataTranslation.EventNftDatum> EventInfo, List<NftDetails> TranslatedData, out List<NftDetails> OutTranslatedData)
        {
            OutTranslatedData = TranslatedData;

            foreach (var Info in EventInfo)
            {
                NftDetails EventNftData = new NftDetails();

                Info.ProcessEventNftInfo(EventNftData, out EventNftData, ref OutTranslatedData);
            }
        }
    }
}
