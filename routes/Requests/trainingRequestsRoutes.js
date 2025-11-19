import express from "express";
import {
  getTrainingRequests,
  getTrainingRequestById,
  createTrainingRequest,
  updateTrainingRequest,
  deleteTrainingRequest,
} from "../../controller/Requests/trainingRequestsController.js";

const router = express.Router();

// GET جميع الطلبات
router.get("/", getTrainingRequests);

// GET طلب محدد
router.get("/:id", getTrainingRequestById);

// POST إنشاء طلب جديد
router.post("/", createTrainingRequest);

// PATCH تعديل طلب
router.patch("/:id", updateTrainingRequest);

// DELETE حذف طلب
router.delete("/:id", deleteTrainingRequest);

export default router;
