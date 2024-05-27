module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'WaterBottle',
        {
            waterBottle_id: {
                type: DataTypes.STRING(30),
                primaryKey: true,
                comment: '사용자 ID',
                references: {
                    model: 'users',
                    key: '_id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            bottle_count: {
                type: DataTypes.INTEGER,
                comment: '잔여 물뿌리개 갯수',
            },
        },
        {
            timestamps: true,
        }
    );
};
