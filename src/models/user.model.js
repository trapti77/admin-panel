import mongoose, { model, Schema, Types } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true,
    },
     phone: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
     address: {
        type: String,
         required: true,
    },
    specialization: {
        type: String,
        required: true,
    },
     fees: {
        type: Number,
        required: true,
    },
    pin: {
        type:Number,
        required: true,
    },
     password: {
        type: String,
         required: true,
        unique:true
    },
      cpassword: {
        type: String,
         required: true,
        unique:true
    },
    avatar: {
        type: String,
         required: true,
    },
    coverimage: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
    
    
}, { timestamps: true })


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})//herewhen data is saved before that we have to encrypt password
userSchema.methods.isPasswordCorrect = async function (password)//customemethod created name ispasscorrect
{
    return await bcrypt.compare(password, this.password)
}

//------------------------------------------------------
//generate access token
userSchema.methods.generateAccessToken = function () {//in jwt has sign method that generate tokens
   return  jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname:this.fullname,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
)
}
userSchema.methods.generateRefreshToken = function () {
     return  jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
)
}


export const User=mongoose.model("User", userSchema);