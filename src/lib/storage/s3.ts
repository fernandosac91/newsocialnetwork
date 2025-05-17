import AWS from 'aws-sdk';

if (!process.env.AWS_ACCESS_KEY_ID || 
    !process.env.AWS_SECRET_ACCESS_KEY || 
    !process.env.AWS_REGION || 
    !process.env.AWS_BUCKET_NAME) {
  console.warn('AWS credentials not set. File uploads will not work.');
}

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Initialize S3 client
const s3 = new AWS.S3();
const bucketName = process.env.AWS_BUCKET_NAME || '';

/**
 * Upload a file to S3
 */
export async function uploadFile(file: Buffer, key: string, contentType: string) {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
    };

    const result = await s3.upload(params).promise();
    return {
      key: result.Key,
      url: result.Location,
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Get a file from S3
 */
export async function getFile(key: string) {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    const result = await s3.getObject(params).promise();
    return result.Body;
  } catch (error) {
    console.error('Error getting file from S3:', error);
    throw new Error('Failed to get file');
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string) {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * Generate a pre-signed URL for file upload
 */
export function getSignedUploadUrl(key: string, contentType: string, expiresIn = 60) {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      Expires: expiresIn,
    };

    return s3.getSignedUrl('putObject', params);
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

/**
 * Generate a pre-signed URL for file download
 */
export function getSignedDownloadUrl(key: string, expiresIn = 60) {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn,
    };

    return s3.getSignedUrl('getObject', params);
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
} 