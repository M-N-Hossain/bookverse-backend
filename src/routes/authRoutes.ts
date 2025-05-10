import express from "express";
import { loginUser, registerUser } from "../controllers/authController";

const router = express.Router();

router.post('/register', registerUser as express.RequestHandler);
router.post('/login', loginUser as express.RequestHandler);

export default router;

