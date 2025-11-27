import jwt from "jsonwebtoken";


// التحقق من التوكن
export const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decoded user => ", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// التحقق من الصلاحيات (الأدوار)
export const allowRoles = (requiredRole) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Required role =>", requiredRole);
    console.log("User role =>", user.role);

    if (user.role !== requiredRole) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

