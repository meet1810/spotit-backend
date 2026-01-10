import sequelize from "../config/database.js";
import { seedAdmin } from "../seeders/admin.seeder.js";

// Render the EJS panel
export const renderPanel = (req, res) => {
    res.render("db-panel", { message: null, error: null });
};

// Handle DB Actions
export const handleDbAction = async (req, res) => {
    const { action } = req.body;
    let message = null;
    let error = null;

    try {
        if (action === "sync") {
            await sequelize.sync({ alter: true });
            message = "Database Synced (Alter) successfully!";
        } else if (action === "force_sync") {
            await sequelize.sync({ force: true });
            message = "Database Force Synced (Tables Recreated) successfully!";
        } else if (action === "drop") {
            await sequelize.drop();
            message = "Database Dropped (All tables deleted) successfully!";
        } else if (action === "seed_admin") {
            const result = await seedAdmin();
            message = "Admin Seeder: " + result;
        } else {
            error = "Invalid action specified.";
        }
    } catch (err) {
        console.error("DB Action Failed:", err);
        error = "Action failed: " + err.message;
    }

    res.render("db-panel", { message, error });
};
