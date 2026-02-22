import express from "express";
import cors from "cors";
import gameRoutes from "./routes/gameRoutes.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/games", gameRoutes);
app.listen(8000, () => {
    console.log("Server running on port 8000");
});
