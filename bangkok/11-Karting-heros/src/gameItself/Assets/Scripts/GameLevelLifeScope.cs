using Cinemachine;
using UnityEngine;
using VContainer;
using VContainer.Unity;
using VitalRouter.VContainer;

public class GameLevelLifeScope : LifetimeScope
{    
    [SerializeField]
    private GameSettings _gameSettings;
    [SerializeField]
    private ShopItemsCollection _shopItemsCollection;
        

    protected override void Configure(IContainerBuilder builder)
    {                
        builder.Register<HeroFactory>(Lifetime.Singleton);                
        builder.RegisterEntryPoint<RaceController>(Lifetime.Singleton);        
        builder.RegisterVitalRouter(router=>{
            router.Map<RaceEvents>();
        });   
        builder.RegisterInstance(_gameSettings);  
        builder.RegisterInstance(_shopItemsCollection);
        builder.RegisterComponentInHierarchy<CinemachineVirtualCamera>();        
        
        builder.RegisterComponentInHierarchy<SpawnLocations>();
        builder.RegisterComponentInHierarchy<CountdownController>();
    }
}
