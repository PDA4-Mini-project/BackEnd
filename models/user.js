const sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            _id: {
                type: DataTypes.STRING(30),
                primaryKey: true,
                unique: true,
                allowNull: false,
                comment: '사용자 ID',
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '사용자 이름',
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '사용자 이메일',
            },
        },
        {
            timestamps: true,
        }
    );
    /**
     * Auth모델과 1:1 관계를 설정, Auth모델에서 userId 필드로 User 테이블의 _id 필드를 참조하겠다라는 의미
     * as로 관계 별칭 설정. User모델의 인스턴스에서 연결된 Auth테이블에 접근 시, .auth로 접근 가능
     */
    User.hasOne(sequelize.models.Auth, {
        foreignKey: 'userId',
        as: 'auth',
        onDelete: 'CASCADE',
    });

    return User;
};
