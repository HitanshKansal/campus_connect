// backend/config/cloudinary.js

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campus-connect/profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
  },
});


const postMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'campus-connect/posts',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo
        ? ['mp4', 'mov', 'avi', 'mkv']
        : ['jpg', 'jpeg', 'png', 'gif'],
    };
  },
});


const uploadPostMedia = multer({
  storage: postMediaStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

const uploadProfilePicture = multer({ storage: profilePictureStorage });


module.exports = { cloudinary, uploadProfilePicture,  uploadPostMedia };