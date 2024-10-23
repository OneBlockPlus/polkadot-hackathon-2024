using System.Buffers.Text;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using KartGame.AI;
using Newtonsoft.Json;
using Unity.AI.Navigation;
using UnityEditor;
using UnityEngine;
using UnityEngine.AI;
using UnityEngine.SceneManagement;
using UnityEngine.UIElements;

public class MapExporterEditor : EditorWindow
{
    [MenuItem("Karting Heroes/Export Map")]
    public static void Export(){
        var wnd = GetWindow<MapExporterEditor>();
        wnd.titleContent = new GUIContent("Export Map");
    }

    [SerializeField]
    private VisualTreeAsset m_UXMLTree = default;

    public void CreateGUI()
    {
        var content = m_UXMLTree.Instantiate();
        rootVisualElement.Add(content);

        var exportButton = rootVisualElement.Q<Button>("exportButton");
        exportButton.RegisterCallback<ClickEvent>(Export);
    }

    private void Export(ClickEvent e){
        // var navmesh = FindObjectsByType<NavMeshSurface>(FindObjectsSortMode.None);
        var navmesh =  NavMesh.CalculateTriangulation();

        var worldLaps = FindObjectsByType<LapObject>(FindObjectsSortMode.None);
        var worldCheckpoints = FindObjectsByType<Checkpoint>(FindObjectsSortMode.None);
        var worldFinishLap = worldLaps.FirstOrDefault(l=>l.finishLap) ?? worldLaps.FirstOrDefault(l=>!l.finishLap);
        var worldStartLap = worldLaps.FirstOrDefault(l=>!l.finishLap) ?? worldLaps.FirstOrDefault(l=>l.finishLap);

        if(worldFinishLap == null){
            EditorUtility.DisplayDialog("Error!","World finish lap not found!","OK");
            return;
        }
        if(worldStartLap == null){
            EditorUtility.DisplayDialog("Error!","World start lap not found!","OK");
            return;
        }

        var mapData = JsonConvert.SerializeObject(new {
            navmesh = new {
                navmesh.indices,
                vertices = navmesh.vertices.Select(v=>new {
                    v.x,
                    v.y,
                    v.z
                }).ToArray(),
                navmesh.areas
            },
            checkpoints = worldCheckpoints.OrderBy(c=>c.index).Select(c=> new {
                center = new SerializableVec3(c.GetComponent<BoxCollider>().bounds.center) ,
                extents = new SerializableVec3(c.GetComponent<BoxCollider>().bounds.extents)
            }).ToArray(),
            finishLap = new {
                center = new SerializableVec3(worldFinishLap.GetComponent<BoxCollider>().bounds.center) ,
                extents = new SerializableVec3(worldFinishLap.GetComponent<BoxCollider>().bounds.extents) ,
            },
            startLap = worldStartLap != null ? new {
                center = new SerializableVec3(worldStartLap.GetComponent<BoxCollider>().bounds.center) ,
                extents = new SerializableVec3(worldStartLap.GetComponent<BoxCollider>().bounds.extents) ,
            } : null,
        } , Formatting.Indented);
        string filename = EditorUtility.SaveFilePanel("Export map data","",SceneManager.GetActiveScene().name,"json");
        using (var outputFile = File.Open(filename,FileMode.OpenOrCreate)){
            var dataBytes = Encoding.UTF8.GetBytes(mapData);
            outputFile.Write(dataBytes,0,dataBytes.Length);
        }                                

        EditorUtility.DisplayDialog("Saved!","Map data saved!","OK");
    }

    struct SerializableVec3{
        public SerializableVec3(Vector3 data){
            x = data.x;
            y = data.y;
            z = data.z;
        }
        public float x,y,z;
    }
}