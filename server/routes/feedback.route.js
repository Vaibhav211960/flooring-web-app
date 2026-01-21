import express from "express";
import {
  addFeedback,
  getMyFeedback,
  getFeedbackByProduct,
  getAllFeedback,
  deleteFeedback,
} from "../controller/feedback.controller.js";

const router = express.Router();

// customer
router.post("/", addFeedback);
router.get("/my", getMyFeedback);
router.get("/product/:productId", getFeedbackByProduct);

// admin
router.get("/", getAllFeedback);
router.delete("/:id", deleteFeedback);

export default router;
