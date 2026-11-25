import { S3Client, PutObjectCommand, DeleteObjectCommand, S3, Bucket$ } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

// initialize AWS S3 client using credentials from .env

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESSKEYID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});

const uploadOnS3 = async (localFilePath, folder = "media") => {
    try{
        if(!localFilePath) return null;
        const fileStream = fs.createReadStream(localFilePath);
        // We have used this fs.createReadStream because it doesn't load whole 1GB file
        // directly into the database if 2 users upload then it will crash server's ram
        // and our server runs out od memory and crashes
        // so using fs.createReadStream is better than
        // because fs.readDuleSync -> load 1GB directly into server's RAM at a time
        // Stream reads the file in tiny 64KB chunks and pipes them directly to AWS
        // as they read. ad servre's RAM usage stays at practically 0 MB

        const fileName = `${Date.now()}-${path.basename(localFilePath)}`;
        const fileKey = `${folder}/${fileName}`;
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            Body: fileStream
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // remove local temporary file after upload
        
        if(fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath);
        }
        // Construct the S3 url (or CloudFront CDN URL)
        const fileUrl = process.env.AWS_CLOUDFRONT_DOMAIN ? 
            `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${fileKey}` :
            `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

        return {
            url: fileUrl,
            secure_url: fileUrl,
            public_id: fileKey,
            duration: 0
        };
    }
    catch(error) {
        console.error("AWS S3 Upload Error", error);
        if(fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
}

const deleteFromS3 = async(fileKey) => {
    try{
        if(!fileKey) return null;
        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey
        };

        const command = new DeleteObjectCommand(deleteParams);
        const result = await s3Client.send(command);
        return result;
    }
    catch (error) {
        console.error("AWS S3 Delete Error: ", error);
        return null;
    }
};

export { uploadOnS3, deleteFromS3}

//Node.js ──► 1. Raw S3 Bucket ──(S3 Event)──► 2.AWS Lambda / FFmpeg──►
//      3.Processed S3 Bucket ──► 4. CloudFront CDN