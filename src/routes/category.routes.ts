// ============================================
// backend/src/routes/category.routes.ts
// ============================================

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateUser, requireAdmin } from "../middleware/auth.js";


const router = Router();
const prisma = new PrismaClient();

// ============================================
// PUBLIC ROUTES
// ============================================

// GET all categories
router.get("/", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { vehicles: true } } },
    });

    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET category by slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { vehicles: true } } },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// CREATE category
router.post("/", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, icon, order } = req.body;
    const category = await prisma.category.create({
      data: { name, slug, description, icon, order: order || 0 },
    });

    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE category
router.put("/:id", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.update({ where: { id }, data: req.body });

    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE category
router.delete("/:id", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router; // ESM-friendly export
