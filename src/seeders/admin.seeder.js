import "dotenv/config";
import User from "../models/User.js";
import sequelize from "../config/database.js";
import bcrypt from "bcryptjs";

export const seedAdmin = async () => {
    try {
        // await sequelize.authenticate(); // Assume connection works or handle in caller
        // await sequelize.sync(); // Ensure tables exist - Caller should ensure this

        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD not set in .env");
        }

        const existingAdmin = await User.findOne({ where: { email } });

        if (existingAdmin) {
            return "Admin user already exists.";
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({
                name: "Super Admin",
                email,
                password: hashedPassword,
                role: "ADMIN",
            });
            return "Admin user created successfully.";
        }
    } catch (err) {
        throw err;
    }
};

// Execute if run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    seedAdmin()
        .then(msg => { console.log(msg); process.exit(0); })
        .catch(err => { console.error(err); process.exit(1); });
}
