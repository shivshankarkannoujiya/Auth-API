import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Authentication Middleware
const authMiddleware = asyncHandler(async (req, _, next) => {
    try {
        //TODO: Access token
        const token =
            req.cookies?.accessToken ||
            req.body?.accessToken ||
            req.header("Authorization").replace("Bearer", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized Request !!");
        }

        // TODO: verify Token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        // req.user = user;
        req.user = decodedToken;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid accessToken");
    }
});

// Authorization Middlewares
const isStudent = asyncHandler(async (req, _, next) => {
    try {
        if (req.user.role !== "Student") {
            throw new ApiError(401, "This is Protected Route for Students");
        }
        next();
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "User role can not be verified"
        );
    }
});

const isAdmin = asyncHandler(async (req, _, next) => {
    try {
        if (req.user.role !== "Admin") {
            throw new ApiError(401, "This is Protected Route for Admin");
        }
        next();
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "User role can not be verified"
        );
    }
});

export { authMiddleware, isStudent, isAdmin };
