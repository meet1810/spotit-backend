import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
    return jwt.sign(
        { id: user.u_id, email: user.email },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "30d" }
    );
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(req.body);


        // Check if user exists
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const token = generateToken(user);

        res.status(201).json({ success: true, token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Registration failed" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            where: { email }
        });

        if (!user || !user.password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user);
        res.json({ success: true, token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ where: { googleId } });

        if (!user) {
            // Check if email already exists
            user = await User.findOne({ where: { email } });

            if (user) {
                // Link Google account to existing email user
                user.googleId = googleId;
                user.profilePicture = picture || user.profilePicture;
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    name,
                    email,
                    googleId,
                    profilePicture: picture,
                });
            }
        }

        const token = generateToken(user);
        res.json({ success: true, token, user });

    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(401).json({ error: "Google authentication failed" });
    }
};

export const logout = (req, res) => {
    // For JWT, logout is client-side (delete token). 
    // We just return success confirmation here.
    res.json({ success: true, message: "Logged out successfully" });
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ error: "User not found" });

        // Update fields if provided
        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();

        res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update profile" });
    }
};
