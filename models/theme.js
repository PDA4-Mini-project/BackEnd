module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Theme',
        {
            theme_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '테마 아이디',
            },
            name: {
                type: DataTypes.STRING,
                comment: '테마 이름',
            },
        },
        {
            timestamps: true,
            indexes: [
                {
                    unique: false,
                    fields: ['name'],
                },
            ],
        }
    );
};
