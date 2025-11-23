import express from "express";
import {
  getTrainingRequests,
  getTrainingRequestById,
  createTrainingRequest,
  updateTrainingRequest,
  deleteTrainingRequest,
} from "../../controller/Requests/trainingRequestsController.js";

import { auth, allowRoles } from "../../middlewares/auth.js"; // استدعاء الميدل وير

const router = express.Router();

// GET جميع الطلبات => ممكن تخليه لأي موظف مسجل
router.get(
  "/",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  getTrainingRequests
);

// GET طلب محدد => ممكن تخليه لأي موظف مسجل
router.get(
  "/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  getTrainingRequestById
);

// POST إنشاء طلب جديد => فقط لموظف MEMBERSHIP_AND_SERVICE
router.post(
  "/",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  createTrainingRequest
);

// PATCH تعديل طلب => حسب الصلاحيات اللي بدك يحددها
router.patch(
  "/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  updateTrainingRequest
);

// DELETE حذف طلب => حسب الصلاحيات
router.delete(
  "/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  deleteTrainingRequest
);

export default router;
