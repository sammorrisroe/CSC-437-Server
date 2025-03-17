import express, { Response, Application, NextFunction } from "express";
import { Request as ExpressRequest } from "express";
import { CredentialsProvider } from "../CredentialsProvider";
import jwt from "jsonwebtoken";

// Extend the Express Request interface to include user property
interface Request extends ExpressRequest {
    user?: any;
}

const signatureKey = process.env.JWT_SECRET || "";

// JWT token generation function
function generateAuthToken(username: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (!signatureKey) {
            return reject(new Error("JWT_SECRET is not defined."));
        }

        jwt.sign(
            { username: username },
            signatureKey,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

// Middleware to verify the JWT token for secured routes
export function verifyAuthToken(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.get("Authorization");
    const token = authHeader && authHeader.split(" ")[1]; // Discard "Bearer " part

    if (!token) {
        res.status(401).json({ error: "Unauthorized, token missing" });
        return;
    } 
    
    if (!signatureKey) {
        res.status(500).json({ error: "Server configuration error" });
        return;
    }
    
    jwt.verify(token, signatureKey, (error, decoded) => {
        if (error) {
            res.status(403).json({ error: "Forbidden, invalid token" });
            return;
        }
        
        // Add decoded user info to the request object
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    });
}

// Register the auth routes for user registration and login
export function registerAuthRoutes(app: Application, credentialsProvider: CredentialsProvider) {
    // POST route for user registration
    app.post("/auth/register", async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                res.status(400).json({
                    error: "Bad request",
                    message: "Missing username or password",
                });
                return;
            }

            const success = await credentialsProvider.registerUser(username, password);
            if (success) {
                res.status(201).send();
                return;
            } else {
                res.status(400).json({
                    error: "Username already taken",
                    message: "Username already exists",
                });
                return;
            }
        } catch (error) {
            console.error("Error handling register request:", error);
            res.status(500).json({ error: "Failed to process registration" });
            return;
        }
    });

    // POST route for user login
    app.post("/auth/login", async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                res.status(400).json({
                    error: "Bad request",
                    message: "Missing username or password",
                });
                return;
            }

            const isValid = await credentialsProvider.verifyPassword(username, password);

            if (isValid) {
                // Generate JWT token if password is correct
                const token = await generateAuthToken(username);
                res.status(200).json({ token });
                return;
            } else {
                res.status(401).json({
                    error: "Unauthorized",
                    message: "Invalid credentials",
                });
                return;
            }
        } catch (error) {
            console.error("Error handling login request:", error);
            res.status(500).json({ error: "Failed to process login" });
            return;
        }
    });
}