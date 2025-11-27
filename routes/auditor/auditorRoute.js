
import express from "express";
import {
  getPendingRequestsByType,
  getRequestByIdAndType,
  auditRequestByType,
} from "../../controller/auditor/auditorController.js";
import { auth, allowRoles } from "../../middlewares/auth.js";

const router = express.Router();

//  مشاهدة كل الطلبات المعلقة حسب النوع
// type: membership | training | office_opening | promotion
router.get(
  "/requests/:type",
  auth,
  allowRoles("AUDITOR"),
  getPendingRequestsByType
);

//  مشاهدة تفاصيل طلب محدد حسب النوع
router.get(
  "/requests/:type/:id",
  auth,
  allowRoles("AUDITOR"),
  getRequestByIdAndType
);

//  مراجعة الطلب وتحديث حالته حسب النوع

router.patch(
  "/requests/:type/:id/audit",
  auth,
  allowRoles("AUDITOR"),
  auditRequestByType
);

export default router;
