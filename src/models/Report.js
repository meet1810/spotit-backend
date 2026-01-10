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
        type: DataTypes.STRING,
        defaultValue: "PENDING"
    }
}, {
    timestamps: true
});

Report.belongsTo(User, { foreignKey: 'userId', targetKey: 'u_id' });
User.hasMany(Report, { foreignKey: 'userId', sourceKey: 'u_id' });

export default Report;
