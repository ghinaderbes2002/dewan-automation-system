import express from "express";
import {
  createOfficeOpeningRequest,
  getAllOfficeOpeningRequests,
  getOfficeOpeningRequestById,
  updateOfficeOpeningRequest,
  approveOfficeRequest,
  deleteOfficeOpeningRequest,
} from "../../controller/Requests/officeOpeningController.js";

import { auth, allowRoles } from "../../middlewares/auth.js"; // استدعاء الميدل وير

const router = express.Router();

// إنشاء طلب جديد => فقط لموظف MEMEBERSHIP_AND_SERVICE
router.post(
  "/",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  createOfficeOpeningRequest
);

// جلب كل الطلبات
router.get(
  "/",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
 getAllOfficeOpeningRequests
);
// جلب طلب محدد
router.get(
  "/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  getOfficeOpeningRequestById
);

// تحديث أي بيانات أساسية للطلب قبل الموافقة
router.put(
  "/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  updateOfficeOpeningRequest
);

// تحديث بعد دراسة المكتب (الموافقة/الرفض)
router.put(
  "/approve/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  approveOfficeRequest
);

// حذف طلب
router.delete(
  "/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  deleteOfficeOpeningRequest
);

export default router;
