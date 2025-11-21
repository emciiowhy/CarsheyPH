// ============================================
// backend/src/routes/configuration.routes.ts
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
            where: { clerkId: req.userId },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const config = await prisma.configuration.create({
            data: {
                ...req.body,
                userId: user.id,
            },
        });
        res.status(201).json({ success: true, data: config });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.get('/my-configs', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: req.userId },
            include: {
                configurations: {
                    include: { vehicle: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        res.json({ success: true, data: user?.configurations || [] });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
export default router;
//# sourceMappingURL=configuration.routes.js.map