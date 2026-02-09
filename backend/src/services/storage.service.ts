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
