import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Games API" });
});

export default router;
