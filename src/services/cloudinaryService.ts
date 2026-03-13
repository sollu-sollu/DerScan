/**
 * Cloudinary Upload Service
 * 
 * Handles uploading local scan images to Cloudinary for permanent storage
 * using an Unsigned Upload Preset.
 */
import { Alert } from 'react-native';
import { CLOUDINARY_CONFIG } from './config';

/**
 * Uploads a local image file to Cloudinary.
 * @param localUri The local file:// URI of the image
 * @returns The secure URL (https://res.cloudinary.com/...) of the uploaded image
 */
export async function uploadImageToCloudinary(localUri: string): Promise<string> {
  try {
    const data = new FormData();
    const normalizedUri = localUri.startsWith('file://') ? localUri : `file://${localUri}`;

    data.append('file', {
      uri: normalizedUri,
      type: 'image/jpeg',
      name: `scan_${Date.now()}.jpg`
    } as any);

    data.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
    data.append('cloud_name', CLOUDINARY_CONFIG.CLOUD_NAME);

    const response = await fetch(CLOUDINARY_CONFIG.API_URL, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        // Do NOT set Content-Type here, let fetch set it with the multipart boundary
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || response.statusText}`);
    }

    const responseData = await response.json();
    return responseData.secure_url;

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    Alert.alert('Upload Failed', 'Could not save the image to the cloud. The scan will be saved without an image.');
    throw error;
  }
}
