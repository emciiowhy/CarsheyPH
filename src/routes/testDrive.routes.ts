// ============================================
// backend/src/routes/testDrive.routes.ts
// ============================================

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateUser);

router.post('/', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: req.userId! },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const testDrive = await prisma.testDrive.create({
            data: {
                ...req.body,
                userId: user.id,
            },
        });

        res.status(201).json({ success: true, data: testDrive });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/my-bookings', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: req.userId! },
            include: {
                testDrives: {
                    include: { vehicle: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        res.json({ success: true, data: user?.testDrives || [] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
