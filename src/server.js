import "dotenv/config";
import app from "./app.js";
import sequelize from "./config/database.js";
import http from "http";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initSocket(server);

(async () => {
    try {

        server.listen(PORT, () =>
            console.log(`Server running on http://localhost:${PORT}`)
        );
    } catch (err) {
        console.error("DB error:", err);
    }
})();
