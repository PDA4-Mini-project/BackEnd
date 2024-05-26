const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const Auth = sequelize.define(
        'Auth',
        {
            userId: {
                type: DataTypes.STRING(30),
                primaryKey: true,
                unique: true,
                allowNull: false,
                references: {
                    model: 'Users', // User 모델의 테이블 이름
                    key: '_id',
                },
                comment: '사용자 ID',
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: '해시된 비밀번호',
            },
        },
        {
            timestamps: true, // 생성 및 업데이트 타임스탬프를 자동으로 관리
            hooks: {
                beforeCreate: async (auth) => {
                    const salt = await bcrypt.genSalt(10);
                    auth.password = await bcrypt.hash(auth.password, salt);
                },
                beforeUpdate: async (auth) => {
                    if (auth.changed('password')) {
                        const salt = await bcrypt.genSalt(10);
                        auth.password = await bcrypt.hash(auth.password, salt);
                    }
                },
            },
        }
    );

    return Auth;
};
