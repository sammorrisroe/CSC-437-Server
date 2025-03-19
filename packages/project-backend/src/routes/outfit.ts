// src/routes/outfit.ts
import express, { Response, Application, NextFunction } from "express";
import { Request as ExpressRequest } from "express";
import { ObjectId } from "mongodb";
import path from "path";

// Extended Request interface with user property
interface Request extends ExpressRequest {
  user?: any;
}

// Interface for database document with ObjectId
interface DbDocument {
  _id: ObjectId;
  [key: string]: any;
}

// Interface for clothing item references in outfits
interface OutfitItemRef {
  _id: string | ObjectId;
  title: string;
  type: "shirts" | "pants" | "jackets" | "hats" | "shoes";
  imageUrl: string;
}

// Interface for the outfit document
interface Outfit {
  _id?: string | ObjectId;
  userId: string;
  title: string;
  hat: OutfitItemRef | null;
  shirt: OutfitItemRef | null;
  jacket: OutfitItemRef | null;
  pants: OutfitItemRef | null;
  shoes: OutfitItemRef | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function registerOutfitRoutes(app: Application, db: any) {
  const outfitCollectionName = process.env.OUTFIT_COLLECTION_NAME || "outfits";
  const outfitCollection = db.collection(outfitCollectionName);
  const closetCollectionName = process.env.CLOSET_COLLECTION_NAME || "closet_items";
  const closetCollection = db.collection(closetCollectionName);
  
  // Helper function to process image URLs in outfit items
  const processItemImageUrls = (item: OutfitItemRef | null): OutfitItemRef | null => {
    if (!item) return null;
    
    return {
      ...item,
      // Store just the filename, not the full path
      imageUrl: item.imageUrl ? path.basename(item.imageUrl.replace(/^\/uploads\//, '')) : item.imageUrl
    };
  };
  
  // Helper function to normalize outfit data for storage
  const normalizeOutfitForStorage = (outfit: any): any => {
    return {
      ...outfit,
      hat: processItemImageUrls(outfit.hat),
      shirt: processItemImageUrls(outfit.shirt),
      jacket: processItemImageUrls(outfit.jacket),
      pants: processItemImageUrls(outfit.pants),
      shoes: processItemImageUrls(outfit.shoes)
    };
  };
  
  // Get all outfits for the authenticated user
  app.get("/api/outfits", async (req: Request, res: Response) => {
    try {
      if (!req.user?.username) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const outfits = await outfitCollection.find({ 
        userId: req.user.username 
      }).toArray();
      
      console.log(`Retrieved ${outfits.length} outfits for user ${req.user.username}`);
      
      res.status(200).json(outfits);
    } catch (error) {
      console.error("Error fetching outfits:", error);
      res.status(500).json({ error: "Failed to fetch outfits" });
    }
  });

  // Add a new outfit
  app.post("/api/outfits", async (req: Request, res: Response) => {
    try {
      if (!req.user?.username) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      console.log("POST /api/outfits request body:", req.body);

      const { title, hat, shirt, jacket, pants, shoes, isFavorite } = req.body;
      
      // Validate required fields
      if (!title) {
        res.status(400).json({ error: "Title is required" });
        return;
      }

      // Normalize the outfit data - ensure images are stored correctly
      const normalizedData = normalizeOutfitForStorage({
        title, hat, shirt, jacket, pants, shoes, isFavorite
      });

      // Verify that all referenced closet items exist and belong to the user
      const itemRefs = [
        normalizedData.hat, 
        normalizedData.shirt, 
        normalizedData.jacket, 
        normalizedData.pants, 
        normalizedData.shoes
      ].filter((item: any): item is OutfitItemRef => !!item && !!item._id);
      
      if (itemRefs.length > 0) {
        const itemIds = itemRefs.map((item: OutfitItemRef) => new ObjectId(item._id.toString()));
        
        const validItems = await closetCollection.find({
          _id: { $in: itemIds },
          userId: req.user.username
        }).toArray();
        
        const validItemIds = validItems.map((item: { _id: ObjectId }) => item._id.toString());
        
        // Check if any of the provided items don't exist or don't belong to the user
        const invalidItems = itemRefs.filter((item: OutfitItemRef) => !validItemIds.includes(item._id.toString()));
        
        if (invalidItems.length > 0) {
          res.status(400).json({ 
            error: "Some outfit items are invalid or don't belong to you",
            invalidItems: invalidItems.map((item: OutfitItemRef) => ({ id: item._id, title: item.title }))
          });
          return;
        }
      }

      const newOutfit: Outfit = {
        userId: req.user.username,
        title: normalizedData.title,
        hat: normalizedData.hat || null,
        shirt: normalizedData.shirt || null,
        jacket: normalizedData.jacket || null,
        pants: normalizedData.pants || null,
        shoes: normalizedData.shoes || null,
        isFavorite: normalizedData.isFavorite || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await outfitCollection.insertOne(newOutfit);
      
      console.log("Saved new outfit:", {
        ...newOutfit,
        _id: result.insertedId 
      });
      
      res.status(201).json({ 
        ...newOutfit, 
        _id: result.insertedId 
      });
    } catch (error) {
      console.error("Error adding outfit:", error);
      res.status(500).json({ error: "Failed to add outfit" });
    }
  });

  // Update an existing outfit
  app.put("/api/outfits/:id", async (req: Request, res: Response) => {
    try {
      if (!req.user?.username) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      console.log(`PUT /api/outfits/${req.params.id} request body:`, req.body);

      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid outfit ID" });
        return;
      }

      // Check if the outfit exists and belongs to the user
      const existingOutfit = await outfitCollection.findOne({ 
        _id: new ObjectId(id),
        userId: req.user.username
      });

      if (!existingOutfit) {
        res.status(404).json({ error: "Outfit not found" });
        return;
      }

      const { title, hat, shirt, jacket, pants, shoes, isFavorite } = req.body;
      
      // Normalize the outfit data - ensure images are stored correctly
      const normalizedData = normalizeOutfitForStorage({
        title, hat, shirt, jacket, pants, shoes, isFavorite
      });
      
      // Verify that all referenced closet items exist and belong to the user
      const itemRefs = [
        normalizedData.hat, 
        normalizedData.shirt, 
        normalizedData.jacket, 
        normalizedData.pants, 
        normalizedData.shoes
      ].filter((item: any): item is OutfitItemRef => !!item && !!item._id);
      
      if (itemRefs.length > 0) {
        const itemIds = itemRefs.map((item: OutfitItemRef) => new ObjectId(item._id.toString()));
        
        const validItems = await closetCollection.find({
          _id: { $in: itemIds },
          userId: req.user.username
        }).toArray();
        
        const validItemIds = validItems.map((item: { _id: ObjectId }) => item._id.toString());
        
        // Check if any of the provided items don't exist or don't belong to the user
        const invalidItems = itemRefs.filter((item: OutfitItemRef) => !validItemIds.includes(item._id.toString()));
        
        if (invalidItems.length > 0) {
          res.status(400).json({ 
            error: "Some outfit items are invalid or don't belong to you",
            invalidItems: invalidItems.map((item: OutfitItemRef) => ({ id: item._id, title: item.title }))
          });
          return;
        }
      }

      const updatedOutfit = {
        title: normalizedData.title || existingOutfit.title,
        hat: normalizedData.hat !== undefined ? normalizedData.hat : existingOutfit.hat,
        shirt: normalizedData.shirt !== undefined ? normalizedData.shirt : existingOutfit.shirt,
        jacket: normalizedData.jacket !== undefined ? normalizedData.jacket : existingOutfit.jacket,
        pants: normalizedData.pants !== undefined ? normalizedData.pants : existingOutfit.pants,
        shoes: normalizedData.shoes !== undefined ? normalizedData.shoes : existingOutfit.shoes,
        isFavorite: normalizedData.isFavorite !== undefined ? normalizedData.isFavorite : existingOutfit.isFavorite,
        updatedAt: new Date()
      };

      await outfitCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedOutfit }
      );
      
      console.log("Updated outfit:", {
        id,
        ...updatedOutfit
      });
      
      res.status(200).json({ 
        ...existingOutfit, 
        ...updatedOutfit 
      });
    } catch (error) {
      console.error("Error updating outfit:", error);
      res.status(500).json({ error: "Failed to update outfit" });
    }
  });

  // Delete an outfit
  app.delete("/api/outfits/:id", async (req: Request, res: Response) => {
    try {
      if (!req.user?.username) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      console.log(`DELETE /api/outfits/${req.params.id}`);

      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid outfit ID" });
        return;
      }

      // Check if the outfit exists and belongs to the user
      const existingOutfit = await outfitCollection.findOne({ 
        _id: new ObjectId(id),
        userId: req.user.username
      });

      if (!existingOutfit) {
        res.status(404).json({ error: "Outfit not found" });
        return;
      }

      await outfitCollection.deleteOne({ _id: new ObjectId(id) });
      
      console.log(`Outfit deleted: ${id}`);
      
      res.status(200).json({ message: "Outfit deleted successfully" });
    } catch (error) {
      console.error("Error deleting outfit:", error);
      res.status(500).json({ error: "Failed to delete outfit" });
    }
  });
}