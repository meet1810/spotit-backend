import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

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

export default Report;
