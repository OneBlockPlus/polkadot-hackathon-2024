
using Cysharp.Threading.Tasks;
using UnityEngine;
using VitalRouter;

[Routes]
public partial class Gameplay{
    private NetworkManager _networkManager;
    private ICommandPublisher _commandPublisher;

    public Gameplay(NetworkManager networkManager,ICommandPublisher commandPublisher){
        _networkManager = networkManager;
        _commandPublisher = commandPublisher;
    }

    public async UniTask On(FindRaceCommand cmd){
        Debug.Log("Finding race ...");
        // await _networkManager.FindRace();
        _commandPublisher.Enqueue(new RaceFoundCommand());
    }

    public void On(PlayerJoinedTheRaceCommand cmd){
        //Spawn player character
    }

    public void On(PlayerLeftTheRaceCommand cmd){
        //despawn player character
    }
}