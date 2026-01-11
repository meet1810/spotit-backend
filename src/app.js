import express from "express";
import cors from "cors";
import reportRoutes from "./routes/mobile/report.routes.js";
import authRoutes from "./routes/mobile/auth.routes.js";
import adminAuthRoutes from "./routes/admin/auth.routes.js";
import adminDataRoutes from "./routes/admin/admin.routes.js";
import workerRoutes from "./routes/admin/worker.routes.js";
import dashboardRoutes from "./routes/admin/dashboard.routes.js";
import workerAuthRoutes from "./routes/worker/auth.routes.js";
import workerTaskRoutes from "./routes/worker/task.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import systemRoutes from "./routes/system.routes.js";
import rewardRoutes from "./routes/admin/reward.routes.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse form data
app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use("/uploads", express.static("uploads"));
app.use("/api", reportRoutes);
app.use("/api/auth", authRoutes); // Auth Routes
app.use("/api/admin", adminAuthRoutes); // Admin Auth Routes
app.use("/api/admin", adminDataRoutes); // Admin Data Routes
app.use("/api/admin/workers", workerRoutes); // Admin Worker Routes
app.use("/api/admin/dashboard", dashboardRoutes); // Admin Dashboard Routes
app.use("/api/admin/rewards", rewardRoutes); // Admin Reward Routes
app.use("/api/worker/auth", workerAuthRoutes); // Worker Auth Routes
app.use("/api/worker/tasks", workerTaskRoutes); // Worker Task Routes
app.use("/api/notifications", notificationRoutes); // Notification API
app.use("/", systemRoutes); // Mount at root for /db-panel

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
