import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import { User } from '../models/user.model';
import { uploadOnCloudinary } from '../utils/cloudinary';
import ApiResponse from '../utils/ApiResponse';

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  //get user details from frontend
  const { fullname, email, username, password } = req.body;
  if (
    [fullname, email, username, password].some((field) => field?.trim() === '')
  ) {
    throw new ApiError(400, 'All fields are required');
  }

  //validation - not empty

  // check if user already exists :username, email
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, 'user with email or username already exists');
  }

  //check for images, check for avatar
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  // const avatarLocalPath = req.files?.avatar[0]?.path ;
  const avatarLocalPath = files['avatar'][0]?.path;
  // const coverImageLocalPath = files['coverImage'][0]?.path;

  let coverImageLocalPath;
  if (
    files &&
    Array.isArray(files['coverImage']) &&
    files['coverImage'].length > 0
  ) {
    coverImageLocalPath = files['coverImage'][0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is required');
  }

  // upload them to cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, 'Avatar file is required');
  }

  // create user object - create entry in db

  const user = await User.create({
    fullname,
    avatar: avatar?.secure_url,
    coverImage: coverImage?.secure_url || '',
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove the password and refreshToken field from response
  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering user');
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User registered successfully '));
});

export { registerUser };
