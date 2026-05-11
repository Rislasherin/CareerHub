import { Router } from "express";

const router = Router();

// TODO: Implement Super Admin Auth Routes
router.post("/login", (req, res) => {
  res.status(501).json({ message: "Not Implemented" });
});

export default router;
