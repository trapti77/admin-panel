import mongoose, { model, Schema, Types } from "mongoose";

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
    
    
},{timestamps:true})

const Register = new model("Register", userSchema);

module.exports= Register;