import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const employee = await prisma.diwan_employees.findUnique({
      where: { username },
    });

    if (!employee) {
      return res.status(400).json({ message: "الاسم أو كلمة المرور خاطئة" });
    }

    if (!employee.is_active) {
      return res.status(403).json({ message: "الحساب معطل" });
    }

    const valid = await bcrypt.compare(password, employee.password_hash);

    if (!valid) {
      return res.status(400).json({ message: "الاسم أو كلمة المرور خاطئة" });
    }

    const token = jwt.sign(
      {
        id: employee.id,
        full_name: employee.full_name,
        role: employee.job_role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "تم تسجيل الدخول",
      token,
      employee: {
        id: employee.id,
        full_name: employee.full_name,
        role: employee.job_role,
        username: employee.username,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "خطأ بالسيرفر" });
  }
};

export const me = (req, res) => {
  res.json(req.user);
};

