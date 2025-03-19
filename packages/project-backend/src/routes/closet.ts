// src/routes/closet.ts
import express, { Response, Application, NextFunction } from "express";
import { Request as ExpressRequest } from "express";
import { ObjectId } from "mongodb";
import multer from "multer";
import path from "path";
import fs from "fs";

// Extended Request interface with user property
interface Request extends ExpressRequest {
  user?: any;
}

// Clothing item interface
interface ClothingItem {
  _id?: string | ObjectId;
  userId: string;
  title: string;
  type: "shirts" | "pants" | "jackets" | "hats" | "shoes";
  isFavorite: boolean;
  description?: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export function registerClosetRoutes(app: Application, db: any) {
  const closetCollectionName = process.env.CLOSET_COLLECTION_NAME || "closet_items";
  const closetCollection = db.collection(closetCollectionName);
  
  // Configuration for upload directories
  const uploadsDir = process.env.IMAGE_UPLOAD_DIR || 'uploads';
  const uploadsDirPath = path.resolve(uploadsDir);
  
  console.log(`Closet routes using uploads directory: ${uploadsDirPath}`);
  
  // Ensure the upload directory exists
  if (!fs.existsSync(uploadsDirPath)) {
    fs.mkdirSync(uploadsDirPath, { recursive: true });
    console.log(`Created uploads directory at: ${uploadsDirPath}`);
  }
  
  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDirPath);
    },
    filename: (req, file, cb) => {
      // Create a unique filename with timestamp and random string
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
  });
  
  const upload = multer({ 
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Only accept image files
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'));
      }
      cb(null, true);
    }
  });

  // Get all clothing items for the authenticated user
  app.get("/api/closet", async (req: Request, res: Response) => {
    try {
      if (!req.user?.username) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const items = await closetCollection.find({ 
        userId: req.user.username 
      }).toArray();
      
      console.log(`Retrieved ${items.length} closet items for user ${req.user.username}`);
      
      res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching closet items:", error);
      res.status(500).json({ error: "Failed to fetch closet items" });
    }
  });

  // Add a new clothing item
  app.post("/api/closet", upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.user?.username) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      console.log("POST /api/closet request body:", req.body);
      console.log("POST /api/closet uploaded file:", req.file);

      const { title, type, description } = req.body;
      const isFavorite = req.body.isFavorite === "true";
      
      // Validate required fields
      if (!title) {
        res.status(400).json({ error: "Title is required" });
        return;
      }
      
      if (!req.file) {
        res.status(400).json({ error: "Image is required" });
        return;
      }

      const validTypes = ["shirts", "pants", "jackets", "hats", "shoes"];
      if (!validTypes.includes(type)) {
        res.status(400).json({ error: "Invalid clothing type" });
        return;
      }

      // Create the new clothing item - store just the filename
      const newItem: ClothingItem = {
        userId: req.user.username,
        title,
        type: type as "shirts" | "pants" | "jackets" | "hats" | "shoes",
        isFavorite,
        description: description || "",
        imageUrl: req.file.filename, // Store just the filename
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await closetCollection.insertOne(newItem);
      
      console.log("Saved new clothing item:", {
        ...newItem,
        _id: result.insertedId 
      });
      
      // Return the saved item with its ID
      res.status(201).json({ 
        ...newItem, 
        _id: result.insertedId 
      });
    } catch (error) {
      console.error("Error adding clothing item:", error);
      res.status(500).json({ error: "Failed to add clothing item" });
    }
  });

  // Update an existing clothing item
  app.put("/api/closet/:id", upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.user?.username) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      console.log(`PUT /api/closet/${req.params.id} request body:`, req.body);
      console.log(`PUT /api/closet/${req.params.id} uploaded file:`, req.file);

      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid item ID" });
        return;
      }

      // Check if the item exists and belongs to the user
      const existingItem = await closetCollection.findOne({ 
        _id: new ObjectId(id),
        userId: req.user.username
      });

      if (!existingItem) {
        res.status(404).json({ error: "Item not found" });
        return;
      }

      const { title, type, description } = req.body;
      const isFavorite = req.body.isFavorite === "true";
      
      const validTypes = ["shirts", "pants", "jackets", "hats", "shoes"];
      if (type && !validTypes.includes(type)) {
        res.status(400).json({ error: "Invalid clothing type" });
        return;
      }

      // Prepare update object
      const updatedItem: Partial<ClothingItem> = {
        title: title || existingItem.title,
        type: (type as "shirts" | "pants" | "jackets" | "hats" | "shoes") || existingItem.type,
        isFavorite: isFavorite !== undefined ? isFavorite : existingItem.isFavorite,
        description: description !== undefined ? description : existingItem.description,
        updatedAt: new Date()
      };

      // If a new file was uploaded, update the image URL
      if (req.file) {
        updatedItem.imageUrl = req.file.filename; // Store just the filename
        
        // Optionally delete the old image file if it exists
        if (existingItem.imageUrl) {
          const oldImagePath = path.join(uploadsDirPath, existingItem.imageUrl);
          if (fs.existsSync(oldImagePath)) {
            try {
              fs.unlinkSync(oldImagePath);
              console.log(`Deleted old image: ${oldImagePath}`);
            } catch (err) {
              console.error(`Failed to delete old image: ${oldImagePath}`, err);
              // Continue even if we can't delete the old image
            }
          }
        }
      }

      await closetCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedItem }
      );
      
      console.log("Updated clothing item:", {
        id,
        ...updatedItem
      });
      
      // Return the updated item
      res.status(200).json({ 
        ...existingItem, 
        ...updatedItem,
        _id: id
      });
    } catch (error) {
      console.error("Error updating clothing item:", error);
      res.status(500).json({ error: "Failed to update clothing item" });
    }
  });

  // Delete a clothing item
  app.delete("/api/closet/:id", async (req: Request, res: Response) => {
    try {
      if (!req.user?.username) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      console.log(`DELETE /api/closet/${req.params.id}`);

      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid item ID" });
        return;
      }

      // Check if the item exists and belongs to the user
      const existingItem = await closetCollection.findOne({ 
        _id: new ObjectId(id),
        userId: req.user.username
      });

      if (!existingItem) {
        res.status(404).json({ error: "Item not found" });
        return;
      }

      // Delete the image file if it exists
      if (existingItem.imageUrl) {
        const imagePath = path.join(uploadsDirPath, existingItem.imageUrl);
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
            console.log(`Deleted image: ${imagePath}`);
          } catch (err) {
            console.error(`Failed to delete image: ${imagePath}`, err);
            // Continue even if we can't delete the image file
          }
        }
      }

      await closetCollection.deleteOne({ _id: new ObjectId(id) });
      
      console.log(`Clothing item deleted: ${id}`);
      
      res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting clothing item:", error);
      res.status(500).json({ error: "Failed to delete clothing item" });
    }
  });
}