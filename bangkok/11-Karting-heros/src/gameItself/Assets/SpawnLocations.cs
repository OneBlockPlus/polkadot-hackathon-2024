using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class SpawnLocations : MonoBehaviour
{
    
    public Transform[] Spots => getSpawnSpots().ToArray();
    private IEnumerable<Transform> getSpawnSpots(){        
        for(int i=0;i<transform.childCount;i++){
            yield return transform.GetChild(i);
        }        
    }
    
    
}
