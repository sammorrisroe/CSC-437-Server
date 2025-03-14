import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { registerImageRoutes } from "./routes/images"; 
import { ImageProvider } from "./ImageProvider";

dotenv.config();
const PORT = process.env.PORT || 3000;
const staticDir = process.env.STATIC_DIR || "public";

async function setUpServer() {
    const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER, DB_NAME } = process.env;
    const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${DB_NAME}`;

    try {
        const mongoClient = await MongoClient.connect(connectionString);
        const imageProvider = new ImageProvider(mongoClient); // ✅ Create instance here

        const app = express();
        app.use(express.static(staticDir));
        app.use(express.json());

        app.get("/hello", (req, res) => {
            res.send("Hello, World");
        });

        registerImageRoutes(app, imageProvider); // ✅ Pass instance

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}


setUpServer();