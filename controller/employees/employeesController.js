import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const createEmployee = async (req, res) => {
  try {
    const { full_name, username, job_role, password } = req.body;

    const password_hash = await bcrypt.hash(password, 10);

    const employee = await prisma.diwan_employees.create({
      data: {
        full_name,
        username,
        job_role,
        password_hash,
        is_active: true,
      },
    });

    res.json({ message: "تم إنشاء الموظف", employee });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "خطأ بالسيرفر" });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.diwan_employees.findMany();
    res.json(employees);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "خطأ بالسيرفر" });
  }
};

// تعديل موظف
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, job_role, username, password, is_active } = req.body;

    const data = { full_name, job_role, username, is_active };
    if (password) {
      data.password_hash = await bcrypt.hash(password, 10);
    }

    const employee = await prisma.diwan_employees.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json({ message: "تم تعديل الموظف", employee });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "خطأ بالسيرفر" });
  }
};

// حذف موظف
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.diwan_employees.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "تم حذف الموظف" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "خطأ بالسيرفر" });
  }
};