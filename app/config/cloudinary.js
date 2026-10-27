import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary pour les images (optionnelle)
export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    secure: true,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Envoie un buffer d'image sur Cloudinary et renvoie l'URL sécurisée
export function uploadImage(buffer) {
  if (!isCloudinaryConfigured) {
    return Promise.reject(new Error('Cloudinary non configuré'));
  }
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'operations',
        transformation: [{ width: 800, height: 600, crop: 'limit' }]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

export { cloudinary };
