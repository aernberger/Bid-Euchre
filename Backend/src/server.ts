import express from "express";
import cors from "cors";
import gameRoutes from "./routes/gameRoutes.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
dotenv.config();

const PORT_NUMBER = process.env.PORT || 8000;

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));

app.use(express.json());

app.use("/api/games", gameRoutes);

// app.listen(8000, () => {
//   console.log("Server running on port 8000");
// });


const httpServer = http.createServer(app);

const wss = new Server(httpServer, 
  {cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },}
); 

httpServer.listen(PORT_NUMBER, () => {
  console.log(`Server running on port ${PORT_NUMBER}`);
});

