using UnityEngine;

public class Hero 
{
    private Transform _carTransform;
    private Transform _heroTransform;
    private HeroLook _heroLook;

    public Transform CarTransform => _carTransform;
    public Transform HeroTransform => _heroTransform;


    public Hero(Transform carTransform,Transform heroTransform, HeroLook heroLook){
        _carTransform = carTransform;
        _heroLook = heroLook;
        _carTransform = carTransform;
    }
    

    public void Destroy(){
        Object.Destroy(_heroLook.gameObject);        
    }    
}
