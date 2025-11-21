// ============================================
// backend/src/routes/tradeIn.routes.ts
// ============================================
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();
router.post('/', async (req, res) => {
    try {
        const tradeIn = await prisma.tradeIn.create({
            data: req.body,
        });
        res.status(201).json({ success: true, data: tradeIn });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
export default router;
//# sourceMappingURL=tradeIn.routes.js.map