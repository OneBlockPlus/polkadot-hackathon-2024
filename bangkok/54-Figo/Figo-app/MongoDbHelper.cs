using MongoDB.Driver;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using _Microsoft.Android.Resource.Designer;
using Android.Locations;
using Android.Provider;
using MongoDB.Bson;

namespace FigoApp;

public class MongoDbHelper
{
    IMongoCollection<Gear> gearsCollection;
    IMongoCollection<Account> accountsCollection;
    IMongoCollection<AccountData> accountDataCollection;
    IMongoCollection<Room> roomsCollection;
    MongoClient _client;
    IMongoDatabase _database;

    public MongoDbHelper()
    {
        // MongoDB connection string
        string connectionString = "mongodb://boey:jbDcygMSPg9g6NL2@figo-app-shard-00-00.1kzii.mongodb.net:27017,figo-app-shard-00-01.1kzii.mongodb.net:27017,figo-app-shard-00-02.1kzii.mongodb.net:27017/?authSource=admin&ssl=true&retryWrites=true&w=majority&appName=Figo-App";
    
        // Initialize the MongoDB client
        _client = new MongoClient(connectionString);
        
    }

    public void SelectGearsDatabase_Collection()
    {
        
        // Select the database
        _database = _client.GetDatabase("gears_db"); // Ensure the database name is correct

        // Select the collection
        gearsCollection = _database.GetCollection<Gear>("gears"); // Ensure the collection name is correct
    }

    public void SelectAccountsDatabase_Collection()
    {
        _database = _client.GetDatabase("accounts_db");
        
        accountsCollection = _database.GetCollection<Account>("accounts");
        
    }

    public void SelectRoomDatabase_Collection()
    {
        _database = _client.GetDatabase("rooms_db");
        roomsCollection = _database.GetCollection<Room>("rooms");
    }
    
    
    public List<AccountData> GetAccountDataBySlot(string uid, string gearSlot)
    {
        _database = _client.GetDatabase("accountsdata_db");
        accountDataCollection = _database.GetCollection<AccountData>("accountsdata");

        // Create a filter that checks for both uid in _id and gearType (gearSlot)
        var filter = Builders<AccountData>.Filter.Regex("_id", new BsonRegularExpression(uid, "i")) // Case-insensitive match on uid
                     & Builders<AccountData>.Filter.Regex("gearType", new BsonRegularExpression(gearSlot, "i")); // Case-insensitive match on gearSlot

        // Return all documents that match the filter as a list
        return accountDataCollection.Find(filter).ToList();
    }

    
    public List<AccountData> GetUnlockedGearsBySlot(string uid, string gearSlot)
    {
        // Access the database and the "accountsdata" collection
        _database = _client.GetDatabase("accountsdata_db");
        accountDataCollection = _database.GetCollection<AccountData>("accountsdata");

        // Create the filter to match the uid and gearType (gearSlot)
        var idFilter = Builders<AccountData>.Filter.Regex("Id", new BsonRegularExpression($"^{Regex.Escape(uid)}_")); // Matches "uid_" followed by anything
        var gearTypeFilter = Builders<AccountData>.Filter.Eq("gearType", gearSlot);
        var unlockedStatusFilter = Builders<AccountData>.Filter.Eq("unlocked_status", true);

        // Combine the filters
        var filter = Builders<AccountData>.Filter.And(idFilter, gearTypeFilter, unlockedStatusFilter);

        // Fetch the list of unlocked gears that match the filter
        var unlockedGears = accountDataCollection.Find(filter).ToList();

        return unlockedGears;
    }

    public void EquipGear(string uid, string gearId)
    {
        // Access the database and the "accountsdata" collection
        _database = _client.GetDatabase("accountsdata_db");
        accountDataCollection = _database.GetCollection<AccountData>("accountsdata");

        // Create the filter to find the specific gear for the user
        var filter = Builders<AccountData>.Filter.Eq("Id", uid + "_" + gearId);
    
        // Create an update definition to set equipped_status to true
        var update = Builders<AccountData>.Update.Set("equipped_status", true);

        // Update the document in the database
        accountDataCollection.UpdateOne(filter, update);
    }

    public void UnequipGear(string uid, string gearId)
    {
        // Access the database and the "accountsdata" collection
        _database = _client.GetDatabase("accountsdata_db");
        accountDataCollection = _database.GetCollection<AccountData>("accountsdata");

        // Create the filter to find the specific gear using uid (which is a combination of serialNumber and gearId)
        var filter = Builders<AccountData>.Filter.Eq("Id", uid + "_" + gearId);
    
        // Create an update definition to set equipped_status to false
        var update = Builders<AccountData>.Update.Set("equipped_status", false);

        // Update the document in the database
        accountDataCollection.UpdateOne(filter, update);
    }
    
    public async Task<Room> GetRoom(string roomCode)
    {
        var filter = Builders<Room>.Filter.Eq(r => r.RoomCode, roomCode);
        return await roomsCollection.Find(filter).FirstOrDefaultAsync();
    }


    
    public void AddAccount(String serialNumber, string walletAddress)
    {
        
        var accounts = new List<Account>
        {
            new Account{UiD = serialNumber, CoinBalance = 500, WalletAddr = walletAddress}
        };
        accountsCollection.InsertMany(accounts);
    }
    
    public void BuyGear(string uid, Gear gear)
    {
        if (gear == null)
        {
            Console.WriteLine("Gear not provided.");
            return;
        }

        // Switch to the accounts database and collection
        _database = _client.GetDatabase("accountsdata_db");
        accountDataCollection = _database.GetCollection<AccountData>("accountsdata");

        // Check if the user already owns the gear
        var existingAccountData = accountDataCollection.Find(ad => ad.Id == $"{uid}_{gear.Id}").FirstOrDefault();

        if (existingAccountData != null)
        {
            Console.WriteLine($"User '{uid}' already owns gear '{gear.Name}'.");
            return; // Exit the method to prevent duplicate purchase
        }

        // Create a new account data entry with the reference to the gearId
        var newAccountData = new AccountData
        {
            Id = $"{uid}_{gear.Id}",  // Unique entry for this user and gear
            GearId = gear.Id,  // Store only the gearId
            GearType= gear.Slot,
            Unlocked = true,  // Set unlocked status
            Equipped = false,   // Initially not equipped
            PurchaseDate = DateTime.UtcNow,  // Record the purchase date
            UnlockedUrl = gear.unlockedUrl
        };

        // Insert into account_data collection
        accountDataCollection.InsertOne(newAccountData);

        Console.WriteLine($"Gear '{gear.Name}' purchased for user '{uid}'.");
    }
    
    public bool IsGearEquipped(string gearID, string gearType)
    {
        // Access the database and the "accountsdata" collection
        _database = _client.GetDatabase("accountsdata_db");
        var accountDataCollection = _database.GetCollection<AccountData>("accountsdata");

        // Create a filter to find equipped gear for the specified serial number and gear type
        var filter = Builders<AccountData>.Filter.And(
            Builders<AccountData>.Filter.Eq("_id", gearID), // Filter by serial number (which is a string)
            Builders<AccountData>.Filter.Eq("gearType", gearType), // Filter by gear type
            Builders<AccountData>.Filter.Eq("equipped_status", true) // Check if equipped_status is true
        );

        // Count documents that match the filter
        var equippedGearCount = accountDataCollection.CountDocuments(filter);

        // Return true if any equipped gear is found, otherwise false
        return equippedGearCount > 0;
    }
    
    public AccountData GetEquippedGearBySlot(string serialNumber, string gearType)
    {
        // Assuming you have a method to connect to your MongoDB and get the collection
        _database = _client.GetDatabase("accountsdata_db");
        var accountDataCollection = _database.GetCollection<AccountData>("accountsdata");

        // Create a filter to find the equipped gear for the specified serialNumber and gearType
        var filter = Builders<AccountData>.Filter.And(
            Builders<AccountData>.Filter.Regex("_id", new BsonRegularExpression(new Regex(serialNumber, RegexOptions.IgnoreCase))),
            Builders<AccountData>.Filter.Eq("gearType", gearType),
            Builders<AccountData>.Filter.Eq("equipped_status", true) // Assuming this is the field for equipped gear
        );

        // Find the first document that matches the filter
        var equippedGear = accountDataCollection.Find(filter).FirstOrDefault();

        return equippedGear; // Return the equipped gear data or null if not found
    }



    public void AddGears()
    {
        var gears = new List<Gear>
        {
            new Gear { Id="bomb001", Name = "Moon Bomb", Price = "50 FGC", Description = "Why just light up the sky when you can blow it up?", Slot="Weapon", unlocked  = false, imageUrl = "https://github.com/user-attachments/assets/38ced93a-e54e-4455-9c18-ab94c31446c3", unlockedUrl = "https://github.com/user-attachments/assets/4891ca7f-1816-4588-83f1-4c646af0206b"},
            new Gear { Id="bomb002", Name = "Bolt Bomb", Price = "50 FGC", Description = "Ever wanted to zap your enemies with the power of Zeus himself?", Slot="Weapon", unlocked  = false, imageUrl = "https://github.com/user-attachments/assets/5e0cd6dd-87fb-457b-b502-6e09e628cf0d", unlockedUrl = "https://github.com/user-attachments/assets/a8797a2c-53d4-4b21-889f-b2fd753b7346" },
            new Gear { Id="bomb003", Name = "Polkadot Bomb", Price = "50 FGC", Description = "Fashion meets destruction with the Polkadot Bomb!", Slot="Weapon" , unlocked= false, imageUrl = "https://github.com/user-attachments/assets/4b0f62e1-0114-405c-a478-b71dd990162b", unlockedUrl = "https://github.com/user-attachments/assets/e4dcd2df-ca37-4fe5-bab5-78f22eeb973b"},
            new Gear { Id="bomb004", Name = "Wave Bomb", Price = "50 FGC", Description = "Catch the ultimate wave of chaos with the Wave Bomb!", Slot="Weapon", unlocked = false, imageUrl = "https://github.com/user-attachments/assets/0783b783-b225-44df-a9d7-9de5ee82aab9", unlockedUrl = "https://github.com/user-attachments/assets/a26356b6-006e-49d9-9f7e-c24aa3803456" },
            new Gear { Id="equipment001", Name = "Datapad", Price = "120 FGC", Description = "Your trusty intergalactic sidekick! ", Slot="Equipment", unlocked = false,  imageUrl = "https://github.com/user-attachments/assets/fd01a345-c395-4c42-8d83-0eacb0d87837", unlockedUrl = "https://github.com/user-attachments/assets/023640af-e4e9-4745-88f0-4a95e9f0a551"},
            new Gear { Id="equipment002", Name = "Utility Belt", Price = "100 FGC", Description = "It’s like having a Swiss Army knife, but for your entire space suit!", Slot="Equipment", unlocked = false,  imageUrl = "https://github.com/user-attachments/assets/d5741ab8-4ec6-4dac-a243-15c300ffd84f", unlockedUrl = "https://github.com/user-attachments/assets/6a052317-ad77-4bbf-9613-3aa6100d4d88"},
            new Gear { Id="equipment003", Name="Oxygen Tank", Price="120 FGC", Description = "Perfect for space adventures and avoiding awkwardly timed gasps in the vacuum of space.", Slot="Equipment", unlocked = false,  imageUrl = "https://github.com/user-attachments/assets/8b5ce64a-a00e-4f66-81af-53fbf83e7e86", unlockedUrl = "https://github.com/user-attachments/assets/e51ab5d5-05ca-4d21-bd8d-f4d2baad5d2e"},
            new Gear { Id="footwear001", Name="Space Boots", Price="140 FGC", Description = "Designed for moonwalking, asteroid hopping, and intergalactic dance-offs.", Slot="Footwear", unlocked = false,  imageUrl = "https://github.com/user-attachments/assets/dd667ac7-2706-4ba6-89f6-5fe5e4f6420b", unlockedUrl = "https://github.com/user-attachments/assets/27b6b0cf-c2b1-4960-9d41-275e1e028b6a"}
           
        };
        
        gearsCollection.InsertMany(gears);
    }
    
    public string CreateRoom(string hostSerialNumber, string roomCode)
    {
        _database = _client.GetDatabase("roomdata_db");
        roomsCollection = _database.GetCollection<Room>("roomdata");

        // Create a new Room instance
        var newRoom = new Room
        {
            RoomCode = roomCode,
            Host = hostSerialNumber,
            Players = new List<Player>
            {
                new Player
                {
                    SerialNumber = hostSerialNumber,
                    Clicks = 0
                }
            }
        };

        // Insert the Room instance into the collection
        roomsCollection.InsertOne(newRoom);
        return roomCode;
    }

    public bool JoinRoom(string roomCode, string serialNumber)
    {
        _database = _client.GetDatabase("roomdata_db");
        roomsCollection = _database.GetCollection<Room>("roomdata");

        var filter = Builders<Room>.Filter.Eq(r => r.RoomCode, roomCode);
        var room = roomsCollection.Find(filter).FirstOrDefault();

        if (room != null)
        {
            // Check if player already in the room
            if (room.Players.Any(p => p.SerialNumber == serialNumber))
                return false;

            var newPlayer = new Player
            {
                SerialNumber = serialNumber,
                Clicks = 0
            };

            room.Players.Add(newPlayer); // Add the new player to the room

            // Update the room in the collection
            roomsCollection.ReplaceOne(filter, room); // Use ReplaceOne to update the entire room document
            return true;
        }

        return false;
    }

    public void IncrementClick(string roomCode, string serialNumber)
    {
        _database = _client.GetDatabase("roomdata_db");
        roomsCollection = _database.GetCollection<Room>("roomdata");

        var filter = Builders<Room>.Filter.Eq(r => r.RoomCode, roomCode);
        var room = roomsCollection.Find(filter).FirstOrDefault();

        if (room != null)
        {
            var player = room.Players.FirstOrDefault(p => p.SerialNumber == serialNumber);

            if (player != null)
            {
                player.Clicks++; // Increment the player's click count

                // Update the room in the collection
                roomsCollection.ReplaceOne(filter, room); // Use ReplaceOne to update the entire room document
            }
        }
    }

    public Room GetRoomDetails(string roomCode)
    {
        _database = _client.GetDatabase("roomdata_db");
        roomsCollection = _database.GetCollection<Room>("roomdata");

        var filter = Builders<Room>.Filter.Eq(r => r.RoomCode, roomCode);
        return roomsCollection.Find(filter).FirstOrDefault(); // Return the Room object directly
    }

    public string GetWinner(string roomCode)
    {
        _database = _client.GetDatabase("roomdata_db");
        roomsCollection = _database.GetCollection<Room>("roomdata");

        var room = GetRoomDetails(roomCode);

        if (room != null && room.Players != null && room.Players.Count > 0)
        {
            // Find the player with the maximum clicks
            var winner = room.Players.OrderByDescending(p => p.Clicks).First();
            return winner.SerialNumber; // Return the serial number of the winning player
        }

        return null; // Return null if no room or players found
    }

   
    public List<Gear> GetAllGears() 
    {
        return gearsCollection.Find(gear=> true).ToList();
    }


    public Account GetAccountByUid(string uid)
    {
        // Query the collection to find an account with the matching uid
        return accountsCollection.Find(account => account.UiD == uid).FirstOrDefault();
    }


    public List<Gear> FindGearsByName(string name)
    {
        var filter = Builders<Gear>.Filter.Regex(gear => gear.Name, new MongoDB.Bson.BsonRegularExpression(name, "i"));
        return gearsCollection.Find(filter).ToList();
    }
    
}