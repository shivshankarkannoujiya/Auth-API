import { Router } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import { loginUser, registerUser } from "../controllers/user.controllers.js";
import {
    authMiddleware,
    isAdmin,
    isStudent,
} from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);



// protected Routes
router.route("/student").get(authMiddleware, isStudent, (_, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "Welcome to protected route for Student"));
});

router.route("/admin").get(authMiddleware, isAdmin, (_, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "Welcome to protected route of Admin"));
});

export default router;
