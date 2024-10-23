using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CharacterPreview : MonoBehaviour
{
    [SerializeField]
    private RenderTexture _characterPreview;
    private Texture2D _characterPreviewTexture;    


    
    public Texture2D Texture =>_characterPreviewTexture;

    private void Awake(){
        _characterPreviewTexture = new Texture2D(_characterPreview.width,_characterPreview.height, TextureFormat.ARGB32, false);
    }

    private void Update(){
        Graphics.CopyTexture(_characterPreview,_characterPreviewTexture);
    }    

    
}
