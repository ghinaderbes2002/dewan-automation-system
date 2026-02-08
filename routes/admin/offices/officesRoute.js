import express from "express";
import {
  createOffice,
  getOffices,
  updateOffice,
  deleteOffice
} from "../../../controller/admin/offices/officesController.js";
import { auth, allowRoles } from "../../../middlewares/auth.js";

const router = express.Router();

// إنشاء مكتب هندسي
router.post("/", auth, allowRoles("ADMIN"), createOffice);

// جلب كل المكاتب
router.get("/", auth, getOffices);

// تعديل مكتب
router.patch("/:id", auth, allowRoles("ADMIN"), updateOffice);

// حذف مكتب
router.delete("/:id", auth, allowRoles("ADMIN"), deleteOffice);

export default router;
