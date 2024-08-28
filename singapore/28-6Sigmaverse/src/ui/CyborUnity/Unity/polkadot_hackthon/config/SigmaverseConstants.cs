

public class SigmaverseConstants {
	public const long DEFAULT_CYBOR_NFT_ID = -999;

	private static CyborNFTStream _defaultCybor;
	public static CyborNFTStream DefaultCyborNFTStream ()
	{
		if (_defaultCybor == null) {
			_defaultCybor = new CyborNFTStream ();
			_defaultCybor.RaceName = RaceConfig.RACE1;
			_defaultCybor.BasicDamage = 10;
			_defaultCybor.BasicHP = 1000;
			_defaultCybor.BasicMoveSpeed = 3;
			_defaultCybor.ScorePerBlock = 1;
			_defaultCybor.IsHaveFinishingSkill = false;
			_defaultCybor.MintAt = 0;
			_defaultCybor.Image = "player1";
			_defaultCybor.Level = 1;
			_defaultCybor.Grade = 1;
			_defaultCybor.Lucky = 1;
			_defaultCybor.IsFreeze = true;
		}
		return _defaultCybor;
	}
}
