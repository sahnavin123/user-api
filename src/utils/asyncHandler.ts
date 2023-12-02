import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express-serve-static-core';

const asyncHandler =
  (requestHandler: RequestHandler) =>
    (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };

export default asyncHandler;
