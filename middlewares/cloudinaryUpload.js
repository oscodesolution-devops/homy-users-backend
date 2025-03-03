import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload base64/MIME data to Cloudinary
const uploadMimeToCloudinary = async (imageData) => {
  try {
    const result = await cloudinary.uploader.upload(imageData.data, {
      folder: imageData.folder || 'general',
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Middleware to handle single or multiple image uploads
const handleImageUpload = async (req, res) => {
  try {
    const { images } = req.body;

    if (!images) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Handle single image
    if (!Array.isArray(images)) {
      if (!images.data) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image format. Expected { data, folder }'
        });
      }
      
      const imageUrl = await uploadMimeToCloudinary(images);
      return res.status(200).json({
        success: true,
        urls: [imageUrl]
      });
    }

    // Handle multiple images
    if (Array.isArray(images)) {
      // Validate each image object
      const isValidFormat = images.every(img => img.data);
      if (!isValidFormat) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image format. Each image should have { data, folder }'
        });
      }

      const uploadPromises = images.map(image => 
        uploadMimeToCloudinary(image)
      );
      
      const imageUrls = await Promise.all(uploadPromises);
      
      return res.status(200).json({
        success: true,
        urls: imageUrls
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error uploading images'
    });
  }
};

export { handleImageUpload };