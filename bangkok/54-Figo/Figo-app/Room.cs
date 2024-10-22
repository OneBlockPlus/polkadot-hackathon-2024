using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace FigoApp
{
    public class Room
    {
        [BsonId] // This indicates that this property will be the unique identifier for the document
        public ObjectId Id { get; set; }

        [BsonElement("roomCode")] // Specifies the name of the field in the database
        public string RoomCode { get; set; }

        [BsonElement("host")]
        public string Host { get; set; }

        [BsonElement("players")]
        public List<Player> Players { get; set; } // List to hold players in the room

        // Optional: Add any additional properties you need for the Room
    }

    public class Player
    {
        [BsonElement("serialNumber")]
        public string SerialNumber { get; set; }

        [BsonElement("clicks")]
        public int Clicks { get; set; }
    }
}