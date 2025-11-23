import express from "express";
import {
  getPromotionRequests,
  getPromotionRequestById,
  createPromotionRequest,
  updatePromotionRequest,
  deletePromotionRequest,
} from "../../controller/Requests/promotionRequestsController.js";

import { auth, allowRoles } from "../../middlewares/auth.js";

const router = express.Router();

// GET جميع طلبات الترقيات
router.get(
  "/",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  getPromotionRequests
);

// GET طلب ترقية محدد
router.get(
  "/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  getPromotionRequestById
);

// POST إنشاء طلب ترقية مع المؤهلات والخبرات
router.post(
  "/",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  createPromotionRequest
);

// PATCH تعديل طلب ترقية مع المؤهلات والخبرات
router.patch(
  "/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  updatePromotionRequest
);

// DELETE حذف طلب ترقية
router.delete(
  "/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  deletePromotionRequest
);

export default router;
