import Admin from "../model/admin.model.js";
import express from "express";
import { adminLogin } from "../controller/admin.controller.js";

const router = express.Router();

// Admin login route
router.post("/login", adminLogin);

export default router;