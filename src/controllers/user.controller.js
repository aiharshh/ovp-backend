import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResonse } from '../utils/ApiResponse.js'

const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "ok"
    // })
    
    // get user details from frontend (postman)
    // validation - not empty
    // check if user already exists - email, username, 
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in DB
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName, email, username, password} = req.body
    // console.log("email: ", email);
    
    // console.log(req.body);
    
    // Validation
    // if(fullName === ""){
    //     throw new ApiError(400, "Full Name is Required")
    // }

    if(
        [fullName, email, username, password].some((field) => 
        field?.trim() === "")
    ){
        throw new ApiError(400, "All Fields are Required")
    }

    // check if user exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError( 409, "User with email or username already exists")
    }

    // check for images or avatar

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    // check if uploaded on cloudinary


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar Required")
    }

    const user =  await User.create({
        fullName, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // create user object and remove password and refresh token field
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // check user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering User")
    }
    // return response
    return res.status(201).json(
        new ApiResonse(200, createdUser, "User Registered Successfully")
    )
})

export { 
    registerUser,
}