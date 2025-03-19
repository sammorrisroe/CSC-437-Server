
import fs from "fs";
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
        
        // Serve static files from public directory
        app.use(express.static(staticDir));
        
        const uploadDir = path.resolve(process.env.IMAGE_UPLOAD_DIR || 'uploads');
        console.log(`Serving uploaded files from: ${uploadDir}`);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
          console.log(`Created uploads directory: ${uploadDir}`);
        }
        app.use('/uploads', express.static(uploadDir));
        console.log(`Static route '/uploads' configured to serve from ${uploadDir}`);
        
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
