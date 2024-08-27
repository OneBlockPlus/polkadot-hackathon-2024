// class: AchievementPage
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using DG.Tweening;




public class StoryNFTCardPage : PageBase
{
	public Material holdOnLineMaterial;
	public Material buttonMaterial;
	public Material CyborNFTOrgMaterial;

	public Image holdOnLine;
	public Image NPCHead;
	public Image PanelBorder;
	public Image PanelTopLine;
	public Image Bg;
	public Text PowerText;

	public Button MiningButton;

	public Color HoldOnColor;

	public Image storyPanelNPCImg;
	public Image storyTxtBG;

	private Color _orgBGColor;
	private Tweener tweener;

	public TextMesh storyTitleText;
	public ImprintStoryTextArea storyText;
	private float orgStoryTextSpeed;

	public RaceConfig raceConfig;

	private int currentIndex = 0;
	public List<string> storyProgress = new List<string>();

    public override void ONShow() {
		NPCHead.sprite = storyPanelNPCImg.sprite;
	}

	public void Start()
    {
		_orgBGColor = Bg.color;

		holdOnLine.color = Color.yellow;
		PanelTopLine.color = Color.yellow;
		PanelBorder.color = Color.yellow;
		orgStoryTextSpeed = storyText.timeBtwChars;
	}

	public void OnLastStory()
    {

    }

	public void OnNextStory()
    {

    }


    public void ButtonBackClick()
	{
		SoundController.PlaySoundEffect(SoundController.Instance.TapButton);
		this.Hide();

		if (PageManager.Instance.eyesParticleSystem != null){
			PageManager.Instance.eyesParticleSystem.SetActive(true);
		}
	}

	public override void OnBackButtonClick()
	{
		this.ButtonBackClick();
	}

	private string startValue = "Recall power: 92";
	private string endValue = "Recall power: 98";


	public void HoldOn()
	{
		//Debug.Log("on");
		Sequence sequence = DOTween.Sequence();

		storyText.timeBtwChars = 0.02f;

		sequence.Append(NPCHead.DOColor(HoldOnColor, 0.2f));
		NPCHead.material = holdOnLineMaterial;

		// ...
	}

	public void HoldOff()
	{
		storyText.timeBtwChars = orgStoryTextSpeed;
		startValue = "Recall power: 92";
		endValue = "Recall power: 98";
		if (tweener != null && tweener.IsActive())
		{
			tweener.Kill();
		}

		DOTween.CompleteAll();
		//Debug.Log("off");
		NPCHead.color = Color.white;
		MiningButton.image.material = null;
		NPCHead.material = CyborNFTOrgMaterial;

		// ...

		// Sync to server
	}
}
