using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;
using VContainer;
using VitalRouter;

// [RequireComponent(typeof(UIDocument))]
public class MainMenuController : MonoBehaviour 
{
    

    public class OpponentInfoWidget{
        public VisualElement rootElement;
        public VisualElement checkMark;
        public VisualElement profilePicture;
        public Label playerName;
    }

    

    public class PlayerInfoWidget{
        public VisualElement profilePicture;
        public Label playerName;
        public Label cups;
        public VisualElement xpProgress;
    }

    private NetworkManager _networkManager;

    private UIDocument _document;
    private Button _findRaceButton;

    private List<OpponentInfoWidget> _opponentInfoWidgets = new();
    private PlayerInfoWidget _playerInfoWidget = new();
    private ICommandPublisher _commandPublisher;

    private bool _checkReady;
        
    
    [Inject]
    public void Init(NetworkManager networkManager,ICommandPublisher commandPublisher){
        _networkManager = networkManager;
        _commandPublisher = commandPublisher;

        // _opponentInfoWidgets = new List<OpponentInfoWidget>();
        // _playerInfoWidget = new PlayerInfoWidget();
        _checkReady  = false;

        Debug.Log("Injected!");
    }

   
    private void  Start(){    
        _document = GetComponent<UIDocument>();                

        Debug.Log(_document);
        Debug.Log("Hello world!"); 

        var playerInfoContainer = _document.rootVisualElement.Q<VisualElement>("info");
        _playerInfoWidget = new PlayerInfoWidget(){            
            profilePicture = playerInfoContainer.Q<VisualElement>("profilePicture"),
            cups = playerInfoContainer.Q<Label>("cups"),
            playerName = playerInfoContainer.Q<Label>("playerName"),
            xpProgress = playerInfoContainer.Q<VisualElement>("progress")
        };        
        
        var opponentsContainer = _document.rootVisualElement.Q<VisualElement>("opponentsContainer");
        foreach(var opponent in opponentsContainer.Children()){
            opponent.style.visibility = Visibility.Hidden;
            _opponentInfoWidgets.Add(
                new OpponentInfoWidget{
                    rootElement = opponent,
                    checkMark =  opponent.Q<VisualElement>("checkmark"),
                    profilePicture = opponent.Q<VisualElement>("profile"),
                    playerName =  opponent.Q<Label>("playerName")
                }
            );
        }
        
        _findRaceButton = _document.rootVisualElement.Q<Button>("raceButton");
        _findRaceButton.RegisterCallback<ClickEvent>(OnFindRaceButtonClicked);     

          
    }    

    public void LoadPlayerData(PlayerInfo playerData){
        UpdatePlayer(_playerInfoWidget,playerData);
    }

    public void LoadOpponentData(int index, OpponentInfo opponentData){
        Debug.Log($"Opponent {index} is now visible");        
        UpdateOpponent(_opponentInfoWidgets[index],opponentData);
    }

    private void UpdatePlayer(PlayerInfoWidget widget,PlayerInfo data){
        widget.profilePicture.style.backgroundImage = data.avatar;
        widget.cups.text = data.cups.ToString();
        widget.playerName.text = data.name;
        widget.xpProgress.style.width = new Length(data.xp,LengthUnit.Percent) ;
        _findRaceButton.text =  data.isReady? "READY":"FIND RACE";
    }

    private void UpdateOpponent(OpponentInfoWidget widget, OpponentInfo data){
        widget.rootElement.style.visibility = Visibility.Visible;   
        widget.profilePicture.style.backgroundImage = data.avatar;
        widget.playerName.text = data.name;
        widget.checkMark.style.visibility = data.isReady ? Visibility.Visible: Visibility.Hidden;
    }

    private void OnFindRaceButtonClicked(ClickEvent evt)
    {
        if(_checkReady){
            _findRaceButton.text = "I'M READY";
            _commandPublisher.Enqueue(new PlayerReportReadyCommand());
        }else{
            _findRaceButton.text = "FINDING RACE";          
            _commandPublisher.Enqueue(new FindRaceCommand());
        }
    }    

    public void ReadyCheck(){
        _findRaceButton.text = "READY";
        _checkReady = true;
    }
   
}
