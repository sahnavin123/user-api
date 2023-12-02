/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/ApiError';

export const customErrorHandler = (
  error: Error, // Ensure it's of type Error
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json(error.toJson());
  } else {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
