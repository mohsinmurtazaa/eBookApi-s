import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }
  try {
    const user = await userModel.findOne({ email });
    if (user) {
      const error = createHttpError(400, "User already exist with this email");
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting user!"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  let newUser: User;
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating user!"));
  }

  //token generation

  try {
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });
    res.status(201).json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "Error wile signing jwt Token"));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(createHttpError(400, "All fields are required"));
  }
  let user: User | null;
  try {
    user = await userModel.findOne({ email });
    if (!user) {
      return next(createHttpError(404, "User not fOUND"));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createHttpError(400, "User name or password incorrect"));
    }
  } catch (error) {
    return next(createHttpError(404, "User not fOUND"));
  }

  try {
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });
    res.json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "Error wile signing jwt Token"));
  }
};

export { createUser, loginUser };
