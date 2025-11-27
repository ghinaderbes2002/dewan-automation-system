import multer from "multer";
import path from "path";
import { promotionDocumentTypesMap } from "../utils/documentTypes.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/promotion");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const fields = Object.keys(promotionDocumentTypesMap).map((key) => ({
  name: key,
  maxCount: 1,
}));

export const uploadPromotionFields = upload.fields(fields);
