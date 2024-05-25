// const equelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'User',
        {
            _id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '사용자 ID',
            },
            name: {
                type: DataTypes.STRING,
                comment: '사용자 이름',
            },
            email: {
                type: DataTypes.STRING,
                comment: '사용자 이메일',
            },
        },
        {
            timestamps: true,
        }
    );
};
