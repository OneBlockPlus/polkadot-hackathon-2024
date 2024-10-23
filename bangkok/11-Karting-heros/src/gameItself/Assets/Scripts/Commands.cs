using VitalRouter;

public struct FindRaceCommand: ICommand{}
public struct RaceFoundCommand: ICommand{
    public OpponentInfo[] opponents{private set;get;}
    public RaceFoundCommand(OpponentInfo[] opponents){
        this.opponents = opponents;
    }

}

public struct PlayerJoinedTheRaceCommand: ICommand
{
    public PlayerState Player{get;private set;}
    public string PlayerSessionId{get;private set;}
    public bool IsPlayer{get;private set;}
    public int PlayerIndex{get;private set;}

    public PlayerJoinedTheRaceCommand(PlayerState player,string playerSessionId,bool isPlayer,int playerIndex)
    {
        Player = player;
        PlayerSessionId = playerSessionId;
        IsPlayer = isPlayer;
        PlayerIndex = playerIndex;
    }
}

public struct PlayerLeftTheRaceCommand : ICommand
{
    public PlayerState Player{get;private set;}
    public string PlayerSessionId{get;private set;}

    public PlayerLeftTheRaceCommand(PlayerState player,string playerSessionId)
    {
        Player = player;
        PlayerSessionId = playerSessionId;
    }
}

public struct PlayerStateUpdatedCommand : ICommand
{
    public PlayerState Player{get;private set;}
    public string PlayerSessionId{get;private set;}
    public bool IsPlayer {get;private set;}

    public PlayerStateUpdatedCommand(PlayerState player,string playerSessionId,bool isPlayer)
    {
        Player = player;
        PlayerSessionId = playerSessionId;
        IsPlayer = isPlayer;
    }
}

public struct PlayerReadyCheckCommand: ICommand{}
public struct PlayerReportReadyCommand: ICommand{}
public struct PlayerIsReadyCommand: ICommand{
    public string SessionId{get;private set;}

    public PlayerIsReadyCommand(string sessionId){
        SessionId = sessionId;
    }
}


public struct GameFinishedCommand: ICommand{}
public struct GameStartedCommand: ICommand{}
public struct StartCountdownCommand: ICommand{}
public struct UpdateCountdownCommand: ICommand{
    public int Time{get;private set;}
    public UpdateCountdownCommand(int time){
        Time = time;
    }
}
public struct LoadMapCommand: ICommand{}

public struct SpawnPlayerCarCommand: ICommand{
    public string PlayerSessionId{get;private set;}
    public bool IsPlayer {get;private set;}

    public SpawnPlayerCarCommand(string playerSessionId,bool isPlayer)
    {
        PlayerSessionId = playerSessionId;
        IsPlayer = isPlayer;
    }
}