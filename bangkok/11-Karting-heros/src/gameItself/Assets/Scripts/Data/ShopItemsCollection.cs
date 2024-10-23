using UnityEngine;

[CreateAssetMenu(fileName = "ShopItemsCollection", menuName = "ScriptableObjects/ShopItemsCollection", order = 1)]
public class ShopItemsCollection : ScriptableObject
{
    public ShopItem[] Items;
}
