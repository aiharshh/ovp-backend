import { uploadOnCloudinary, deleteFromCloudinary } from "./cloudinary.js"
import { uploadOnS3, deleteFromS3 } from "./s3.js";

const isS3 = process.env.STORAGE_PROVIDER === "s3";
// Unified upload handler - delegates to Cloudinary or AWS S3
// based on STORAGE_PROVIDER in .env

const uploadFile = async( localFilePath, options = {}) => {
    if(isS3){
        return await uploadOnS3(localFilePath, options.folder || "twitube");
    }
    return await uploadOnCloudinary(localFilePath);
};

// Unified Deletion Handler

const deleteFile = async(publicIdOrKey, resourceType = "image") => {
    if(isS3){
        return await deleteFromS3(publicIdOrKey);
    }
    return await deleteFromCloudinary(publicIdOrKey, resourceType);
};

export { uploadFile, deleteFile };