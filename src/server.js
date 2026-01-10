import "dotenv/config";
import app from "./app.js";
import sequelize from "./config/database.js";

const PORT = 3000;

(async () => {
    try {
        // await sequelize.authenticate();
        // await sequelize.sync({ alter: true });
        // console.log("Database connected");

        app.listen(PORT, () =>
            console.log(`Server running on http://localhost:${PORT}`)
        );
    } catch (err) {
        console.error("DB error:", err);
    }
})();
