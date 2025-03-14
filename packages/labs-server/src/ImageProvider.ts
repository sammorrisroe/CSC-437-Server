import { MongoClient, Collection, WithId, UpdateResult } from "mongodb";

// UserDocument interface
interface UserDocument {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
}

// ImageDocument interface
interface ImageDocument {
    _id: string;
    url: string;
    name:string;
    title: string;
    description?: string;
    author: string; // Initially just a user ID
}

export class ImageProvider {
    constructor(private readonly mongoClient: MongoClient) {}

    // Method to update the image's name
    async updateImageName(imageId: string, newName: string): Promise<number> {
        try {
            const db = this.mongoClient.db();
            const imagesCollection: Collection<ImageDocument> = db.collection(process.env.IMAGES_COLLECTION_NAME || "");

            // Perform the update operation
            const result: UpdateResult = await imagesCollection.updateOne(
                { _id: imageId },
                { $set: { name: newName } }
            );

            // Return the matched count (number of documents that were matched by the query)
            return result.matchedCount;
        } catch (error) {
            console.error("Error updating image:", error);
            throw new Error("Failed to update image");
        }
    }

    // Existing method to get all images with author information
    async getAllImages(createdBy?: string): Promise<(Omit<ImageDocument, "author"> & { author: UserDocument })[]> {
        try {
            const db = this.mongoClient.db();
            const imagesCollection: Collection<ImageDocument> = db.collection(process.env.IMAGES_COLLECTION_NAME || "");
            const usersCollection: Collection<UserDocument> = db.collection(process.env.USERS_COLLECTION_NAME || "");

            // Construct query based on the optional `createdBy` filter
            const query = createdBy ? { author: createdBy } : {};

            // Fetch filtered or all images
            const images: ImageDocument[] = await imagesCollection.find(query).toArray();

            // Get unique author IDs
            const authorIds = [...new Set(images.map(img => img.author))];

            // Fetch author details from users collection
            const authors: UserDocument[] = await usersCollection.find({ _id: { $in: authorIds } }).toArray();

            // Create a map of authors by ID for quick lookup
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
                author: authorMap.get(img.author) || defaultAuthor, // Fallback to defaultAuthor if no match
            }));
        } catch (error) {
            console.error("Error fetching images:", error);
            throw new Error("Failed to fetch images");
        }
    }
}
