import { injectable } from 'tsyringe';
import { v2 as cloudinary } from 'cloudinary';
import { 
  CLOUDINARY_CLOUD_NAME, 
  CLOUDINARY_API_KEY, 
  CLOUDINARY_API_SECRET, 
  CLOUDINARY_UPLOAD_FOLDER 
} from '@config/env';

@injectable()
export class StorageService {
  constructor() {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Buffer,
    userId: string,
    options: {
      folder: string;
      transformation?: any;
    }
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          transformation: options.transformation,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      
      // Convert Buffer to stream and pipe to Cloudinary
      const bufferStream = require('stream').Readable.from(file);
      bufferStream.pipe(uploadStream);
    });
  }

  generateUploadSignature(folder: string = CLOUDINARY_UPLOAD_FOLDER): { signature: string; timestamp: number; cloudName: string; apiKey: string; folder: string } {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      CLOUDINARY_API_SECRET
    );

    return {
      signature,
      timestamp,
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKey: CLOUDINARY_API_KEY,
      folder,
    };
  }
}
