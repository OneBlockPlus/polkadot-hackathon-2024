using System.Collections;
using System.Collections.Generic;
using System.Threading;
using Cysharp.Threading.Tasks;
using UnityEditor.SearchService;
using UnityEngine;
using UnityEngine.SceneManagement;
using VContainer;
using VContainer.Unity;
using VitalRouter;

public class GameEntryPoint : IAsyncStartable
{

    private NetworkManager _networkManager;

    public GameEntryPoint(NetworkManager networkManager){
        _networkManager = networkManager;
        // Load hero look from wallet NFT
        // var newHero = heroFactory.Create();                
    }

    public async UniTask StartAsync(CancellationToken cancellation = default)
    {
        // await LoadMainMenuAsync();        
    }
    // private async UniTask LoadMainMenuAsync(){
    //     await SceneManager.UnloadSceneAsync("GameScene");
    //     await SceneManager.LoadSceneAsync("Mainmenu",LoadSceneMode.Additive);       
    // }

    // private async UniTask LoadGameAsync(){
    //     await SceneManager.UnloadSceneAsync("Mainmenu");
    //     await SceneManager.UnloadSceneAsync("GameScene"); 
    // }   
}
