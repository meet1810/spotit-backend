import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const secret = process.env.JWT_SECRET || "default_secret";
        const verified = jwt.verify(token, secret);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid token" });
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ error: "Access denied: Admins only" });
    }
};

export const requireWorker = (req, res, next) => {
    if (req.user && req.user.role === 'WORKER') {
        next();
    } else {
        res.status(403).json({ error: "Access denied: Workers only" });
    }
};
