using System.Collections;
using UnityEngine.Rendering;
using UnityEngine;

namespace LostThoughtStudios.DemterGift.UIElements
{
    public class SplashScreenCheck : MonoBehaviour
    {

        IEnumerator Start()
        {
            SplashScreen.Begin();
            while (!SplashScreen.isFinished)
            {
                SplashScreen.Draw();
                yield return null;
            }

            this.gameObject.GetComponent<Timer>().enabled = true;
        }
    }
}
