import { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError';
import { User } from '../models/user.model';
import asyncHandler from '../utils/asyncHandler';

const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, username, bio, age, password } = req.body;

      if (!username || !password || !name) {
        throw new ApiError(400, 'username, password, name is required field');
      }

      const userAvailable = await User.findOne({ username });
      if (userAvailable) {
        throw new ApiError(409, `user with ${username} username already exists`);
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        active: true,
        username,
        hashedPassword,
        name,
        bio,
        age,
      });


      if (user) {
        return res.status(201).json({
          _id: user.id,
          message: 'user created successfully',
          username: user.username,
          name: user.name,
          bio: user.bio,
          age: user.age,
        });
      } else {
        throw new ApiError(400, 'user data is not valid');
      }
    } catch (error) {
      next(error);
    }
  }
);

export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        throw new ApiError(400, 'All fields are mandatory');
      }

      const user = await User.findOne({ username });

      if (user && (await bcrypt.compare(password, user.hashedPassword))) {
        const accessToken = jwt.sign(
          {
            _id: user.id,
            username: user.username,
          },
          process.env.ACCESS_TOKEN_SECRET as string,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );
        return res.status(200).json({
          name: user.name,
          username: user.username,
          accessToken: accessToken,
        });
      } else {
        throw new ApiError(401, 'username or password is not valid');
      }
    } catch (error) {
      next(error);
    }
  }
);

export const getUserDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError(401, 'not authorization header found');
    }

    let verifiedToken : jwt.JwtPayload;
    try {
      const accessToken = authHeader?.split(' ')[1] as string;
      verifiedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as jwt.JwtPayload;

    } catch (error) {
      throw new ApiError(401, 'Invalid authorization header');
    }

    const user = await User.findOne({ _id: verifiedToken._id });

    if (!user) {
      new ApiError(404, 'no user data found');
    }

    res.send({
      name: user?.name,
      username: user?.username,
      bio: user?.bio,
      age: user?.age
    });

    next();
  }
);
export const updateUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    res.send({ message: 'hello' });
  }
);
export const deleteUserAccount = asyncHandler(
  async (req: Request, res: Response) => {
    res.send({ message: 'hello' });
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.send({ message: 'hello' });
});

export { registerUser };
