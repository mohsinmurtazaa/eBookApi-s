import express from "express";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app = express();

//Routes
app.get("/", (req, res, next) => {
  res.json({ message: "welcome " });
});
app.use(globalErrorHandler);

export default app;
