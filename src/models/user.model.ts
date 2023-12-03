/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, Types } from 'mongoose';

interface UserDb {
  _id: Types.ObjectId;
  active: boolean;
  name: string;
  username: string;
  bio?: string;
  age?: number;
  hashedPassword: string;
  deletionTimestamp?: Date | null | undefined;
}

const userSchema = new Schema<UserDb>(
  {
    active: { type: Boolean, required: true, default: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: null,
    },
    age: {
      type: Number,
      default: null,
    },
    hashedPassword: {
      type: String,
      required: [true, 'Password is required'],
    },
    deletionTimestamp: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
