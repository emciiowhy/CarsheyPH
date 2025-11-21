// ============================================
// backend/src/routes/financing.routes.ts
// ============================================
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();
router.post('/', async (req, res) => {
    try {
        const application = await prisma.financingApplication.create({
            data: req.body,
        });
        res.status(201).json({ success: true, data: application });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
export default router;
//# sourceMappingURL=financing.routes.js.map