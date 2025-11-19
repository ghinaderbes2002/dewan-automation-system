import express from "express";
import { login, me } from "../../controller/auth/authController.js";
import { auth } from "../../middlewares/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", auth, me);

export default router;
