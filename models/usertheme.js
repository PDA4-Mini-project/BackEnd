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
            theme_name: {
                type: DataTypes.STRING,
                primaryKey: true,
                references: {
                    model: 'themes',
                    key: 'name',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                comment: 'Theme 이름',
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
            hooks: {
                afterUpdate: async (userTheme) => {
                    const nextLevelInfo = await sequelize.models.Level.findOne({
                        where: { level_id: userTheme.level },
                    });

                    if (nextLevelInfo && userTheme.exp >= nextLevelInfo.exp_amount) {
                        userTheme.level += 1;
                        userTheme.exp = 0;
                        userTheme.save();
                    }
                },
            },
        }
    );
};
