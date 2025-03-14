import express, { Request, Response, Application } from "express";
import { ImageProvider } from "../ImageProvider";

export function registerImageRoutes(app: Application, imageProvider: ImageProvider) {
    // GET route for images
    app.get("/api/images", async (req: Request, res: Response) => {
        try {
            let userId: string | undefined = undefined;
            if (typeof req.query.createdBy === "string") {
                userId = req.query.createdBy;
            }

            console.log("Filtering images by user ID:", userId);

            const images = await imageProvider.getAllImages(userId);

            res.json(images);
        } catch (error) {
            console.error("Error fetching images:", error);
            res.status(500).json({ error: "Failed to fetch images" });
        }
    });

    // PATCH route for updating image name
    app.patch("/api/images/:id", async (req: Request, res: Response) => {
        try {
            const imageId = req.params.id;
            const { name } = req.body;

            if (!name) {
                res.status(400).send({
                    error: "Bad request",
                    message: "Missing name property"
                });
                return; 
            }

            console.log("Received update request for image:", imageId);
            console.log("New name:", name);

            // Call the updateImageName method and wait for it to complete
            const matchedCount = await imageProvider.updateImageName(imageId, name);

            if (matchedCount === 0) {
                res.status(404).send({
                    error: "Not found",
                    message: "Image does not exist"
                });
                return; 
            }

            res.status(204).send();
            return ;
        } catch (error) {
            console.error("Error updating image:", error);
            res.status(500).json({ error: "Failed to update image" });
            
        }
    });
}
