module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'UserTheme',
        {
            user_id: {
                type: DataTypes.STRING(30),
                primaryKey: true,
                references: {
                    model: 'users',
                    key: '_id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                comment: 'User 아이디',
            },
            theme_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                references: {
                    model: 'themes',
                    key: 'theme_id',
                },
                onDelete: 'CASCADE',
                opUpdate: 'CASCADE',
                comment: 'Theme 아이디',
            },
            exp: {
                type: DataTypes.INTEGER,
                comment: '현재 경험치',
            },
            level: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
                comment: '현재 레벨',
            },
        },
        {
            timestamps: true,
        }
    );
};
