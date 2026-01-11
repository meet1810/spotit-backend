import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";
import Reward from "./Reward.js";

const UserReward = sequelize.define("UserReward", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'u_id'
        }
    },
    rewardId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Reward,
            key: 'id'
        }
    },
    pointsSpent: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    couponCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'REDEEMED', 'EXPIRED'),
        defaultValue: 'ACTIVE',
    }
}, {
    tableName: 'user_rewards',
    timestamps: true,
});

// Associations
User.hasMany(UserReward, { foreignKey: 'userId', as: 'boughtRewards' });
UserReward.belongsTo(User, { foreignKey: 'userId' });

Reward.hasMany(UserReward, { foreignKey: 'rewardId', as: 'purchases' });
UserReward.belongsTo(Reward, { foreignKey: 'rewardId' });

export default UserReward;
