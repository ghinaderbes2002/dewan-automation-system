import express from "express";
import {
  createEmployee,
  getEmployees,
  deleteEmployee,
  updateEmployee,
} from "../../../controller/admin/employees/employeesController.js";
import { auth } from "../../../middlewares/auth.js";

const router = express.Router();

// إنشاء موظف جديد
router.post("/", auth, createEmployee);

// جلب كل الموظفين
router.get("/", auth, getEmployees);
router.patch("/:id", updateEmployee); // تعديل موظف
router.delete("/:id", deleteEmployee);

export default router;
