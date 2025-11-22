// ============================================
// backend/src/routes/branch.routes.ts
// ============================================

import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// GET all branches with dealership and inventory
router.get("/", async (_req, res, next) => {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        dealership: true,
        inventory: true,
      },
    });

    res.json({ success: true, data: branches });
  } catch (error: any) {
    next(error);
  }
});

export default router; // ESM-friendly export
