import { clerkClient } from '@clerk/clerk-sdk-node';
export const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const { userId } = await clerkClient.verifyToken(token);
        // FIX: Clerk returns unknown → safely cast to string
        req.userId = userId;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};
export const requireAdmin = (req, res, next) => {
    // Implement later
    next();
};
//# sourceMappingURL=auth.js.map