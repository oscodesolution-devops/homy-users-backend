import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary upload function
const uploadToCloudinary = async (file, folder) => {
  try {
    console.log("hehe")
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `chefs/${folder}`,
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Multer storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chefs',
    allowed_formats: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    resource_type: 'auto'
  }
});

// File filter middleware
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX files are allowed.'), false);
  }
};

// Multer upload middleware
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// File upload middleware
const uploadFiles = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'characterCertificate', maxCount: 1 }
]);

// Error handling middleware for file uploads
const handleFileUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  } else if (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Unknown file upload error'
    });
  }
  next();
};

export { uploadFiles, handleFileUploadErrors, uploadToCloudinary };