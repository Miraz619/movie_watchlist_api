import express from "express";
import { userRoutes } from "./modules/user/user.route.js";


const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);


app.get("/health", (_req, res) => {
  res.status(200).json({
    message: "Movie API is running"
  });
});

export default app;