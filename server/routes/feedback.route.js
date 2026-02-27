import express from "express";
import {
  submitVerifiedFeedback,
  checkFeedbackEligibility,
  editMyFeedback,
  deleteMyFeedback,
  getMyFeedbackHistory,
  getProductReviews,
  getAdminFeedbackLedger,
  removeFeedback,
} from "../controller/feedback.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();

// --- Customer Routes ---
router.post("/submit", verifyToken, submitVerifiedFeedback);
router.get("/verify-eligibility/:productId", verifyToken, checkFeedbackEligibility);
router.get("/my-history", verifyToken, getMyFeedbackHistory);
router.get("/product/:productId", getProductReviews);

// Edit & Delete own review
router.put("/:id", verifyToken, editMyFeedback);
router.delete("/:id", verifyToken, deleteMyFeedback);

// --- Admin Routes ---
router.get("/admin/all", getAdminFeedbackLedger);
router.delete("/admin/:id", removeFeedback);

export default router;