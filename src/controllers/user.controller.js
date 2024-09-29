import { asyncHandler } from "../utiles/asynchandler.js";
import { APIError } from "../utiles/apierror.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utiles/cloudinary.js"
import { APIResponse } from "../utiles/apiresponse.js"
import jwt from "jsonwebtoken"
import mongoose, { syncIndexes } from "mongoose";

const generateAccessTokenandRefreshToken = async (userId)=>
{
    try {//find user by userid
        const user = await User.findById(userId);
        if (!user) {
            throw new APIError(404, "User not found");
        }
        //generate access and refresh token
        const accessToken = user.generateAccessToken()
         //console.log(refreshToken)
        const refreshToken =  user.generateRefreshToken()
        //console.log(refreshToken)
        user.refreshToken = refreshToken//put this refresh token into user database
        await user.save({ validateBeforeSave: false })//save the refresh token in user database without validation(password)

        //return kr denge accesstoken and refreshtoken
        return {accessToken,refreshToken}
    } catch (error) {
        console.error("Error generating tokens:", error.message);
        throw new APIError(500,"something went wrong while generating refresh and access token")
    }
}
const registerUser = asyncHandler(async (req, res) => {
    const { firstname, phone,email,address, specialization,fees,pin,password,cpassword } = req.body;
    if ([firstname, phone,email,address, specialization,fees,pin,password,cpassword].some((field) =>
        field?.trim() === "")
    ) {
        throw new APIError(400,"all fields are required")
    }
  const existuser= await User.findOne({
        $or:[{firstname},{email}]
  })
    
    if (existuser) {
        throw new APIError(409,"user with email or username already exist")
    }

   
    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    let coverimagelocalpath;
    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0) {
        coverimagelocalpath=req.files.coverimage?.[0]?.path
    }
    if (!avatarlocalpath) {
        throw new APIError(400,"avatar files is required")
    }

    //upload oncloudinary
    const avatar = await uploadOnCloudinary(avatarlocalpath);
   // console.log(avatar)
    const coverimage = await uploadOnCloudinary(coverimagelocalpath);
   // console.log(coverimage)
    
    if (!avatar) {
        throw new APIError(400,"avatar is required")
    }

    //create object and entry in db

    const user = await User.create({
       
        phone,
        avatar: avatar.url,
        coverimage: coverimage?.url || "", 
        email,
        pin,
        fees,
        specialization,
        address,
        password,
        cpassword,
        firstname:firstname.toLowerCase()
   })
    
    //check user hai ya nhi by id jo bydefault hota hai
    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if (!createduser) {
        throw new APIError(500, "something went wrong while registering the user");
    }

    //return response
    return res.status(201).json(
        new APIResponse(200,createduser,"user registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
   
    //req data from body
    const { email, firstname, password } = req.body;
    console.log(req.body);

    //check find user
    if (!req.body.email &&!req.body.firstname) {
        throw new APIError(400,"firstname or email is required")
    }
     
   const user=await User.findOne(
       {
           $or: [{firstname}, {email}]
       })
    
    if (!user) {
        throw new APIError(400,"user doesn't exist")
    }
    //check password
   
    const ispassword = await user.isPasswordCorrect(password);
    console.log(ispassword);

    if (!ispassword){
        throw new APIError(401,"invalid user credientials")
    }   

    //access and refresh token create
  const {accessToken,refreshToken}= await generateAccessTokenandRefreshToken(user._id)//await is used bacause kya pta time se token generate hote hai ya nhi
    
    const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")//password and refreshtoken ko=]
    //send in cookies
    const options = {
        httpOnly: true,
        secure:true
    }

    return res.status(200).cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new APIResponse(200, {
            user:loggedInUser,accessToken,refreshToken
            },
            "user logged in successfully")
    )

})

const logoutUser = asyncHandler(async (req, res) => {
    //find user by id
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
               refreshToken:1
           }
        }, {
           new:true 
       }
    )
 const options = {
        httpOnly: true,
        secure:true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
    .json(new APIResponse(200,{},"user logged out"))
}
)

const refreshAccessToken = asyncHandler(async (req, res) => {
    //we are access refresh token from cookies 
    const IncomingRefreshToken = req.cookies.
        refreshToken || req.body.refreshToken
    
    if (!IncomingRefreshToken) {
        throw new APIError(401,"unathorized request")
    }
    try {
        //verify incoming token
        const decodedToken = jwt.verify(
            IncomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new APIError(401, "invalid refresh token")
        }
        //match tokens
        if (IncomingRefreshToken !== user?.refreshToken) {
            throw new APIError(401, "refresh token is expired or used")
        }

        //generate new token or refresh token
        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newrefreshToken } = await generateAccessTokenandRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new APIResponse(
                    200,
                    { accessToken, refreshToken: newrefreshToken },
                    "access token refreshed successfully"
                )
            
            )
    }
    catch (error) {
        throw new APIError(401,error?.message||"inavlid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
     const { oldPassword, newPassword, confPassword } = req.body;
     //console.log(oldPassword);
     //console.log(newPassword);
     // console.log(confPassword);
     if (newPassword !== confPassword) {
       new APIError("password doesnt match", 400)
     }
     //find user id from the middleware when login 
     const user = await User.findById(req.user?._id).select("+password")
     //check password correct
     const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
     if (!isPasswordCorrect) {
          throw new APIError("Invalid password", 400);
     }
    
 //set new password
     user.password = newPassword
     await user.save({ validateBeforeSave: true })
     
     return res.status(200)
     .json(new APIResponse(200,"password change successfully"))
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { phone, email } = req.body;
    
    if (!phone || !email) {
        throw new APIError(400, "all fields are requiered");
    }

    const user = User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                phone,
                email: email
            }
        },
        {new:true}
    ).select("-password")

    return res.
        status(200)
    .json(new APIResponse(200,user,"account details updated successfully"))

})


const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarPath = req.files?.path;
    if (!avatarPath) {
        throw new APIError(400,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarPath);
    
    if (!avatar.url) {
        throw new APIError(400,"Error while uploading on cloudinary")
    }

  const user=  await User.findById(req.user?._id,
        {
        $set:{
        avatar:avatar.url
    }
    },
        { new: true }
    ).select("-password")

     return res.
        status(200)
    .json(200,"avatar updated successfully")
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const converimagepath = req.files?.body;
    if (!converimagepath) {
        throw new APIError(400, "cover image missing ");
    }

    const  coverimage = await uploadOnCloudinary(converimagepath);
    if (! coverimage.url) {
        throw new APIError(400,"error while uploading file on cloudinary")
    }

   const user= await User.findById(req.user?._id,
        {
            $set: {
                 coverimage: coverimage.url
            }
        },
        {
            new:true
        }
    )

    return res.
        status(200)
    .json(200,user,"coverimage updated successfully")
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}