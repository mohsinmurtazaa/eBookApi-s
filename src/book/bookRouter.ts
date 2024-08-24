import express from "express";
import multer from "multer";
import path from "path";
import authenticate from "../middlewares/authenticate";
import {
  createBook,
  deleteBook,
  fetchBook,
  listBooks,
  updateBook,
} from "./bookController";
const bookRouter = express.Router();

const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fileSize: 3e7 }, //30mb
});

bookRouter.post(
  "/create",
  authenticate,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "file",
      maxCount: 1,
    },
  ]),
  createBook
);

bookRouter.patch(
  "/:bookId",
  authenticate,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "file",
      maxCount: 1,
    },
  ]),
  updateBook
);

bookRouter.get("/", listBooks);

bookRouter.get("/:bookId", fetchBook);
bookRouter.delete("/:bookId", authenticate, deleteBook);

export default bookRouter;
