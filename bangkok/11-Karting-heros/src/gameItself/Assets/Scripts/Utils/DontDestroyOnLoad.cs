using UnityEngine;

public class DontDestroyOnLoad: MonoBehaviour{
    public void Awake(){
        DontDestroyOnLoad(this.gameObject);
    }
}