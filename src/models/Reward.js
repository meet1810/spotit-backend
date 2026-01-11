import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Reward = sequelize.define("Reward", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    couponCode: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    expireDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    pointsRequired: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    tableName: 'rewards',
    timestamps: true,
});

export default Reward;
