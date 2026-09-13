import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * @desc    Upload image buffer to Cloudinary
 * @param   {Buffer} buffer - Image buffer from Multer
 * @param   {string} folder - Destination folder name
 * @returns {Promise<Object>} Cloudinary response object
 */
export const uploadImageToCloudinary = (buffer, folder = 'general') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(new Error('Failed to upload image to Cloudinary'));
        }
        resolve(result); 
      }
    );
    
    streamifier.createReadStream(buffer).pipe(stream);
  });
};