using System.Collections;
using System.Collections.Generic;
using UnityEngine;


namespace LostThoughtStudios.DemterGift.PhysicsTriggers
{
    public class OpenDoor : MonoBehaviour
    {

        [SerializeField]
        private GameObject MainDoor;

        private Animator _buttonAnimator;
        // Start is called before the first frame update
        void Start()
        {
            _buttonAnimator = GetComponent<Animator>();
        }

        private void OnTriggerEnter(Collider other)
        {
            this.GetComponent<BoxCollider>().isTrigger = false;

            if (other.gameObject.tag == "Player")
            {
                _buttonAnimator.SetTrigger("ButtonPush");

                MainDoor.GetComponent<Animator>().SetBool("DoorOpen", true);

            }
        }
        private void OnTriggerExit(Collider other)
        {
            this.GetComponent<BoxCollider>().isTrigger = true;
        }
    }
}