import { connectDb } from '../database';


export class UserModel {
    db: any;

    constructor() {
        this.initialize();
    }

    async initialize() {
        this.db = await connectDb();
        if (!this.db) {
          throw new Error("Failed to connect to the database.");
        }
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone_number TEXT NOT NULL UNIQUE,
                hash_phone_number TEXT NOT NULL UNIQUE,
                salt TEXT NOT NULL,
                token TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
   
    async createUser(phone_number: string, hash_phone_number:string, salt: string, token: string) {
        try {
            const existingUser = await this.db.get('SELECT * FROM users WHERE phone_number = ?', [phone_number]);
            if (existingUser) {
                throw new Error('User already exists');
            }
            const result = await this.db.run(
                `INSERT INTO users (phone_number,hash_phone_number, salt, token) VALUES (?, ?, ?, ?)`,
                [phone_number,hash_phone_number, salt, token]
            );
            return result;
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    }
    

    async findUserByPhoneNumber(phone_number: string) {
        return this.db.get(`SELECT * FROM users WHERE phone_number = ?`, [phone_number]);
    }

}
