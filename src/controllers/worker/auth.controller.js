import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign(
        { id: user.u_id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "30d" }
    );
};

export const login = async (req, res) => {
    try {
        const { email, password, fcmToken } = req.body;
        console.log(req.body);


        const user = await User.findOne({ where: { email } });

        if (!user || user.role !== 'WORKER') {
            return res.status(401).json({ error: "Invalid worker credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid worker credentials" });
        }

        if (fcmToken) {
            user.fcmToken = fcmToken;
            await user.save();
        }

        const token = generateToken(user);
        return res.json({ success: true, token, worker: { name: user.name, email: user.email } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Login failed" });
    }
};
