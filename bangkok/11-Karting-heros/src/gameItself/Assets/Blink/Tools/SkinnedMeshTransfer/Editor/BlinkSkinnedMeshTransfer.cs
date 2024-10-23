using System.Linq;
using UnityEditor;
using UnityEngine;

public class BlinkSkinnedMeshTransfer : EditorWindow
{
    private ScriptableObject scriptableObj;
    private SerializedObject serialObj;
    
    public SkinnedMeshRenderer[] skinnedMeshRenderersList;
    public Transform newArmature;
    public Transform newParent;

    private Vector2 viewScrollPosition;
    
    [MenuItem("BLINK/Skinned Mesh Transfer")]
    private static void OpenWindow()
    {
        var window = (BlinkSkinnedMeshTransfer) GetWindow(typeof(BlinkSkinnedMeshTransfer), false, "Skinned Mesh Transfer");
        window.minSize = new Vector2(400, 500);
        GUI.contentColor = Color.white;
        window.Show();
    }

    private void OnEnable()
    {
        scriptableObj = this;
        serialObj = new SerializedObject(scriptableObj);
    }
    
    private void OnGUI()
    {
        DrawMain();
    }

    private void DrawMain()
    {
        viewScrollPosition = EditorGUILayout.BeginScrollView(viewScrollPosition, false, false);
        
        var serialProp = serialObj.FindProperty("skinnedMeshRenderersList");
        EditorGUILayout.PropertyField(serialProp, true);
        
        GUILayout.Space(7);
        newArmature = (Transform) EditorGUILayout.ObjectField("New Armature (Hips)", newArmature, typeof(Transform), true);
        GUILayout.Space(7);
        newParent = (Transform) EditorGUILayout.ObjectField("New Parent", newParent, typeof(Transform), true);
        GUILayout.Space(15);
        
        if (GUILayout.Button("TRANSFER", GUILayout.MinWidth(150), GUILayout.MinHeight(30), GUILayout.ExpandWidth(true)))
        {
            TransferSkinnedMeshes();
        }
        
        serialObj.ApplyModifiedProperties();
        
        GUILayout.Space(20);
        GUILayout.EndScrollView();
    }

    private void TransferSkinnedMeshes()
    {
        foreach (var t in skinnedMeshRenderersList)
        {
            string cachedRootBoneName = t.rootBone.name;
            var newBones = new Transform[t.bones.Length];
            for (var x = 0; x < t.bones.Length; x++)
                foreach (var newBone in newArmature.GetComponentsInChildren<Transform>())
                    if (newBone.name == t.bones[x].name)
                    {
                        newBones[x] = newBone;
                    }

            Transform matchingRootBone = GetRootBoneByName(newArmature, cachedRootBoneName);
            t.rootBone = matchingRootBone != null ? matchingRootBone : newArmature.transform;
            t.bones = newBones;
            Transform transform;
            (transform = t.transform).SetParent(newParent);
            transform.localPosition = Vector3.zero;
        }
        
    }

    static Transform GetRootBoneByName(Transform parentTransform, string name)
    {
        return parentTransform.GetComponentsInChildren<Transform>().FirstOrDefault(transformChild => transformChild.name == name);
    }
}
