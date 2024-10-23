using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;
using LostThoughtStudios.DemterGift.DataManager;
using System.Linq;
using TMPro;

namespace LostThoughtStudios.DemterGift.DataManager
{
    public class NftByEvent
    {
        public int EventId { get; set; }

        public string ResponseData { get; set; }

        public NftByEvent(int EventId, string ResponseData)
        {
            this.EventId = EventId;

            this.ResponseData = ResponseData;
        }
    }
    public class DataSyncer : MonoBehaviour
    {
        [SerializeField]
        private string EventApiUrl;

        [SerializeField]
        private string NftsByEventIdApiUrl;

        [SerializeField]
        private string ResponseFrontText;

        [SerializeField]
        private string NftResponseFrontText;

        [SerializeField]
        private GameObject UICanvas;

        [SerializeField]
        private GameObject PageNumberText;

        private DataTranslator TranslatedData = new DataTranslator();

        private List<Task<string>> AsyncEventNftDataTasks = new List<Task<string>>();

        private List<NftByEvent> NftByEventResponseData = new List<NftByEvent>();

        private List<Task<List<NftDetails>>> AsyncEventNftDetailTasks = new List<Task<List<NftDetails>>>();

        public List<EventDataContainer> EventData = new List<EventDataContainer>();

        private static DataSyncer _instance;
        public static DataSyncer Instance { get { return _instance; } }
        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(this.gameObject);
            }
            else
            {
                _instance = this;
            }
        }
        void Start()
        {
            DataInitialization();
        }

        // Update is called once per frame
        private async void DataInitialization()
        {
            string ResponseData = await GetEventInformation(new Uri(EventApiUrl));

            string UpdatedResponseText = ResponseData.Replace(@"\", string.Empty);

            ResponseData = ResponseFrontText + UpdatedResponseText.Substring(1, UpdatedResponseText.Length - 2) + "}";

            EventData = await TranslatedData.DataTranslation(ResponseData);

            foreach(var Event in EventData)
            {
                AsyncEventNftDataTasks.Add(GetEventInformation(new Uri(NftsByEventIdApiUrl + Event.EventId)));
            }

            foreach(var (NftData,index) in (await Task.WhenAll(AsyncEventNftDataTasks)).Select((value, i)=>(value,i)))
            {
                string UpdatedNftDataResponseText = NftData.Replace(@"\", string.Empty);

                UpdatedNftDataResponseText = NftResponseFrontText + UpdatedNftDataResponseText.Substring(1, UpdatedNftDataResponseText.Length - 2) + "}";

                Debug.Log(UpdatedNftDataResponseText);

                NftByEventResponseData.Add(new NftByEvent(index, UpdatedNftDataResponseText));
            }
            foreach(var NftInfo in NftByEventResponseData)
            {
                AsyncEventNftDetailTasks.Add(TranslatedData.NftDataTranslation(NftInfo.ResponseData));
            }

            foreach (var (NftData, index) in (await Task.WhenAll(AsyncEventNftDetailTasks)).Select((value, i) => (value, i)))
            {
                EventData[index].NftDonatedPerEvent = NftData;
            }

            PageNumberText.GetComponent<TextMeshProUGUI>().text = "/ " + EventData.Count.ToString();

            UICanvas.SetActive(false);
        }
        private async Task<string> GetEventInformation(Uri EventApiUrl)
        {
            UnityWebRequest WebRequest = UnityWebRequest.Get(EventApiUrl);

            var operation = WebRequest.SendWebRequest();

            while (!operation.isDone)
                await Task.Yield();

            if (WebRequest.result != UnityWebRequest.Result.Success)
            {
                Debug.Log(WebRequest.error);

                return "";
            }
            else
            {
                return WebRequest.downloadHandler?.text;
            }
        }
    }
}