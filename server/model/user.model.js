import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      maxlength: 30,
    },
    lname: {
      type: String,
      maxlength: 30,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      // maxlength: 15,
    },
    password: {
      type: String,
      required: true,
      // maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      // maxlength: 75,
    },
    contact: {
      type: Number,
      // required: true,
    },
    pincode: {
      type: Number,
      maxlength: 6,
      // required: true,
    },
    address: {
      type: String,
      // required: true,
      // maxlength: 50,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
