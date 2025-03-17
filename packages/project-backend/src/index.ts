import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { MongoClient } from "mongodb";
import { registerAuthRoutes, verifyAuthToken } from "./routes/auth";
import { CredentialsProvider } from "./CredentialsProvider"; // Added import

const PORT = process.env.PORT || 3000;
const staticDir = process.env.STATIC_DIR || "public";

async function setUpServer() {
    const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER, DB_NAME } = process.env;
    const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${DB_NAME}`;

    try {
        const mongoClient = await MongoClient.connect(connectionString);
        const credentialsProvider = new CredentialsProvider(mongoClient); // Create credentials provider

        const app = express();
        app.use(express.static(staticDir));
        app.use(express.json());

        app.get("/hello", (req, res) => {
            res.send("Hello, World");
        });

        // Register auth routes FIRST (unprotected)
        registerAuthRoutes(app, credentialsProvider);
        
        // Then protect all API routes with JWT authentication
        // The correct way to use middleware with a path pattern
        app.use("/api/*", verifyAuthToken as express.RequestHandler);
        
  

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

setUpServer();