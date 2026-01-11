import admin from "../config/firebase.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getIO } from "../socket.js";

// Send execution-safe socket emit
const safeEmit = (event, data) => {
    try {
        getIO().emit(event, data);
    } catch (err) {
        console.error("Socket emit failed (Socket.io might not be init):", err.message);
    }
};

/**
 * Send a notification to a specific user
 */
export const sendNotification = async (userId, title, message, type = 'INFO', metadata = {}) => {
    try {
        // 1. Save to DB
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            metadata
        });

        // 2. Emit Socket Event
        safeEmit("notification", notification);

        // 3. Send Push Notification (FCM)
        const user = await User.findByPk(userId);
        if (user && user.fcmToken) {
            try {
                await admin.messaging().send({
                    token: user.fcmToken,
                    notification: {
                        title,
                        body: message
                    },
                    data: {
                        type,
                        ...metadata,
                        click_action: "FLUTTER_NOTIFICATION_CLICK"
                    }
                });
                console.log(`📲 FCM sent to ${user.email}`);
            } catch (fcmErr) {
                console.error("FCM Send Error:", fcmErr.message);
            }
        }

        return notification;
    } catch (err) {
        console.error("Failed to send notification:", err);
    }
};

/**
 * Send a notification to all Admins
 */
export const notifyAdmins = async (title, message, type = 'INFO', metadata = {}) => {
    try {
        const admins = await User.findAll({ where: { role: 'ADMIN' } });

        const promises = admins.map(adminUser =>
            Notification.create({
                userId: adminUser.u_id,
                title,
                message,
                type,
                metadata
            })
        );

        const notifications = await Promise.all(promises);

        notifications.forEach(n => safeEmit("notification", n));

    } catch (err) {
        console.error("Failed to notify admins:", err);
    }
};
