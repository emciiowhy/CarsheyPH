import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// GET /api/branches
router.get("/", async (req, res, next) => {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        dealership: true,
        inventory: true,
      },
    });

    res.json({
      success: true,
      data: branches,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
