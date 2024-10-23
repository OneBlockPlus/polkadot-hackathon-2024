using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace FigoApp;

public class Beam
{
    [BsonId]
    public string Id { get; set; }
    
    [BsonElement("name")]
    public string Name { get; set; }

    [BsonElement("description")]
    public string Description { get; set; }
    
    [BsonElement("unlocked")]
    public bool unlocked { get; set; }
    
    [BsonElement("equipped")]
    public bool Equipped { get; set; }
    
    [BsonElement("unlocked_imageUrl")]
    public string unlockedimageUrl { get; set; }
    
}