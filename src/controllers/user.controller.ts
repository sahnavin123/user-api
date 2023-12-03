import { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError';
import { User } from '../models/user.model';
import asyncHandler from '../utils/asyncHandler';
import { verifyAccessToken } from '../utils/verifyAccessToken';

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, username, bio, age, password } = req.body;

      if (!username || !password || !name) {
        throw new ApiError(400, 'username, password, name is required field');
      }

      const userAvailable = await User.findOne({ username });
      if (userAvailable) {
        throw new ApiError(
          409,
          `user with ${username} username already exists`
        );
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

    let verifiedToken: jwt.JwtPayload;
    try {
      const accessToken = authHeader?.split(' ')[1] as string;
      verifiedToken = verifyAccessToken(accessToken);
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
      age: user?.age,
    });

    next();
  }
);

export const updateUserDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, username, bio, age } = req.body;

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new ApiError(401, 'Unauthorized - Missing Authorization Header');
      }

      const token = authHeader.split(' ')[1];
      let verifiedToken: jwt.JwtPayload;
      try {
        verifiedToken = verifyAccessToken(token);
      } catch (error) {
        throw new ApiError(401, 'Unauthorized - Invalid Token');
      }

      const user = await User.findById(verifiedToken._id);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      user.name = name || user.name;
      user.username = username || user.username;
      user.bio = bio || user.bio;
      user.age = age || user.age;

      await user.save();

      res.status(201).json({
        message: 'User details updated successfully',
        updatedUser: {
          name: user.name,
          username: user.username,
          bio: user.bio,
          age: user.age,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const deleteUserAccount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new ApiError(401, 'Unauthorized - Missing Authorization Header');
      }

      const token = authHeader.split(' ')[1];

      let verifiedToken: jwt.JwtPayload;
      try {
        verifiedToken = verifyAccessToken(token);
      } catch (error) {
        throw new ApiError(401, 'Unauthorized - Invalid Token');
      }

      const user = await User.findById(verifiedToken._id);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      await user.deleteOne({ _id: user._id });

      // Respond with confirmation
      res.json({
        message: 'User account deleted successfully',
      });

      // const confirmDelete = req.body.confirmDelete;
      // if (!confirmDelete) {
      //   throw new ApiError(400, 'Please confirm the account deletion by providing "confirmDelete: true" in the request body.');
      // }

      // const gracePeriodInMilliseconds = 7 * 24 * 60 * 60 * 1000; // 7 days
      // const deletionTimestamp = Date.now() + gracePeriodInMilliseconds;

      // // Update the user account to mark it for deletion
      // user.deletionTimestamp = new Date(deletionTimestamp);
      // await user.save();

      // // Respond with confirmation and information about the grace period
      // res.json({
      //   message: 'User account marked for deletion. You have a grace period to recover your account.',
      //   gracePeriod: `${gracePeriodInMilliseconds / (24 * 60 * 60 * 1000)} days`,
      // });
    } catch (error) {
      next(error);
    }
  }
);

export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError(401, 'Unauthorized - Missing Authorization Header');
    }

    const token = authHeader.split(' ')[1]; // Assuming Bearer token format

    // Verify the token to get the user ID
    let verifiedToken: jwt.JwtPayload;
    try {
      verifiedToken = verifyAccessToken(token); // Verify the token
    } catch (error) {
      throw new ApiError(401, 'Unauthorized - Invalid Token');
    }

    console.log(verifiedToken);

    // You can add the token to a blacklist here (the implementation is not provided)
    // Blacklisting can be done using a cache, database, or another mechanism.

    // Alternatively, you might implement token expiration and handle it in the client-side.

    // Respond with confirmation of logout
    res.json({
      message: 'User logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

