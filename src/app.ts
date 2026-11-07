import express from "express";
import { userRoutes } from "./modules/user/user.route.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);


app.get("/health", (_req, res) => {
  res.status(200).json({
    message: "Movie API is running"
  });
});


app.use(globalErrorHandler);
export default app;