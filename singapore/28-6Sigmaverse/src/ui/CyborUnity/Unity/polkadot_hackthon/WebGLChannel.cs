using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using UnityEngine;
using System.Runtime.InteropServices;

public class WebGLChannel : MonoBehaviour
{

    [DllImport("__Internal")]
	private static extern void CallReactFunction2(string message);

	void Awake()
	{
		DontDestroyOnLoad(gameObject);
	}

    private void Start()
    {
    }

    public void WaitReactCallMe(string message)
	{
        SigmaUnityChannelProto msg = (SigmaUnityChannelProto)JsonConvert.DeserializeObject(message, typeof(SigmaUnityChannelProto));
        Debug.Log(message + "####" + msg.Act + "::::::" + msg.Resp);

        msg.DecodcJson();
    }

	public static void CallReactJS(string _msg)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
		try
		{
            CallReactFunction2(_msg);
		}
		catch (System.Exception e)
		{
			Debug.LogError("CallReactFunction err: " + e.Message);
		}
#endif
    }
}

[Serializable]
public class SigmaUnityChannelProto
{
	public string Act { get; set; }
	public Dictionary<string, object> Req { get; set; }
	public string Resp { get; set; }

    public string EncodeJson()
    {
        // TODO Encrypt this.req
        var reqStr = JsonConvert.SerializeObject(this.Req);

        var r = new Dictionary<string, string>
        {
            ["act"] = this.Act,
            ["req"] = reqStr
        };
        return JsonConvert.SerializeObject(r);
    }

    public object DecodcJson()
    {
        // TODO Decrypt this.resp

        switch (this.Act)
        {
            case "wallet_info":
                WalletStream msg = (WalletStream)JsonConvert.DeserializeObject(this.Resp, typeof(WalletStream));
                ChainsData.UpdateWallet(msg);
                return msg;

            case "all_my_cybors":
                var c = (Dictionary<long, CyborNFTStream>)JsonConvert.DeserializeObject(this.Resp, typeof(Dictionary<long, CyborNFTStream>));
                ChainsData.UpdateAllMyCybors(c);
                return c;

            default:
                return null;
        }
    }
}
