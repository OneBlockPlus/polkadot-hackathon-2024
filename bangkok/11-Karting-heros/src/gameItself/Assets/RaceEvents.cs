using System;
using System.Collections.Concurrent;
using KartGame.KartSystems;
using UnityEngine;
using VContainer.Unity;
using VitalRouter;

[Routes]
public partial class RaceEvents 
{
    private HeroFactory _heroFactory;
    private NetworkManager _networkManager;
    private SpawnLocations _spawnLocations;
    private CountdownController _countdownController;

    private ConcurrentDictionary<string,Hero> _heros = new();
    private ConcurrentDictionary<string,ArcadeKart> _cars = new();
    private Hero _playerHero;
    

    public RaceEvents(HeroFactory heroFactory,SpawnLocations spawnLocations,NetworkManager networkManager,CountdownController countdownController){
        _heroFactory = heroFactory;
        _heros = new ConcurrentDictionary<string,Hero>();
        _spawnLocations = spawnLocations;
        _networkManager = networkManager;  
        _countdownController = countdownController;        
    }

    public void On(SpawnPlayerCarCommand cmd){
        if(! _heros.ContainsKey(cmd.PlayerSessionId)){
            Debug.Log($"Player {_heros.Count} joined the game.");
            var spawnSpot = _spawnLocations.Spots[_heros.Count];
            
            var hero =_heroFactory.Create(cmd.IsPlayer,spawnSpot.position,spawnSpot.rotation);            
            if(cmd.IsPlayer){
                _playerHero = hero;   
            }
            if(_heros.TryAdd(cmd.PlayerSessionId, hero)){
                
            }
        }        
    }

    public void On(PlayerLeftTheRaceCommand cmd){
        if(_heros.TryGetValue(cmd.PlayerSessionId, out var remoteHero)){
            remoteHero.Destroy();
        }
    }

    public void On(PlayerStateUpdatedCommand cmd){
        var rotation = new  Quaternion(cmd.Player.rotX,cmd.Player.rotY,cmd.Player.rotZ,cmd.Player.rotW); 
        var position = new Vector3(cmd.Player.x,cmd.Player.y,cmd.Player.z);
        if(_heros.TryGetValue(cmd.PlayerSessionId, out var hero)){
            if(! cmd.IsPlayer){
                hero.CarTransform.rotation = Quaternion.Lerp(hero.CarTransform.rotation,rotation,0.1f) ;
                hero.CarTransform.position = Vector3.Lerp(hero.CarTransform.position,position,0.1f);
                Debug.Log($"Position updated to {position}");                
            }            
        }

        Debug.Log("Updating opponents Position!");
    }    


    public void On(GameStartedCommand cmd){
        // Countdown reached to zero
        // Unlock car controls
        foreach(var car in _cars.Values){
            car.SetCanMove(true);
        }

        _countdownController.Go();
    }

    public void On(GameFinishedCommand cmd){
        //Go to Race end scene
    }

    public void On(StartCountdownCommand cmd){
        //Start countdown        
    }    

    public void On(UpdateCountdownCommand cmd){
        _countdownController.Countdown = cmd.Time;
    }

    public void Update()
    {
        if(_playerHero != null){
            Debug.Log("Updating Positon of Player!");
            _networkManager.Sync(_playerHero.CarTransform);
        }        
    }
}
