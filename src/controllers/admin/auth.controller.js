import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign(
        { id: user.u_id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "12h" } // Admin session 12h
    );
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user || user.role !== 'ADMIN') {
            return res.status(401).json({ error: "Invalid admin credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid admin credentials" });
        }

        const token = generateToken(user);
        return res.json({ success: true, token, admin: { name: user.name, email: user.email } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Login failed" });
    }
};

export const verify = (req, res) => {
    // Middleware already verified token
    return res.json({ success: true, valid: true, user: req.user });
};
