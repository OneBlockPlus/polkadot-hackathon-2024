using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using UnityEngine;
using System.Collections;
using Newtonsoft.Json.Linq;
//using Org.BouncyCastle.Utilities;

[Serializable]
public class SigmaverseStream
{
    public WalletStream WalletInfo { get; set; }
    public Dictionary<long, CyborNFTStream> AllMyCybor { get; set; }
    public CyborNFTStream CurrentSelectCyborNFT { get; set; }
    public Dictionary<long, object> owner_by_id { get; set; }

    public SigmaverseStream(WalletStream w, Dictionary<long, CyborNFTStream> allCybors) {
        this.WalletInfo = w;
        this.WalletInfo.Address = string.Empty;
        this.AllMyCybor = allCybors;
    }
}

[Serializable]
public class WalletStream
{
    public string Address { get; set; }

    private double _coins;
    public double Balance{
        get
        {
            return _coins;
        }
        set
        {
            _coins = value;
            if (GameData.NumGemChanged != null)
            {
                GameData.NumGemChanged();
            }
        }
    }
}

[Serializable]
public class CyborNFTStream
{
    public string RaceName { get; set; }
    public long BasicDamage { get; set; }
    public long BasicHP { get; set; }
    public int BasicMoveSpeed { get; set; }
    public int BasicKnockdownHit { get; set; }
    public int ScorePerBlock { get; set; }
    public bool IsHaveFinishingSkill { get; set; }
    public long MintAt { get; set; }
    public string Image { get; set; }
    public int Level { get; set; }
    public int Grade { get; set; }
    public int Lucky { get; set; }
    public bool IsFreeze { get; set; }

    public override int GetHashCode()
    {
        string combinedProperties = $"{RaceName}{BasicDamage}{BasicHP}{BasicMoveSpeed}{BasicKnockdownHit}" +
                                    $"{ScorePerBlock}{IsHaveFinishingSkill}{MintAt}{Image}{Level}{Grade}{Lucky}{IsFreeze}";
        return combinedProperties.GetHashCode();
    }

    public override bool Equals(object obj)
    {
        if (obj is CyborNFTStream other)
        {
            return this.RaceName == other.RaceName &&
                   this.BasicDamage == other.BasicDamage &&
                   this.BasicHP == other.BasicHP &&
                   this.BasicMoveSpeed == other.BasicMoveSpeed &&
                   this.BasicKnockdownHit == other.BasicKnockdownHit &&
                   this.ScorePerBlock == other.ScorePerBlock &&
                   this.IsHaveFinishingSkill == other.IsHaveFinishingSkill &&
                   this.MintAt == other.MintAt &&
                   this.Image == other.Image &&
                   this.Level == other.Level &&
                   this.Grade == other.Grade &&
                   this.Lucky == other.Lucky &&
                   this.IsFreeze == other.IsFreeze;
        }
        return false;
    }

}
