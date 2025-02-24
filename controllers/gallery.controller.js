
// Configure Cloudinary
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import db from "../models/index.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


export const uploadImage = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No image file uploaded",
      });
    }
    
    // Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "gallery", // optional: specify a folder in Cloudinary
      transformation: [
        { width: 1200, crop: "limit" }, // Optional: resize large images
        { quality: "auto" }, // Optional: auto-optimize quality
      ],
    });

    

    // Save image URL to database
    const newGalleryImage = await db.Gallery.create({
      imageUrl: uploadResult.secure_url,
    });
    fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Failed to delete local image file:", err);
        }
      });
    res.status(201).json({
      status: "success",
      data: {
        image: newGalleryImage,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      status: "error",
      message: "Image upload failed",
    });
  }
};

export const getGalleryImages = async (req, res) => {
  try {
    const images = await db.Gallery.find().sort({ createdAt: -1 }).select("-createdAt -updatedAt");

    res.status(200).json({
      status: "success",
      results: images.length,
      data: { images },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not fetch gallery images",
    });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find image in database
    const imageToDelete = await db.Gallery.findById(id);

    if (!imageToDelete) {
      return res.status(404).json({
        status: "error",
        message: "Image not found",
      });
    }

    // Delete from Cloudinary (extract public ID from URL)
    const publicId = imageToDelete.imageUrl.split("/").pop()?.split(".")[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`gallery/${publicId}`);
    }

    // Delete from database
    await db.Gallery.findByIdAndDelete(id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not delete image",
    });
  }
};

export const getRecentImages = async (req, res) => {
  try {
    const recentImages = await db.Gallery.find()
      .sort({ createdAt: -1 }) // Sort by most recent first
      .limit(10); // Limit to 10 images

    res.status(200).json({
      status: "success",
      results: recentImages.length,
      data: { images: recentImages },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not fetch recent gallery images",
    });
  }
};
