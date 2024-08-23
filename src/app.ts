import express from "express";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();

//Routes
app.get("/", (req, res, next) => {
  res.json({ message: "welcome " });
});
app.use("/api/users", userRouter);
app.use(globalErrorHandler);

export default app;
