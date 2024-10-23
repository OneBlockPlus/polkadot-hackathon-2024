/**
Author: astro
Email: astromanrx at gmail.com
Naming convention follows this book recommended coding style https://unity.com/resources/create-code-c-sharp-style-guide-e-book
*/

using UnityEngine;
using VContainer;
using VContainer.Unity;
using VitalRouter.VContainer;

public class MainmenuLifeScope : LifetimeScope
{
    [SerializeField]
    private ShopItemsCollection _shopItemsCollection;

    [SerializeField]
    private GameSettings _gameSettings;
        

    protected override void Configure(IContainerBuilder builder)
    {        
        builder.RegisterComponentInHierarchy<MainMenuController>();
        builder.RegisterComponentInHierarchy<HeroLook>();
        builder.RegisterComponentInHierarchy<CharacterPreview>();
        builder.RegisterVitalRouter(router=>{
            router.Map<MainMenuEvents>();
        });   
        builder.RegisterInstance(_shopItemsCollection);
        builder.RegisterInstance(_gameSettings);        
        // builder.RegisterEntryPoint<GameEntryPoint>();
    }
}
