"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const User_1 = require("../../models/schema/auth/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const auth_1 = require("../../utils/auth");
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        throw new BadRequest_1.BadRequest("Email and password are required");
    const user = await User_1.User.findOne({ email }).select("+password");
    if (!user || !user.password)
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    if (!user.emailVerified)
        throw new Errors_1.ForbiddenError("Please verify your email first.");
    // 🔹 Generate JWT (valid 7 days)
    const token = (0, auth_1.generateToken)({
        id: user._id.toString(),
        name: user.name,
        role: user.role,
    });
    (0, response_1.SuccessResponse)(res, { message: "Login successful.", token, user: user.name, role: user.role, email: user.email, _id: user._id }, 200);
};
exports.login = login;
