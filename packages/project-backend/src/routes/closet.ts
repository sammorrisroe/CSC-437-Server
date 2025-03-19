// src/routes/closet.ts
import express, { Response, Application, NextFunction } from "express";
import { Request as ExpressRequest } from "express";
import { ObjectId } from "mongodb";
import multer from "multer";
import path from "path";
import fs from "fs";

// Extended Request interface with user and file properties
interface Request extends ExpressRequest {
  user?: any;
  file?: Express.Multer.File;
}

// Interface for the clothing item document
interface ClothingItem {
  _id?: string | ObjectId;
  userId: string;
  title: string;
  type: "shirts" | "pants" | "jackets" | "hats" | "shoes";
  isFavorite: boolean;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export function registerClosetRoutes(app: Application, db: any) {
  const collectionName = process.env.CLOSET_COLLECTION_NAME || "closet_items";
  const closetCollection = db.collection(collectionName);
  
  // Set up upload directory path from environment variable
  const uploadDir = path.join(__dirname, "..", process.env.IMAGE_UPLOAD_DIR || "uploads");
  
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created uploads directory: ${uploadDir}`);
  }

  // Setup multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Create unique filename with timestamp and original extension
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });

  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed") as any);
      }
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
      
      console.log("Retrieved items:", items);
      console.log("Retrieved items with image URLs:", items.map((item: ClothingItem) => ({
        id: item._id,
        imageUrl: item.imageUrl
      })));
      
      res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching closet items:", error);
      res.status(500).json({ error: "Failed to fetch closet items" });
    }
  });

  // Add a new clothing item
  app.post("/api/closet", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.user?.username) {
        // Clean up uploaded file if authentication fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      console.log("POST /api/closet request body:", req.body);
      console.log("POST /api/closet files:", req.file ? "File present" : "No file");

      if (!req.file) {
        res.status(400).json({ error: "No image uploaded" });
        return;
      }
      
      console.log("File received:", {
        originalname: req.file?.originalname,
        mimetype: req.file?.mimetype,
        size: req.file?.size,
        destination: req.file?.destination,
        path: req.file?.path,
        filename: req.file?.filename,
        fullPath: path.resolve(req.file?.path || '')
      });

      const { title, type, isFavorite, description } = req.body;
      
      // Validate required fields
      if (!title || !type) {
        // Clean up uploaded file if validation fails
        fs.unlinkSync(req.file.path);
        res.status(400).json({ error: "Title and type are required" });
        return;
      }

      // Use the filename provided by multer instead of extracting from path
      const filename = req.file.filename;
      
      // Create relative URL to the uploaded file
      const imageUrl = `/uploads/${filename}`;

      console.log("File upload info:", {
        file: req.file,
        path: req.file.path,
        filename: filename,
        imageUrl: imageUrl
      });

      const newItem: ClothingItem = {
        userId: req.user.username,
        title,
        type: type as "shirts" | "pants" | "jackets" | "hats" | "shoes",
        isFavorite: isFavorite === "true",
        description: description || "",
        imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await closetCollection.insertOne(newItem);
      
      console.log("Saved new item:", {
        ...newItem,
        _id: result.insertedId 
      });
      
      res.status(201).json({ 
        ...newItem, 
        _id: result.insertedId 
      });
    } catch (error) {
      console.error("Error adding closet item:", error);
      // Clean up uploaded file if operation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to add closet item" });
    }
  });

  // Update an existing clothing item
  app.put("/api/closet/:id", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.user?.username) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      console.log(`PUT /api/closet/${req.params.id} request body:`, req.body);
      console.log(`PUT /api/closet/${req.params.id} files:`, req.file ? "File present" : "No file");

      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ error: "Invalid item ID" });
        return;
      }

      // Check if the item exists and belongs to the user
      const existingItem = await closetCollection.findOne({ 
        _id: new ObjectId(id),
        userId: req.user.username
      });

      if (!existingItem) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        res.status(404).json({ error: "Item not found" });
        return;
      }

      const { title, type, isFavorite, description } = req.body;
      
      let imageUrl = existingItem.imageUrl;
      
      // If new image was uploaded, update the imageUrl and delete old file
      if (req.file) {
        console.log("File received for update:", {
          originalname: req.file?.originalname,
          mimetype: req.file?.mimetype,
          size: req.file?.size,
          destination: req.file?.destination,
          path: req.file?.path,
          filename: req.file?.filename,
          fullPath: path.resolve(req.file?.path || '')
        });
        
        // Delete the old image file if it exists
        if (existingItem.imageUrl) {
          const oldFileName = path.basename(existingItem.imageUrl);
          const oldFilePath = path.join(uploadDir, oldFileName);
          
          console.log("Attempting to delete old file:", {
            oldFileName,
            oldFilePath,
            exists: fs.existsSync(oldFilePath)
          });
          
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log(`Deleted old file: ${oldFilePath}`);
          }
        }
        
        // Use the filename provided by multer
        const filename = req.file.filename;
        
        // Set new image URL
        imageUrl = `/uploads/${filename}`;
        
        console.log("Updated file info:", {
          file: req.file,
          path: req.file.path,
          filename: filename,
          imageUrl: imageUrl
        });
      }

      const updatedItem = {
        title: title || existingItem.title,
        type: type || existingItem.type,
        isFavorite: isFavorite === "true" ? true : (isFavorite === "false" ? false : existingItem.isFavorite),
        description: description !== undefined ? description : existingItem.description,
        imageUrl,
        updatedAt: new Date()
      };

      await closetCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedItem }
      );
      
      console.log("Updated item:", {
        id,
        ...updatedItem
      });
      
      res.status(200).json({ 
        ...existingItem, 
        ...updatedItem 
      });
    } catch (error) {
      console.error("Error updating closet item:", error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to update closet item" });
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
        const fileName = path.basename(existingItem.imageUrl);
        const filePath = path.join(uploadDir, fileName);
        
        console.log("Attempting to delete file:", {
          fileName,
          filePath,
          exists: fs.existsSync(filePath)
        });
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        }
      }

      await closetCollection.deleteOne({ _id: new ObjectId(id) });
      
      console.log(`Item deleted: ${id}`);
      
      res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting closet item:", error);
      res.status(500).json({ error: "Failed to delete closet item" });
    }
  });
}