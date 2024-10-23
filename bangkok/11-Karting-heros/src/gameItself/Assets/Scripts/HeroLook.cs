using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using VContainer;

public class HeroLook : MonoBehaviour
{    
    [SerializeField]
    private ShopItem _head;
    [SerializeField]
    private ShopItem _hair;
    [SerializeField]
    private ShopItem _hands;    
    [SerializeField]
    private ShopItem _top;
    [SerializeField]
    private ShopItem _bottom;
    [SerializeField]
    private ShopItem _shoes;

    [Space]
    private ShopItemsCollection _allItems;

    public ShopItem Head{
        get{ return _head; }
        set{ 
            DisableItem(_head); 
            _head = value; 
            EnableItem(_head);
        }
    }

    public ShopItem Hair{
        get{ return _hair; }
        set{ 
            DisableItem(_hair); 
            _hair = value; 
            EnableItem(_hair);
        }
    }

    public ShopItem Hands{
        get{ return _hands; }
        set{ 
            DisableItem(_hands);
            _hands = value; 
            EnableItem(_hands);
        }
    }

    public ShopItem Top{
        get{ return _top; }
        set{ 
            DisableItem(_top);
            _top = value; 
            EnableItem(_top);
        }
    }

    public ShopItem Bottom{
        get{ return _bottom; }
        set{ 
            DisableItem(_bottom);
            _bottom = value; 
            EnableItem(_bottom);
        }
    }

    public ShopItem Shoes{
        get{ return _shoes; }
        set{ 
            DisableItem(_shoes);
            _shoes = value; 
            EnableItem(_shoes);
        }
    }


   [Inject]
   private void Init(ShopItemsCollection allItems){
    _allItems = allItems;
   }

    void DisableAll(){
        foreach(ShopItem item in _allItems.Items){
            DisableItem(item);
        }
    }

    void Update (){ 
        if(Application.isEditor && !Application.isPlaying){
            DisableAll();

            EnableItem(_head);
            EnableItem(_hair);
            EnableItem(_hands);
            EnableItem(_top);
            EnableItem(_bottom);
            EnableItem(_shoes);
        }
        
    }

    private void EnableItem(ShopItem item){
        if(item == null){            
            return;
        }        
        var itemTransform = transform.Find(item.Name);
        if(itemTransform != null){
            itemTransform.gameObject.SetActive(true);                
        }else{
            Debug.Log($"{item.Name} not found");
        }
    }

    private void DisableItem(ShopItem item){
        if(item == null){            
            return;
        }        
        var itemTransform = transform.Find(item.Name);
        if(itemTransform != null){
            itemTransform.gameObject.SetActive(false);                
        }else{
            Debug.Log($"{item.Name} not found");
        }
    }
}
