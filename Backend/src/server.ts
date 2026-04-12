import express from "express";
import cors from "cors";
import gameRoutes from "./routes/gameRoutes.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import SocketHandler from "./controller/socketHandler.js";
dotenv.config();
import supabase from "./supabaseClient.js";
import authRoutes from "./routes/authRoutes.js";


const PORT_NUMBER = process.env.PORT || 8000;

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));

app.use(express.json());

app.use("/api/games", gameRoutes);
app.use("/api/auth", authRoutes);

// app.listen(8000, () => {
//   console.log("Server running on port 8000");
// });

app.get("/test-db", async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      return res.status(400).json({ connected: false, error: error.message });
    }
    
    res.json({ 
      connected: true, 
      message: "Successfully reached Supabase!",
      sampleData: data 
    });
  } catch (err: any) {
    res.status(500).json({ connected: false, error: err.message });
  }
});


const httpServer = http.createServer(app);

const wss = new Server(httpServer, 
  {cors: {
    origin: process.env.NODE_ENV === "production" 
      ? (process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN] : false)
      : true,  // allow any origin in dev (reflects request origin)
    methods: ["GET", "POST"],
  },}
);

new SocketHandler(wss);

httpServer.listen(PORT_NUMBER, () => {
  console.log(`Server running on port ${PORT_NUMBER}`);
});

