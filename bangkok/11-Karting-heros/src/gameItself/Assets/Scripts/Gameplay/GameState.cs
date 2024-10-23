public struct GameState{
    public CharacterLook PlayerCharacterLook;
    public CharacterLook[] Opponents; 
    public bool ConnectedToServer;
    public ulong ServerPing;    
    public int PlayerCoins;    
}