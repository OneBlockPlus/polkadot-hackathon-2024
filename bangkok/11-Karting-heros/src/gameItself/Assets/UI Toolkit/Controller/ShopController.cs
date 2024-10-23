using System;
using System.Linq;
using UnityEngine;
using UnityEngine.UIElements;
using VContainer;
using VitalRouter;
public class ShopController : MonoBehaviour,IDisposable
{
    private UIDocument _document;
    private Button _findRaceButton;
    private ListView _shopItemsList;

    private Button _topItemsButton;
    private Button _bottomItemsButton;
    private Button _handsItemsButton;
    private Button _shoesItemsButton;
    private Button _hairItemsButton;
    private Button _headItemsButton;

    private VisualElement _characterImage;    
    private ShopItemsCollection _shopItems;
    private ShopItem[] _listItems;    
        
    private HeroLook _hero;  

    public event Action OnFindRace;
    private CharacterPreview _characterPreview;
    

    [Inject]
    private void Init(ShopItemsCollection allItems,HeroLook heroLook,CharacterPreview characterPreview){
        _shopItems = allItems;        
        _hero = heroLook;
        _characterPreview = characterPreview;
        _document = GetComponent<UIDocument>();
        Debug.Log("Mainmenu initialized!");
    }

    public void  Start(){    
        
        _findRaceButton = _document.rootVisualElement.Q<Button>("btnFindRace");
        _findRaceButton.RegisterCallback<ClickEvent>(OnFindRaceButtonClicked);

        _shopItemsList = _document.rootVisualElement.Q<ListView>("ShopItemsList");
        _shopItemsList.fixedItemHeight = 100;

        _topItemsButton = _document.rootVisualElement.Q<Button>("btnTop");
        _topItemsButton.RegisterCallback<ClickEvent>((evt)=>OnItemTypeChanged(evt,ShopItemType.Top));    

        _bottomItemsButton = _document.rootVisualElement.Q<Button>("btnBottom");
        _bottomItemsButton.RegisterCallback<ClickEvent>((evt)=>OnItemTypeChanged(evt,ShopItemType.Bottom));    

        _handsItemsButton = _document.rootVisualElement.Q<Button>("btnHands");
        _handsItemsButton.RegisterCallback<ClickEvent>((evt)=>OnItemTypeChanged(evt,ShopItemType.Hands));    

        _shoesItemsButton = _document.rootVisualElement.Q<Button>("btnShoes");
        _shoesItemsButton.RegisterCallback<ClickEvent>((evt)=>OnItemTypeChanged(evt,ShopItemType.Shoes));    

        _hairItemsButton = _document.rootVisualElement.Q<Button>("btnHair");
        _hairItemsButton.RegisterCallback<ClickEvent>((evt)=>OnItemTypeChanged(evt,ShopItemType.Hair));    


        _headItemsButton = _document.rootVisualElement.Q<Button>("btnHead");
        _headItemsButton.RegisterCallback<ClickEvent>((evt)=>OnItemTypeChanged(evt,ShopItemType.Head));    


        _shopItemsList.makeItem = ()=>{
            var newItem = _shopItemsList.itemTemplate.Instantiate();
            newItem.userData = ScriptableObject.CreateInstance<ShopItem>();            
            return newItem;
        };
        _shopItemsList.bindItem = (item,index)=>{
            item.userData = _shopItems.Items[index];
            item.Q<Label>("ItemName").text = _shopItems.Items[index].Name;
            item.Q<Label>("ItemPrice").text =  _shopItems.Items[index].Price;
        };

        _characterImage = _document.rootVisualElement.Q<VisualElement>("CharacterImage");
        _characterImage.style.backgroundImage = new StyleBackground(_characterPreview.Texture);

        _listItems = _shopItems.Items.Where(item=>item.Type == ShopItemType.Top).ToArray();
        _shopItemsList.itemsSource = _listItems;

        _shopItemsList.selectedIndicesChanged += (selecteds)=>{
            var selectedsArray = selecteds.ToArray();
            if(selectedsArray.Length == 0)
                return;

            var selectedItem =_listItems[ selectedsArray[0]];      

            switch(selectedItem.Type){
                case ShopItemType.Top:
                _hero.Top = selectedItem;
                break;

                case ShopItemType.Bottom:
                _hero.Bottom = selectedItem;
                break;

                case ShopItemType.Hair:
                _hero.Hair = selectedItem;
                break;
                
                case ShopItemType.Hands:
                _hero.Hands = selectedItem;
                break;

                case ShopItemType.Shoes:
                _hero.Shoes = selectedItem;
                break;

                case ShopItemType.Head:
                _hero.Head = selectedItem;
                break;
            }
        };
    }    

    private void OnItemTypeChanged(ClickEvent evt,ShopItemType itemType){       
        _listItems = _shopItems.Items.Where(item=>item.Type == itemType).ToArray();
        Debug.Log($"List items count is {_listItems.Length}");
        _shopItemsList.itemsSource = _listItems;
    }

    private void OnFindRaceButtonClicked(ClickEvent evt)
    {
        Debug.Log("You pressed the start button!");
        // _commandPublisher.Enqueue(new FindRaceCommand());
        OnFindRace?.Invoke();
    }

    public void Dispose()
    {        
        _findRaceButton.UnregisterCallback<ClickEvent>(OnFindRaceButtonClicked);
        Destroy(gameObject);
    }
}
