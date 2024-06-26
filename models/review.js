module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Review',
        {
            review_id: {
                type: DataTypes.STRING(30),
                primaryKey: true,
                comment: '사용자 ID',
                references: {
                    model: 'Users',
                    key: '_id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            review_score: {
                type: DataTypes.INTEGER,
                defaultValue: 0, //기본값 설정
                comment: '평균 리뷰 평점',
            },
            review_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                comment: '현재까지 리뷰받은 횟수',
            },
        },
        {
            timestamps: true,
            hooks: {
                afterUpdate: async (review) => {
                    review.review_count += 1;
                    review.save();
                },
            },
        }
    );
};
