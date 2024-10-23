using System.Collections.Concurrent;
using System.Threading;
using Cysharp.Threading.Tasks;
using UnityEngine;
using VContainer.Unity;
using VitalRouter;

public class RaceController : IAsyncStartable,ITickable
{
    private RaceEvents _raceEvents;
    private NetworkManager _networkManager;
    

    public RaceController(RaceEvents raceEvents,NetworkManager networkManager){
        _raceEvents = raceEvents;
        _networkManager = networkManager;
    }

    

    public async UniTask StartAsync(CancellationToken cancellation = default)
    {
        _networkManager.ReportMapLoaded();
        SpawnPlayer();
    }

    private void SpawnPlayer(){
        
    }

    public void Tick()
    {
        _raceEvents.Update();        
    }    
}
