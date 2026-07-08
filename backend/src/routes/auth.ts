import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "rex-os-dev-secret-change-in-production";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "rex-os-admin";

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { password } = req.body as { password?: string };

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  // Sign a token valid for 30 days
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ success: true, token });
});

// POST /api/auth/verify  — lets the frontend quickly validate a stored token
router.post("/verify", (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token) return res.status(400).json({ valid: false });
  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ valid: true });
  } catch {
    res.json({ valid: false });
  }
});

export default router;
