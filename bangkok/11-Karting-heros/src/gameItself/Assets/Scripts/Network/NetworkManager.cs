/**
Author: astro
Email: astromanrx at gmail.com
Naming convention follows this book recommended coding style https://unity.com/resources/create-code-c-sharp-style-guide-e-book
*/

using System;
using System.Collections.Generic;
using Colyseus;
using Colyseus.Schema;
using Cysharp.Threading.Tasks;
using UnityEngine;
using UnityEngine.SceneManagement;
using VitalRouter;
using System.Linq;

public class NetworkManager : IDisposable
{
    private ColyseusClient _client;

    private ColyseusRoom<KartRoomState> _room;

    private ICommandPublisher _commandPublisher;
    private IBlockchainManager _blockchainManager;
   
    public NetworkManager(ICommandPublisher commandPublisher,IBlockchainManager blockchainManager){
        _commandPublisher = commandPublisher;
        _blockchainManager = blockchainManager;

        _client = new ColyseusClient("ws://localhost:2567");       

        Debug.Log($"Wallet address: {blockchainManager.Address}");
    }

    public class CharacterAppearance{
        public string shoes;
        public string car;
    }

    public class PlayerJoinedMessage{
        
        public string sessionId;        
        public string name;
        
        public CharacterAppearance appearance;
    }

    public async UniTask FindRace(){

        

        _room = await _client.JoinOrCreate<KartRoomState>("kart",new Dictionary<string, object>(){
            {"name", "Player1"},
            {"address", _blockchainManager.Address},
            // {"appearance", new{
            //     shoes= "Red Shoes",
            //     car = "Pumpkin"
            // }}
        });                 
        
        Func<string,bool> isPlayer = (string sessionId)=>{
            return _room.SessionId == sessionId;
        };

       
        // _room.State.players.ForEach((sessionId,player)=>{            
        //     _commandPublisher.Enqueue(new PlayerJoinedTheRaceCommand(player,sessionId, _room.SessionId == sessionId,_room.State.players.Count));                   
        // });
        
        _room.OnMessage<dynamic>("ready_check",(data)=>{   
            Debug.Log("ready check received.");         
            _commandPublisher.Enqueue(new PlayerReadyCheckCommand());                   
        });

        _room.OnMessage<string>("ready_report",(clientSessionId)=>{
            _commandPublisher.Enqueue(new PlayerIsReadyCommand(clientSessionId));
        });
       
        _room.OnMessage<dynamic>("gameOver",(data)=>{
            _commandPublisher.Enqueue(new GameFinishedCommand());
        });

        _room.OnMessage<dynamic>("start",(data)=>{
            _commandPublisher.Enqueue(new GameStartedCommand());
        });

        _room.OnMessage<dynamic>("start_countdown",(data)=>{
            _commandPublisher.Enqueue(new StartCountdownCommand());
        });

        _room.OnMessage<int>("update_countdown",(time)=>{
            _commandPublisher.Enqueue(new UpdateCountdownCommand(time));
        });

        _room.OnMessage<dynamic>("load_map",(data)=>{
            _commandPublisher.Enqueue(new LoadMapCommand());
        });

        _room.OnMessage<string>("spawn",(sessionId)=>{
            _commandPublisher.Enqueue(new SpawnPlayerCarCommand(sessionId,_room.SessionId == sessionId));
        });


        _room.OnStateChange += (newstate,isfirst)=>{
            Debug.Log($"room joined with {_room.State.players.Count} members." );            
            List<OpponentInfo> opponentsInfo = new List<OpponentInfo>();
            _room.State.players.ForEach(
                (sessionId,player)=>{
                    if(! isPlayer(sessionId)){
                        opponentsInfo.Add(new OpponentInfo(){
                            isReady = player.ready,
                            name = player.name,
                            avatar = null
                        });
                    }
                }
            );

            _commandPublisher.Enqueue(new RaceFoundCommand( opponentsInfo.ToArray()  ));

            
            Debug.Log(_room.SessionId);
            Debug.Log($"Number of players : {_room.State.players.Count}");
        };
        
        
        _room.State.players.OnAdd((sessionId,player)=>{                        
            _commandPublisher.Enqueue(new PlayerJoinedTheRaceCommand(player,sessionId, _room.SessionId == sessionId,_room.State.players.Count));                   

            player.OnChange(()=>{
                _commandPublisher.Enqueue(new PlayerStateUpdatedCommand(player,sessionId, _room.SessionId == sessionId));           
            });                 
        }); 

        _room.State.players.OnRemove((sessionId,player)=>{            
            _commandPublisher.Enqueue(new PlayerLeftTheRaceCommand(player,sessionId));
        });        
    }    

    public void ReportFinished(){
        _room.Send("finished");
    }

    public void ReportReady(){
        _room.Send("ready");
    }

    public void ReportMapLoaded(){
        _room.Send("map_loaded");
    }

    public void Sync(Transform transform){
        _room.Send("move",new {
            transform.position.x,
            transform.position.y,
            transform.position.z,
            rotX = transform.rotation.x,
            rotY = transform.rotation.y,
            rotZ = transform.rotation.z,
            rotW = transform.rotation.w,
        });
        Debug.Log("Syncing");
    }

    public void Dispose()
    {
        if(_room != null){
            _room.Leave();
        }
        
    }
}
