using VContainer;
using VContainer.Unity;
using VitalRouter.VContainer;

public class BootstrapLifetimeScope : LifetimeScope
{        
    protected override void Configure(IContainerBuilder builder)
    {
        builder.Register<NetworkManager>(Lifetime.Singleton);               
        // builder.RegisterEntryPoint<GameEntryPoint>();                         
        builder.Register<IBlockchainManager,PolkadotManager>(Lifetime.Singleton);
        builder.RegisterVitalRouter(routing =>  
        {  
            
        });
    }
}
