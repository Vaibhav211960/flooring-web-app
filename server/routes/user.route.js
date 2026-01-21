// backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import { loginUser , registerUser } from "../controller/auth.controller.js";
import{ getAllUsers, getUserById , updateMyProfile ,getMyProfile, changePassword} from "../controller/user.controller.js";

const router = express.Router();

router.post("/login", loginUser)
router.post("/signup", registerUser)
router.get("/getAllUser", getAllUsers)
router.get("/me", getMyProfile)
router.put("/me", updateMyProfile);
router.put("/me/change-password", changePassword);
router.get("/getUser/:id", getUserById)

// POST /api/auth/register
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Name, email and password are required" });
//     }

//     // check if user already exists
//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res
//         .status(409)
//         .json({ message: "An account with this email already exists" });
//     }

//     const passwordHash = await bcrypt.hash(password, 10);

//     const user = await User.create({ name, email, passwordHash });

//     // don't send hash to client
//     const safeUser = {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//     };

//     res.status(201).json({
//       message: "User registered successfully",
//       user: safeUser,
//     });
//   } catch (err) {
//     console.error("Register error:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// POST /api/auth/login
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const isMatch = await bcrypt.compare(password, user.passwordHash);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const safeUser = {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//     };

//     // if later you add JWT or sessions, set them here
//     res.json({
//       message: "Login successful",
//       user: safeUser,
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

export default router;
