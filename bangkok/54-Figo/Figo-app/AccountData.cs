using MongoDB.Bson.Serialization.Attributes;
namespace FigoApp;

public class AccountData
{
    [BsonId]
    public string Id { get; set; }  // This will be "uid_gearId"
    
    [BsonElement("gearID")]
    public string GearId { get; set; }  // The ID of the gear being referenced
    
    [BsonElement("gearType")]
    public string GearType { get; set; }
    
    [BsonElement("unlocked_status")]
    public bool Unlocked { get; set; }  // Whether the user has unlocked it
    
    [BsonElement("equipped_status")]
    public bool Equipped { get; set; }  // Whether the gear is currently equipped
    
    [BsonElement("purchased_time")]
    public DateTime PurchaseDate { get; set; }  // Date of purchase
    
    [BsonElement("unlocked_url")]
    public string UnlockedUrl { get; set; }
    
}
