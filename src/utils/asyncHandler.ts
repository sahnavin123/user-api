import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express-serve-static-core';

const asyncHandler = (requestHandler: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

// const asyncHandler =
//   (requestHandler: RequestHandler) =>
//     (req: Request, res: Response, next: NextFunction) => {
//       Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//     };

export { asyncHandler };

// class CustomError extends Error {
//   code?: number;

//   constructor (message: string, code?: number) {
//     super(message);
//     this.code = code;
//   }
// }

// const asyncHandler =
//   (fn: RequestHandler) =>
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         await fn(req, res, next);
//       } catch (err) {
//         if (err instanceof CustomError) {
//           res.status(err.code || 500).json({
//             success: false,
//             message: err.message,
//           });
//         } else {
//           res.status(500).json({
//             success: false,
//             message: 'Internal Server Error',
//           });
//         }
//       }
//     };
