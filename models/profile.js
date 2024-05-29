module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Profile',
        {
            profile_id: {
                type: DataTypes.STRING(30),
                primaryKey: true,
                comment: '사용자 ID',
                references: {
                    model: 'Users',
                    key: '_id',
                },
            },
            portfolio_url: {
                type: DataTypes.STRING,
                comment: '포트폴리오 링크',
            },
            introduction: {
                type: DataTypes.STRING,
                comment: '자기소개',
            },
            image_url: {
                type: DataTypes.STRING,
                comment: '프로필 사진 URL',
            },
        },
        {
            timestamps: true,
        }
    );
};
