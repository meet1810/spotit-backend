import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

const Report = sequelize.define("Report", {
    imagePath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    severity: DataTypes.STRING,
    issueCount: DataTypes.INTEGER,
    aiResponse: {
        type: DataTypes.JSONB
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'),
        defaultValue: 'PENDING'
    },
    category: {
        type: DataTypes.ENUM('GARBAGE', 'ROAD_DAMAGE', 'WATER_LEAKAGE', 'SEWAGE', 'STREET_LIGHT', 'ILLEGAL_PARKING', 'ENCROACHMENT', 'DRAINAGE', 'PUBLIC_SAFETY', 'OTHER'),
        defaultValue: 'GARBAGE'
    },
    assignedWorkerId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    resolutionImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

Report.belongsTo(User, { foreignKey: 'userId', targetKey: 'u_id', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'assignedWorkerId', targetKey: 'u_id', as: 'worker' });
User.hasMany(Report, { foreignKey: 'userId', sourceKey: 'u_id', as: 'reports' });
User.hasMany(Report, { foreignKey: 'assignedWorkerId', sourceKey: 'u_id', as: 'assignedTasks' });

export default Report;
