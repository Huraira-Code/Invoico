import Account from "../models/AccountModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// --- Register / Create Account ---
export const createAccount = async (req, res) => {
    try {
        const { email, password } = req.body;
        const name = req.body.username
        console.log(req.body)

        // 1. Check existing user
        const existingUser = await Account.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);



        // 4. Create account
        const newAccount = new Account({
            name,
            email,
            password: hashedPassword,

        });

        await newAccount.save();

        res.status(201).json({
            message: "Account created successfully",
            user: {
                id: newAccount._id,
                name,
                email,
            }
        });

    } catch (error) {
        console.log("error", error)
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// --- Sign In ---
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body)

        // 1. Find user by email
        const user = await Account.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3. Generate JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "your_fallback_secret",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email:user.email

            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

