import jwt from "jsonwebtoken";

/**
 * Middleware للتحقق من مصادقة المهندسين
 * يتأكد أن المستخدم مهندس وليس موظف
 */
export const authEngineer = (req, res, next) => {
  try {
    // جلب التوكن من الـ headers
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "يجب تسجيل الدخول أولاً"
      });
    }

    // التحقق من التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // تأكد أن المستخدم مهندس وليس موظف
    if (decoded.userType !== "engineer") {
      return res.status(403).json({
        message: "غير مصرح - هذا للمهندسين فقط"
      });
    }

    // حفظ معلومات المهندس في الطلب
    req.engineer = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "توكن غير صالح"
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "انتهت صلاحية التوكن، يرجى تسجيل الدخول مرة أخرى"
      });
    }
    return res.status(500).json({
      message: "حدث خطأ في التحقق من الهوية"
    });
  }
};
