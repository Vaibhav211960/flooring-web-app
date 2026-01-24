import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbConnection = async () => {
  // console.log(mongoose.connect(process.env.MONGO_URI));
  try {
    console.log("hyy");
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
};

export default dbConnection;
