import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { ImageProvider } from "./ImageProvider";

dotenv.config();
const PORT = process.env.PORT || 3000;
const staticDir = process.env.STATIC_DIR || "public";

async function setUpServer() {
    const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER, DB_NAME } = process.env;

    const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${DB_NAME}`;

    try {
        const mongoClient = await MongoClient.connect(connectionString);

        const app = express();
        app.use(express.static(staticDir));

        app.get("/hello", (req: Request, res: Response) => {
            res.send("Hello, World");
        });

        // New Route: Fetch Images
        app.get("/api/images", async (req: Request, res: Response) => {
            try {
                const imageProvider = new ImageProvider(mongoClient);
                const images = await imageProvider.getAllImages();
                res.json(images);
            } catch (error) {
                console.error("Error fetching images:", error);
                res.status(500).json({ error: "Failed to fetch images" });
            }
        });

        // Catch-all route for client-side routing in React
        app.get("*", (req: Request, res: Response) => {
            console.log("None of the routes above matched");
            res.sendFile(path.resolve(staticDir, "index.html"));
        });

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

setUpServer();
