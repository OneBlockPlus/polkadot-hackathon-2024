using UnityEngine;

[CreateAssetMenu(fileName = "GameSettings", menuName = "ScriptableObjects/GameSettings", order = 1)]
public class GameSettings : ScriptableObject
{
    [SerializeField]
    private GameObject _heroPrefab;

    public GameObject HeroPrefab => _heroPrefab;
    
    [SerializeField]
    private GameObject[] _carsPrefabs;
    public GameObject[] CarPrefabs => _carsPrefabs;


    [SerializeField]
    private GameObject[] _networkCarsPrefabs;
    public GameObject[] NetworkCarPrefabs => _networkCarsPrefabs;
}
