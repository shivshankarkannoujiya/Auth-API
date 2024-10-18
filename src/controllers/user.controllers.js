import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if ([name, email, password, role].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required !!");
    }

    const existedUser = await User.findOne({
        $or: [{ email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User already exist with email");
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering User");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, "User register Successfully !!", createdUser)
        );
});

export { registerUser };
