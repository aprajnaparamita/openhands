import axios from 'axios';
import { commissionApi } from '../api/commissions';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const { signature, timestamp, cloudName, apiKey } = await commissionApi.getUploadSignature();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', 'openhands_commissions');

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData
  );

  return response.data.secure_url;
};
