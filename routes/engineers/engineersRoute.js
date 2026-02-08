import express from "express";
import {
  registerEngineer,
  loginEngineer,
  getAllEngineers,
  getMyProfile,
  submitMembershipRequest,
  submitTrainingRequest,
  submitOfficeOpeningRequest,
  submitPromotionRequest,
  getMyRequests,
  uploadMyMembershipDocuments
} from "../../controller/engineers/engineersController.js";
import { authEngineer } from "../../middlewares/authEngineer.js";
import { uploadMembershipFields } from "../../middlewares/upload.js";

const router = express.Router();

// ==========================================
// المسارات العامة (بدون مصادقة)
// ==========================================

/**
 * تسجيل مهندس جديد
 * POST /api/engineers/register
 */
router.post("/register", registerEngineer);

/**
 * تسجيل دخول المهندس
 * POST /api/engineers/login
 */
router.post("/login", loginEngineer);

/**
 * جلب جميع المهندسين (بدون حماية)
 * GET /api/engineers
 */
router.get("/", getAllEngineers);

// ==========================================
// المسارات المحمية (تحتاج مصادقة)
// ==========================================

/**
 * جلب معلومات المهندس الحالي
 * GET /api/engineers/me
 */
router.get("/me", authEngineer, getMyProfile);

/**
 * جلب جميع طلبات المهندس
 * GET /api/engineers/my-requests
 */
router.get("/my-requests", authEngineer, getMyRequests);

// ==========================================
// تقديم الطلبات
// ==========================================

/**
 * تقديم طلب انتساب
 * POST /api/engineers/requests/membership
 */
router.post("/requests/membership", authEngineer, submitMembershipRequest);

/**
 * تقديم طلب تدريب
 * POST /api/engineers/requests/training
 */
router.post("/requests/training", authEngineer, submitTrainingRequest);

/**
 * تقديم طلب فتح مكتب
 * POST /api/engineers/requests/office-opening
 */
router.post("/requests/office-opening", authEngineer, submitOfficeOpeningRequest);

/**
 * تقديم طلب ترقية
 * POST /api/engineers/requests/promotion
 */
router.post("/requests/promotion", authEngineer, submitPromotionRequest);

/**
 * رفع مرفقات طلب الانتساب (للمهندس فقط - لطلبه الخاص)
 * POST /api/engineers/requests/membership/upload
 */
router.post(
  "/requests/membership/upload",
  authEngineer,
  uploadMembershipFields,
  uploadMyMembershipDocuments
);

export default router;
