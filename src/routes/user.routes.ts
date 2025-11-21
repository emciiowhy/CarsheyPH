// ============================================
// backend/src/routes/user.routes.ts
// ============================================

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateUser);

router.get('/profile', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId! },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/saved-vehicles', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId! },
      include: {
        savedVehicles: {
          include: {
            vehicle: {
              include: {
                images: { take: 1, orderBy: { order: 'asc' } },
                category: true,
              },
            },
          },
        },
      },
    });

    res.json({ success: true, data: user?.savedVehicles || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/saved-vehicles', async (req, res) => {
  try {
    const { vehicleId } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId! },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const saved = await prisma.savedVehicle.create({
      data: {
        userId: user.id,
        vehicleId,
      },
    });

    res.json({ success: true, data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/saved-vehicles/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId! },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await prisma.savedVehicle.deleteMany({
      where: {
        userId: user.id,
        vehicleId,
      },
    });

    res.json({ success: true, message: 'Vehicle removed from saved list' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;