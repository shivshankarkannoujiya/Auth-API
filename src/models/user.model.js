import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            trim: true,
        },

        role: {
            type: String,
            enum: ["Admin", "Student", "Visitor"],
        },
    },
    { timestamps: true }
);

// TODO: hash password before saving into db
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// TODO: Check if the password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
        },

        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

const User = mongoose.model("User", userSchema);
export { User };
