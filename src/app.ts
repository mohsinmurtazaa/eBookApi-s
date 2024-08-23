import express from "express";
import bookRouter from "./book/bookRouter";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);
app.use(globalErrorHandler);

export default app;
