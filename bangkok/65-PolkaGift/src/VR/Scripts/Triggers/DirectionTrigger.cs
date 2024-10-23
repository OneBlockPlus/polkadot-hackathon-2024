using LostThoughtStudios.DemterGift.DataManager;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using TMPro;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;
using UnityEngine.Video;

namespace LostThoughtStudios.DemterGift.PhysicsTriggers
{
    public class DirectionTrigger : MonoBehaviour
    {

        [SerializeField]
        private GameObject EventText;

        [SerializeField]
        private GameObject PageNumber;

        [SerializeField]
        private GameObject VideoPlayerObject;

        [SerializeField]
        private GameObject EventLogo;

        [SerializeField]
        private GameObject EventImage;

        [SerializeField]
        private GameObject EventGoal;

        [SerializeField]
        private List<GameObject> NTFImages;

        private Animator _buttonAnimator;

        private int index = 0;
        // Start is called before the first frame update
        void Start()
        {
            _buttonAnimator = GetComponent<Animator>();
        }
        public static async Task<Sprite> GetIconTexture(Uri TextureAddress)
        {
            UnityWebRequest webRequest = UnityWebRequestTexture.GetTexture(TextureAddress);

            //webRequest.certificateHandler = new AcceptAllCertificatesSignedWithASpecificPublicKey();

            var operation = webRequest.SendWebRequest();

            while (!operation.isDone)
                await Task.Yield();

            if (webRequest.result != UnityWebRequest.Result.Success)
            {
                Debug.Log("Texture Address : " + TextureAddress);

                Debug.Log(webRequest.error);

                return null;
            }
            else
            {
                Texture2D myTexture = DownloadHandlerTexture.GetContent(webRequest);

                myTexture.wrapMode = TextureWrapMode.Clamp;

                //myTexture.filterMode = FilterMode.Point;

                Sprite referenceSpriteImage;

                referenceSpriteImage = Sprite.Create(myTexture,
                    new Rect(0.0f, 0.0f, myTexture.width, myTexture.height), new Vector2(0.5f, 0.5f));

                return referenceSpriteImage;
            }
        }
        private void OnDestroy()
        {
            RenderTexture rt = RenderTexture.active;
            RenderTexture.active = VideoPlayerObject.GetComponent<VideoPlayer>().targetTexture;
            GL.Clear(true, true, Color.clear);
            RenderTexture.active = rt;
        }

        private async void OnTriggerEnter(Collider other)
        {
            this.GetComponent<BoxCollider>().isTrigger = false;

            if(other.gameObject.tag == "Player" && this.gameObject.tag == "RightDirection")
            {
                if (index < DataSyncer.Instance.EventData.Count)
                {
                    _buttonAnimator.SetTrigger("ButtonPressed");

                    EventText.GetComponent<TextMeshProUGUI>().text = DataSyncer.Instance.EventData[index].EventName;

                    EventGoal.GetComponent<TextMeshProUGUI>().text = DataSyncer.Instance.EventData[index].EventGoal;

                    VideoPlayerObject.GetComponent<VideoPlayer>().url = DataSyncer.Instance.EventData[index].EventVideo;

                    EventLogo.GetComponent<Image>().sprite = await GetIconTexture(new Uri(DataSyncer.Instance.EventData[index].EventLogo));

                    EventImage.GetComponent<Image>().sprite = await GetIconTexture(new Uri(DataSyncer.Instance.EventData[index].EventLogo));

                    int visibleElements = DataSyncer.Instance.EventData[index].NftDonatedPerEvent.Count;

                    for(int i =0;i< NTFImages.Count; i++)
                    {
                        if (i >= visibleElements)
                            NTFImages[i].SetActive(false);
                        else
                        {
                            NTFImages[i].SetActive(true);

                            NTFImages[i].GetComponent<Image>().sprite = await GetIconTexture(DataSyncer.Instance.EventData[index].NftDonatedPerEvent[i].NftImageUrl);
                        }
                    }

                    index++;

                    PageNumber.GetComponent<TextMeshProUGUI>().text = index.ToString() + "/" + DataSyncer.Instance.EventData.Count;
                }
            }
            if (other.gameObject.tag == "Player" &&  this.gameObject.tag == "LefttDirection")
            {
                if (index >=0)
                {
                    _buttonAnimator.SetTrigger("ButtonPressed");

                    EventText.GetComponent<TextMeshProUGUI>().text = DataSyncer.Instance.EventData[index].EventName;

                    index--;

                    PageNumber.GetComponent<TextMeshProUGUI>().text = index.ToString() + "/" + DataSyncer.Instance.EventData.Count;
                }
            }
        }
        private void OnTriggerExit(Collider other)
        {
            this.GetComponent<BoxCollider>().isTrigger = true;
        }
    }
}