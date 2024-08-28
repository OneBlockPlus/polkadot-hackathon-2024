using UnityEngine.SceneManagement;
using System.Collections.Generic;
using System.Collections;
using UnityEngine;

public class ChainsData : MonoBehaviour {
	public const string LOGIN_SCENE_NAME = "GameVaranetLogin";
	private static ChainsData cd;

	public static SigmaverseStream SigmaverseState = new (
	    new WalletStream (),
	    new Dictionary<long, CyborNFTStream> ()
	);

	public static List<DelegateWalletUpdate> UpdateWalletDelegates = new ();

	public static List<DelegateBalanceUpdate> UpdateBalanceDelegates = new ();

	public static List<DelegateMyCyborUpdate> UpdateAllMyCyborsDelegates = new ();


	public delegate void DelegateWalletUpdate (string wallet);

	public delegate void DelegateBalanceUpdate (double value);

	public delegate void DelegateMyCyborUpdate (Dictionary<long, CyborNFTStream> newMyCybors);


	void Awake ()
	{
		cd = this;
		DontDestroyOnLoad (gameObject);
	}

	void Start ()
	{
		SceneManager.sceneLoaded += OnSceneLoaded;
	}


	void Update ()
	{
	}


	public static void UpdateWallet (WalletStream newWalletStream)
	{
		if (SigmaverseState.WalletInfo.Address == ""
		    || SigmaverseState.WalletInfo.Address == null
		    || SigmaverseState.WalletInfo.Address == string.Empty) {
			Debug.Log ("WAITING CONNECT WALLET ::: delegates size is " + UpdateWalletDelegates.Count);
		} else {
			if (SigmaverseState.WalletInfo.Address != newWalletStream.Address) {
				Debug.Log ("CURRENT WALLET ::::: " + SigmaverseState.WalletInfo.Address);
				var switching = cd.SwitchToLoginSceneOnChangedWallet ();
				if (switching) {
					Debug.Log ("Switch login scene, " + SigmaverseState.WalletInfo.Address + ":" + newWalletStream.Address);
					return;
				}
			}
		}

		if (SigmaverseState.WalletInfo.Address != newWalletStream.Address) {
			SigmaverseState.WalletInfo.Address = newWalletStream.Address;
			foreach (var d in UpdateWalletDelegates) {
				d (SigmaverseState.WalletInfo.Address);
			}
		}


		if (SigmaverseState.WalletInfo.Balance != newWalletStream.Balance) {
			SigmaverseState.WalletInfo.Balance = newWalletStream.Balance;
			foreach (var d in UpdateBalanceDelegates) {
				d (newWalletStream.Balance);
			}
		}
	}

	public static void FetchAllMyCybors ()
	{
		SigmaUnityChannelProto p = new SigmaUnityChannelProto ();
		p.Act = "wallet_info";
		WebGLChannel.CallReactJS (p.EncodeJson ());
	}


	public static void UpdateAllMyCybors (Dictionary<long, CyborNFTStream> newAllMyCybors)
	{
		var needUpdate = false;

		if (!needUpdate) {
			needUpdate = (newAllMyCybors.Count != SigmaverseState.AllMyCybor.Count);
		}

		if (!needUpdate) {
			foreach (var cyborID in newAllMyCybors.Keys) {
				if (!SigmaverseState.AllMyCybor.ContainsKey (cyborID)) {
					needUpdate = true;
					break;
				} else if (!SigmaverseState.AllMyCybor [cyborID].Equals (newAllMyCybors [cyborID])) {
					needUpdate = true;
					break;
				}
			}
		}
		if (!needUpdate) {
			foreach (var cyborID in SigmaverseState.AllMyCybor.Keys) {
				if (!newAllMyCybors.ContainsKey (cyborID)) {
					needUpdate = true;
					break;
				} else if (!SigmaverseState.AllMyCybor [cyborID].Equals (newAllMyCybors [cyborID])) {
					needUpdate = true;
					break;
				}
			}
		}

		if (needUpdate) {
			SigmaverseState.AllMyCybor = newAllMyCybors;

			foreach (var d in UpdateAllMyCyborsDelegates) {
				d (SigmaverseState.AllMyCybor);
			}
		}
	}

	public static void LogoutToLoginScene ()
	{
		cd.StartCoroutine (cd.CleanUpAndSwitchScene ());
	}


	public bool SwitchToLoginSceneOnChangedWallet ()
	{
		string currentSceneName = SceneManager.GetActiveScene ().name;
		if (currentSceneName != LOGIN_SCENE_NAME) {
			StartCoroutine (CleanUpAndSwitchScene ());
			return true;
		} else {
			ExecuteLoginSceneFunction ();
			return false;
		}
	}

	IEnumerator CleanUpAndSwitchScene ()
	{
		yield return StartCoroutine (PerformCleanup ());
		SceneManager.LoadScene (LOGIN_SCENE_NAME);
	}

	IEnumerator PerformCleanup ()
	{

		// SaveGameState();

		// ReleaseResources();

		// yield return SomeAsyncOperation();

		yield return new WaitForSeconds (1f); // 示例：等待1秒，可以删除或根据需要调整
	}

	void ExecuteLoginSceneFunction ()
	{
		// ....
	}

	void OnSceneLoaded (Scene scene, LoadSceneMode mode)
	{
		Debug.Log ("Scene loaded: " + scene.name);
		if (scene.name == LOGIN_SCENE_NAME) {
			FetchAllMyCybors ();
		}
	}
}
