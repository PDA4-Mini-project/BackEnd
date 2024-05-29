module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Level',
        {
            level_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                comment: '레벨 아이디',
            },
            exp_amount: {
                type: DataTypes.INTEGER,
                comment: '해당 레벨의 필요 경험치',
            },
        },
        {
            timestamps: true,
        }
    );
};
