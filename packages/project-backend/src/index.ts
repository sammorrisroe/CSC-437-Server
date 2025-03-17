// src/server.ts
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { MongoClient } from "mongodb";
import path from "path";
import { registerAuthRoutes, verifyAuthToken } from "./routes/auth";
import { registerClosetRoutes } from "./routes/closet"; // Import closet routes
import { CredentialsProvider } from "./CredentialsProvider";

const PORT = process.env.PORT || 3000;
const staticDir = process.env.STATIC_DIR || "public";

async function setUpServer() {
    const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER, DB_NAME } = process.env;
    const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${DB_NAME}`;

    try {
        const mongoClient = await MongoClient.connect(connectionString);
        const db = mongoClient.db();
        const credentialsProvider = new CredentialsProvider(mongoClient);

        const app = express();
        app.use(express.static(staticDir));
        app.use(express.json());

        app.get("/hello", (req, res) => {
            res.send("Hello, World");
        });

        // Register auth routes (unprotected)
        registerAuthRoutes(app, credentialsProvider);
        
        // Set up JWT verification middleware for protected routes
        app.use("/api/*", verifyAuthToken);
        
        // Register closet routes (protected)
        registerClosetRoutes(app, db);

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

setUpServer();
