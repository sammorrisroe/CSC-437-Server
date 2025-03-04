import { MongoClient, Collection, WithId } from "mongodb";

interface UserDocument {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
}

interface ImageDocument {
    _id: string;
    url: string;
    title: string;
    description?: string;
    author: string; // Initially just a user ID
}

export class ImageProvider {
    constructor(private readonly mongoClient: MongoClient) {}

    async getAllImages(): Promise<(Omit<ImageDocument, "author"> & { author: UserDocument })[]> {
        const db = this.mongoClient.db();
        const imagesCollection: Collection<ImageDocument> = db.collection(process.env.IMAGES_COLLECTION_NAME || "");
        const usersCollection: Collection<UserDocument> = db.collection(process.env.USERS_COLLECTION_NAME || "");

        // Fetch all images
        const images = await imagesCollection.find().toArray();

        // Get unique author IDs
        const authorIds = [...new Set(images.map(img => img.author))];

        // Fetch author details
        const authors = await usersCollection.find({ _id: { $in: authorIds } }).toArray();
        const authorMap = new Map(authors.map(user => [user._id, user]));

        // Default fallback author (optional)
        const defaultAuthor: UserDocument = {
            _id: "unknown",
            name: "Unknown Author",
            email: "unknown@example.com",
        };

        // Replace author ID with full user object, ensuring no null values
        return images.map(img => ({
            ...img,
            author: authorMap.get(img.author) || defaultAuthor, // Ensures `author` is always `UserDocument`
        }));
    }
}
