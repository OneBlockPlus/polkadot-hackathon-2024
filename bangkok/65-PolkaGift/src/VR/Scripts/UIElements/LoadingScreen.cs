using UnityEngine;

namespace LostThoughtStudios.DemterGift.UIElements
{
    public class LoadingScreen : MonoBehaviour
    {
        private RectTransform rectComponent;
        
        [SerializeField]
        private float rotateSpeed = 200f;

        void Start()
        {
            rectComponent = GetComponent<RectTransform>();
        }

        void Update()
        {
            rectComponent.Rotate(0f, 0f, rotateSpeed * Time.deltaTime);
        }
    }
}
