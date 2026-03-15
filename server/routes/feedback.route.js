import express from "express";
import {
  submitVerifiedFeedback,
  checkFeedbackEligibility,
  editMyFeedback,
  deleteMyFeedback,
  getMyFeedbackHistory,
  getProductReviews,
  getAdminFeedbackLedger,
  approveFeedback,   // NEW: was missing
  rejectFeedback,    // NEW: was missing
  removeFeedback,
} from "../controller/feedback.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();

// ── Customer routes ───────────────────────────────────────────────────────────
router.post("/submit",                                  verifyToken, submitVerifiedFeedback);
router.get("/verify/verify-eligibility/:productId",    verifyToken, checkFeedbackEligibility);
router.get("/my-history",                              verifyToken, getMyFeedbackHistory);
router.get("/product/:productId",                      getProductReviews);
router.put("/:id",                                     verifyToken, editMyFeedback);
router.delete("/:id",                                  verifyToken, deleteMyFeedback);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get("/admin/all",           getAdminFeedbackLedger);

// FIX: these two routes were completely missing — frontend was getting 404
// approve → sets isApproved: true, isRejected: false
// reject  → sets isRejected: true, isApproved: false
router.put("/admin/approve/:id",   approveFeedback);
router.put("/admin/reject/:id",    rejectFeedback);

router.delete("/admin/:id",        removeFeedback);

export default router;