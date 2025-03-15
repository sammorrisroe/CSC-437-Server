import bcrypt from "bcrypt";
import { Collection, MongoClient } from "mongodb";

interface ICredentialsDocument {
    username: string;
    password: string;
}

export class CredentialsProvider {
    private readonly collection: Collection<ICredentialsDocument>;

    constructor(mongoClient: MongoClient) {
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection<ICredentialsDocument>(COLLECTION_NAME);
    }

    // Register user function
    async registerUser(username: string, plaintextPassword: string) {
        const userExists = await this.collection.findOne({ username });
        if (userExists) {
            return false; // Username already exists
        }
    
        const hashedPassword = await bcrypt.hash(plaintextPassword, 10); // Hash password
    
        await this.collection.insertOne({
            username,
            password: hashedPassword, // Store only the hashed password
        });
    
        return true; // Success
    }

    async verifyPassword(username: string, plaintextPassword: string): Promise<boolean> {
        const userRecord = await this.collection.findOne({ username });
    
        if (!userRecord) {
            return false; // User not found
        }
    
        const { password: storedPassword } = userRecord;
        const storedSalt = storedPassword.substring(0, 29);
        const storedHashedPassword = storedPassword.substring(29);
    
        console.log("Stored Password:", storedPassword);
        console.log("Stored Salt:", storedSalt);
        console.log("Stored Hash:", storedHashedPassword);
    
        return bcrypt.compare(plaintextPassword, storedSalt + storedHashedPassword);
    }
}
