import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const generateAccessTokens = async function (userId) {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();

        user.accessToken = accessToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating Access Token !!"
        );
    }
};

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

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!(email && password)) {
        throw new ApiError(400, "All fields are required !!");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User with email not exist please register !!");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credential");
    }

    const { accessToken } = await generateAccessTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password");
    

    // send token in Cookie
    const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200, "User loggedIn Successfully !!", loggedInUser)
        );
});

export { registerUser, loginUser };
