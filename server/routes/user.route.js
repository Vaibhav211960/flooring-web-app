// backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import { loginUser , registerUser } from "../controller/auth.controller.js";
import{ getAllUsers, getUserById , updateMyProfile ,getMyProfile, changePassword , blockUser} from "../controller/user.controller.js";
import verifyToken from "../middleware/auth.middleware.js";
import adminAuth from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/login", loginUser)
router.post("/signup", registerUser)
router.get("/getAllUsers", getAllUsers)
router.get("/me", verifyToken , getMyProfile)
router.put("/me", verifyToken, updateMyProfile);
router.put("/me/change-password", verifyToken, changePassword);
router.get("/getUser/:id", getUserById)
router.put("/:id", blockUser);

export default router;