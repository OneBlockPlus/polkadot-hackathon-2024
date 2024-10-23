using Cysharp.Threading.Tasks;
using UnityEngine;
using UnityEngine.UIElements;


// [RequireComponent(typeof(UIDocument))]
public class CountdownController : MonoBehaviour 
{

    private UIDocument _document;
    private Label _countdownLabel;    

    private int _countdown;

    public int Countdown{
        get{return _countdown;}
        set{
            _countdown = value;
            _countdownLabel.text = value.ToString();
        }
    }
    
   
    private void  Start(){    
        _document = GetComponent<UIDocument>();                       
        _countdownLabel = _document.rootVisualElement.Q<Label>("countdown");              
    }       

    public void Go(){
        _countdownLabel.text = "GO!";
        _ = DestroyAfter(3000);
    }

    public async UniTask DestroyAfter(int time){
        await UniTask.Delay(time);
        Destroy(this.gameObject);        
    }
    
}
