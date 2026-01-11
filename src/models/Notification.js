import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

const Notification = sequelize.define("Notification", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR'),
        defaultValue: 'INFO'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    metadata: {
        type: DataTypes.JSONB, // Stores extra data like { reportId: 1 }
        allowNull: true
    }
}, {
    timestamps: true
});

Notification.belongsTo(User, { foreignKey: 'userId', targetKey: 'u_id' });
User.hasMany(Notification, { foreignKey: 'userId', sourceKey: 'u_id' });

export default Notification;
