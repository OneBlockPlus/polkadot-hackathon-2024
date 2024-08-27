using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class ImprintStoryTextArea : MonoBehaviour
{
    public List<string> stories = new List<string>
    {
        "In the future era of cosmic exploration, human civilization faces unprecedented challenges. A sudden nuclear war devastated Earth's natural environment, rendering humanity's survival precarious. To endure, humans had to seek new ways of existence and space. Against this backdrop, they formed a grand alliance aimed at guiding humanity toward the stars in search of new homes.",
        "To adapt to the demands of cosmic exploration and escape the ravaged Earth environment, humans embarked on an unprecedented venture: transferring human consciousness into machines through neural interfaces, becoming the new cyborgs. These cyborgs possess mechanical bodies yet retain human consciousness and emotions, becoming pioneers of cosmic exploration.",
        "In this new age, each cyborg is accompanied by a 'miner' – these miners, unlike our conventional understanding of mining machines, are highly intelligent devices specialized in producing bitcoins in the cosmos. Over time, bitcoin has emerged as the universal currency throughout the cosmos, serving not only as a medium of exchange but also as a significant gauge of civilization's developmental level."
    };

    [SerializeField] Text text;
    [SerializeField] TMP_Text tmpProText;
    private string writer;
    private int currentStoryIndex = 0; // 用于跟踪当前故事的索引
    [SerializeField] private Coroutine coroutine;

    [SerializeField] float delayBeforeStart = 0f;
    [SerializeField] public float timeBtwChars = 0.05f;
    [SerializeField] string leadingChar = "";
    [SerializeField] bool leadingCharBeforeDelay = false;
    [Space(10)] [SerializeField] private bool startOnEnable = false;

    [Header("Collision-Based")]
    [SerializeField] private bool clearAtStart = false;
    [SerializeField] private bool startOnCollision = false;
    enum options { clear, complete }
    [SerializeField] options collisionExitOptions;

    void Awake()
    {
        writer = stories[currentStoryIndex];
    }

    void Start()
    {
        if (!clearAtStart) return;
        if (text != null)
        {
            text.text = "";
        }

        if (tmpProText != null)
        {
            tmpProText.text = "";
        }
    }

    public void UpdateStory(List<string> _storys)
    {
        this.stories = _storys;
        this.currentStoryIndex = 0;
        StartTypewriter();
    }

    private void OnEnable()
    {
        if (startOnEnable) StartTypewriter();
    }


    private void OnCollisionEnter2D(Collision2D col)
    {
        if (startOnCollision)
        {
            StartTypewriter();
        }
    }

    private void OnCollisionExit2D(Collision2D other)
    {
        if (collisionExitOptions == options.complete)
        {
            if (text != null)
            {
                text.text = writer;
            }

            if (tmpProText != null)
            {
                tmpProText.text = writer;
            }
        }
        else
        {
            if (text != null)
            {
                text.text = "";
            }

            if (tmpProText != null)
            {
                tmpProText.text = "";
            }
        }

        StopAllCoroutines();
    }

    private void StartTypewriter()
    {
        StopAllCoroutines();

        if (text != null)
        {
            text.text = "";
            StartCoroutine(TypeWriterText());
        }

        if (tmpProText != null)
        {
            tmpProText.text = "";
            StartCoroutine(TypeWriterTMP());
        }
    }

    private void OnDisable()
    {
        StopAllCoroutines();
    }

    IEnumerator TypeWriterText()
    {
        text.text = leadingCharBeforeDelay ? leadingChar : "";

        yield return new WaitForSeconds(delayBeforeStart);

        foreach (char c in writer)
        {
            if (text.text.Length > 0)
            {
                text.text = text.text.Substring(0, text.text.Length - leadingChar.Length);
            }
            text.text += c;
            text.text += leadingChar;
            yield return new WaitForSeconds(timeBtwChars);
        }

        if (leadingChar != "")
        {
            text.text = text.text.Substring(0, text.text.Length - leadingChar.Length);
        }

        UpdateStory();
        yield return null;
    }

    IEnumerator TypeWriterTMP()
    {
        tmpProText.text = leadingCharBeforeDelay ? leadingChar : "";

        yield return new WaitForSeconds(delayBeforeStart);

        foreach (char c in writer)
        {
            if (tmpProText.text.Length > 0)
            {
                tmpProText.text = tmpProText.text.Substring(0, tmpProText.text.Length - leadingChar.Length);
            }
            tmpProText.text += c;
            tmpProText.text += leadingChar;
            yield return new WaitForSeconds(timeBtwChars);
        }

        if (leadingChar != "")
        {
            tmpProText.text = tmpProText.text.Substring(0, tmpProText.text.Length - leadingChar.Length);
        }

        UpdateStory();
        yield return null;
    }

    private void UpdateStory()
    {
        currentStoryIndex = (currentStoryIndex + 1) % stories.Count;
        writer = stories[currentStoryIndex];
        StartTypewriter();
    }
}