import multer from "multer";
import path from "path";
import { documentTypesMap } from "../utils/documentTypes.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/membership"); // تأكد انو الفولدر موجود
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// نحول كل المفاتيح في documentTypesMap لحقول multer
const fields = Object.keys(documentTypesMap).map((key) => ({
  name: key,
  maxCount: 1, // كل حقل ملف واحد فقط
}));

export const uploadMembershipFields = upload.fields(fields);


