using MongoDB.Bson.Serialization.Attributes;
namespace FigoApp;

public class Account
{
    [BsonId]
    public string UiD { get; set; }

    [BsonElement("wallet_addr")]
    public string WalletAddr { get; set; }
    
    [BsonElement("coin_balance")]
    public int CoinBalance { get; set; }
}