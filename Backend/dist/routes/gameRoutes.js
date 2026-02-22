import express from "express";
const router = express.Router();
router.get("/", (_req, res) => {
    res.json({ message: "Games API" });
});
export default router;
