import { Request, Response } from "express";
import { User } from "../../models/schema/auth/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ForbiddenError, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { generateToken } from "../../utils/auth";
import { Types } from "mongoose";


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) throw new BadRequest("Email and password are required");

  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.password)
    throw new UnauthorizedError("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new UnauthorizedError("Invalid email or password");

  if (!user.emailVerified)
    throw new ForbiddenError("Please verify your email first.");

  // 🔹 Generate JWT (valid 7 days)
  const token = generateToken(
    {
      id: (user._id as Types.ObjectId).toString(),
      name: user.name,
      role: user.role,
    },
  );

  SuccessResponse(res, { message: "Login successful.", token, user: user.name, role: user.role, email: user.email ,_id: user._id }, 200);
};
