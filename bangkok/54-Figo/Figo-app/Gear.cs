using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace FigoApp;

public class Gear
{
    [BsonId]
    public string Id { get; set; }
    
    [BsonElement("name")]
    public string Name { get; set; }

    [BsonElement("price")]
    public string Price { get; set; }

    [BsonElement("description")]
    public string Description { get; set; }
    
    [BsonElement("slot")]
    public string Slot { get; set; }
    
    [BsonElement("unlocked")]
    public bool unlocked { get; set; }
    
    [BsonElement("image_url")]
    public string imageUrl { get; set; }
    
    [BsonElement("unlocked_url")]
    public string unlockedUrl { get; set; }
    
}