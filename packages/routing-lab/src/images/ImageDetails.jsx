import { useParams } from "react-router";
import { useImageFetching } from "./useImageFetching.js";

export function ImageDetails() {
    // Get imageId from URL params instead of props
    const { imageId } = useParams();
    
    const { isLoading, fetchedImages } = useImageFetching(imageId, 500);
    
    if (isLoading) {
        return <>Loading...</>;
    }
    
    const imageData = fetchedImages.find(img => img._id === imageId);
    if (!imageData) {
        return <><h2>Image not found</h2></>;
    }

    return (
        <>
            <h2>{imageData.name}</h2>
            <img className="ImageDetails-img" src={imageData.src} alt={imageData.name} />
        </>
    );
}