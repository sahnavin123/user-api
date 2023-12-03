import { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError';
import { User } from '../models/user.model';
import asyncHandler from '../utils/asyncHandler';
import { blacklistedTokens, invalidateToken, isTokenBlacklisted, verifyAccessToken } from '../utils/accessToken.util';

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, username, bio, age, password } = req.body;

      if (!username || !password || !name || !bio || !age) {
        throw new ApiError(400, 'all fields are required');
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
          id: user.id,
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

      if (!user) {
        throw new ApiError(404, 'user not found');
      }

      if (user && (await bcrypt.compare(password, user.hashedPassword))) {
        const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET as string,
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
    const accessToken = authHeader?.split(' ')[1] as string;

    if (isTokenBlacklisted(accessToken)) {
      throw new ApiError(401, 'Unauthorized - Token has been invalidated');
    }

    try {
      verifiedToken = verifyAccessToken(accessToken);
    } catch (error) {
      throw new ApiError(401, 'Invalid authorization header');
    }

    const user = await User.findOne({ _id: verifiedToken.id });

    if (!user) {
      throw new ApiError(404, 'no user data found');
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

      if (isTokenBlacklisted(token)) {
        throw new ApiError(401, 'Unauthorized - Token has been invalidated');
      }

      let verifiedToken: jwt.JwtPayload;
      try {
        verifiedToken = verifyAccessToken(token);
      } catch (error) {
        throw new ApiError(401, 'Unauthorized - Invalid Token');
      }

      const userNameExist = await User.findOne({ username });
      if (userNameExist) {
        throw new ApiError(401, 'This user name have already been used try new user name');
      }

      const user = await User.findById(verifiedToken.id);
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

export const deleteUserAccount = asyncHandler( async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Retrieve the user's authentication token from the request headers
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError(401, 'Unauthorized - Missing Authorization Header');
    }

    const token = authHeader.split(' ')[1];

    const verifiedToken = verifyAccessToken(token);

    const user = await User.findById(verifiedToken.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Confirm that the password matches
    const { password } = req.body;
    if (!password || !(await bcrypt.compare(password, user.hashedPassword))) {
      throw new ApiError(401, 'Unauthorized - Incorrect Password Confirmation');
    }

    // Delete the user
    await user.deleteOne();

    // Respond with confirmation
    res.json({
      message: 'User account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError(401, 'Unauthorized - Missing Authorization Header');
    }

    const token = authHeader.split(' ')[1]; // Assuming Bearer token format
    if (isTokenBlacklisted(token)) {
      throw new ApiError(401, 'Unauthorized - Token has been invalidated');
    }

    let verifiedToken: jwt.JwtPayload;
    try {
      verifiedToken = verifyAccessToken(token);
    } catch (error) {
      throw new ApiError(401, 'Unauthorized - Invalid Token');
    }

    const user = await User.findById(verifiedToken.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    invalidateToken(token);
    res.json({
      message: 'User logged out successfully',
    });

    console.log(blacklistedTokens);
  } catch (error) {
    next(error);
  }
});
