using System;
using System.Collections.Concurrent;
using Cysharp.Threading.Tasks;
using UnityEngine;
using UnityEngine.SceneManagement;
using VContainer.Unity;
using VitalRouter;

[Routes]
public partial class MainMenuEvents{
    private NetworkManager _networkManager;
    private MainMenuController _mainMenuController;

    public MainMenuEvents(NetworkManager networkManager,MainMenuController mainMenuController){
        _networkManager = networkManager;
        _mainMenuController = mainMenuController;
    }

    public async UniTask On(FindRaceCommand cmd){
        await  _networkManager.FindRace();
    }

    public void On(RaceFoundCommand cmd){
        Debug.Log($"Race found with {cmd.opponents.Length} opponents in it! updating UI!");
        for(int i=0;i< cmd.opponents.Length;i++){
            _mainMenuController.LoadOpponentData(i,cmd.opponents[i]);
        }        
    }

    public void On(PlayerReadyCheckCommand cmd){
        _mainMenuController.ReadyCheck();
    }


    public void On(PlayerReportReadyCommand cmd){
        _networkManager.ReportReady();
    }

    public async UniTask On(LoadMapCommand cmd){
        await SceneManager.LoadSceneAsync("OurIsland");
    }
} 