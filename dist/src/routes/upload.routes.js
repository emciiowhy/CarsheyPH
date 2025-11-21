import { Router } from "express";
import multer from "multer";
import path from "path";
const router = Router();
// Configure file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), "uploads"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + ext);
    },
});
const upload = multer({ storage });
// Upload endpoint
router.post("/image", upload.single("image"), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    return res.json({ url });
});
export default router;
//# sourceMappingURL=upload.routes.js.map