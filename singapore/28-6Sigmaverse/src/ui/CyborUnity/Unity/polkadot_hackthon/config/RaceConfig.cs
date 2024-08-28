// class: ShopData
using System;
using System.Collections.Generic;
using UnityEngine;

[Serializable]
public class SerializableDictionary<TKey, TValue>
{
    [SerializeField]
    private List<TKey> keys = new List<TKey>();

    [SerializeField]
    private List<TValue> values = new List<TValue>();

    public Dictionary<TKey, TValue> ToDictionary()
    {
        Dictionary<TKey, TValue> dictionary = new Dictionary<TKey, TValue>();
        for (int i = 0; i < keys.Count; i++)
        {
            dictionary[keys[i]] = values[i];
        }
        return dictionary;
    }
}


[Serializable]
public class StoryConfig
{
    public string Id;

    public string Title;

    public List<string> StoryList;

    public AudioSource MusicFile;

}


[Serializable]
public class AllStoryConfig
{
    public SerializableDictionary<string, StoryConfig> Storys;
}


[CreateAssetMenu(fileName = "race_config", menuName = "GameData/RaceConfig", order = 1)]
[Serializable]
public class RaceConfig : ScriptableObject
{
    public const string RACE1 = "rodriguez";
    public const string RACE2 = "nguyen";

    public SerializableDictionary<string, AllStoryConfig> Storys;
}
