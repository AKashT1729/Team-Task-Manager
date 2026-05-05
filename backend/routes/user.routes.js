import { Router } from "express";

const router = Router();

router.post("/register", async (req, res) => {
  res.status(200).json({ message: "Register route" });
});

router.post("/login", async (req, res) => {
  res.status(200).json({ message: "Login route" });
});

export default router;