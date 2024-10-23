import { connectDb } from "../database";
import bcrypt from 'bcrypt';

export class OTPModel {
    db:any;

    constructor(){
        this.initializer()
    }
    async initializer() {
        this.db = await connectDb();
            if (!this.db) {
              throw new Error("Failed to connect to the database.");
            }
            await this.db.exec(`
                CREATE TABLE IF NOT EXISTS otps (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    otp TEXT NOT NULL,
                    phone_number TEXT,
                    expiry DATETIME,
                    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
                );           
            `);
    }
    async createOTP(phone_number:string, otp: string,expiry:number) {
        let hashedOtp = await bcrypt.hash(otp, 10);
        return this.db.run(
            `INSERT INTO otps (phone_number, otp, expiry) VALUES (?, ?, ?)`,
            [phone_number, hashedOtp, expiry]
        );
    }

    async getOtp(phone_number: string) {
        return this.db.get(`SELECT * FROM otps WHERE phone_number = ?`, [phone_number]);
    }

    async clearOtp(phone_number:string) {
        await this.db.run('DELETE FROM otps WHERE phone_number = ?', [phone_number]);
    }
}


