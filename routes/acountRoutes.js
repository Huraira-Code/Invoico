import express from "express";
import { createAccount, signIn } from "../controllers/AccountController.js";
;
const router = express.Router();

router.post("/register", createAccount);
router.post("/login", signIn);
export default router;