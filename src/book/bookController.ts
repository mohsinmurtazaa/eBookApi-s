import express, { NextFunction, Request, response, Response } from "express";
import path from "path";
import fs from "node:fs";
import cloudinary from "../config/cloudinary";
import bookModel from "./bookModel";
import { AuthRequest } from "../middlewares/authenticate";
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as { [fieldName: string]: Express.Multer.File[] };
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
    );
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: __filename,
      folder: "book-covers",
      format: coverImageMimeType,
    });

    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );
    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdf's",
        format: "pdf",
      }
    );
    const _req = req as AuthRequest;
    const newBook = await bookModel.create({
      title: req.body.title,
      genre: req.body.genre,
      author: _req.userId,
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    await fs.promises.unlink(filePath);
    await fs.promises.unlink(bookFilePath);
    res.status(201).json({ id: newBook._id });
  } catch (error) {
    console.log(error);
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;
  const book = await bookModel.findOne({ _id: bookId });
  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You cannot update others book"));
  }
  const files = req.files as { [fieldName: string]: Express.Multer.File[] };

  let coverPage = "";
  if (files?.coverImage) {
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
    );
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: __filename,
      folder: "book-covers",
      format: coverImageMimeType,
    });
    coverPage = fileName;
    await fs.promises.unlink(filePath);
  }
  let uploadedFile = "";
  if (files?.file) {
    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );
    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdf's",
        format: "pdf",
      }
    );
    uploadedFile = bookFileName;

    await fs.promises.unlink(bookFilePath);
  }
  const updateBook = await bookModel.findOneAndUpdate(
    {
      _id: bookId,
    },
    {
      title: req.body.title,
      genre: req.body.genre,
      coverImage: coverPage ? coverPage : book.coverImage,
      file: uploadedFile ? uploadedFile : book.file,
    },
    {
      new: true,
    }
  );
  res.json(updateBook);
};

const getBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await bookModel.find();
    return response.json(books);
  } catch (error) {
    return next(createHttpError(500, "Error while fetching books"));
  }
};

export { createBook, updateBook, getBooks };
