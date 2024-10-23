using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace LostThoughtStudios.DemterGift.UIElements
{
    public class Timer : MonoBehaviour
    {
        [SerializeField]
        private GameObject ApplicationManager;

        [SerializeField]
        private GameObject OvrPlayer;

        [SerializeField]
        private GameObject Environment;

        [SerializeField]
        private GameObject IntroCanvas;

        [SerializeField]
        private GameObject OtherCanvas;

        private float timer = 0.0f;

        // Update is called once per frame
        void Update()
        {
            timer += Time.deltaTime;

            if(timer > 10.0f)
            {
                IntroCanvas.SetActive(false);

                Environment.SetActive(true);

                ApplicationManager.SetActive(true);

                OtherCanvas.SetActive(true);

                OvrPlayer.GetComponent<OVRPlayerController>().GravityModifier = 1;

                this.enabled = false;
            }
        }
    }
}
