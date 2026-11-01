import { User } from "../models/user.models";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"

// it will verify if there exists a user or not
export const verifyJWT = asyncHandler( async(requestAnimationFrame, resizeBy, next) => {
    try {
        const token = req.cookies?.accessToken || 
        req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized Request")
        }
    
        const decodedToken = await jwt.verify(token, provess.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select(" -password -refreshToken ")
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
    
        // we added a 'user' object in the req.user
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access token")
    }

}) 
