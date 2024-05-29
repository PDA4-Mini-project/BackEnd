const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const { WaterBottle, UserTheme, Review, sequelize } = require('../models');
const userTheme = require('../models/userTheme');
const client = createClient();

(async () => {
    await client.connect();
})();

router.post('/rooms', async (req, res) => {
    //  #swagger.description = '정원 정보 저장'
    //  #swagger.tags = ['Gardens']
    const { roomId, _id, time, category } = req.body;
    if (!roomId || !_id || !time || !category) {
        return res.status(400).send('All fields (roomId, _id, time, category) are required');
    }

    try {
        await client.hSet(roomId, {
            peerId: _id,
            time: time,
            theme: category,
        });
        res.send('Room data saved successfully');
    } catch (err) {
        return res.status(500).send('Error saving to Redis: ' + err.message);
    }
});

router.get('/rooms', async (req, res) => {
    //  #swagger.description = '정원 목록 조회'
    //  #swagger.tags = ['Gardens']
    try {
        // Redis에서 'roomId'와 일치하는 모든 키를 가져옴
        const keys = await client.keys('*');
        const rooms = {};

        // 모든 키에 대해 hGetAll을 호출하여 데이터를 가져옴
        for (const key of keys) {
            const roomData = await client.hGetAll(key);
            rooms[key] = roomData;
        }

        res.json(rooms);
    } catch (err) {
        return res.status(500).send('Error retrieving from Redis: ' + err.message);
    }
});

router.patch('/end', async (req, res) => {
    //  #swagger.description = '정원 이용 종료 후 수정'
    //  #swagger.tags = ['Gardens']

    // 리뷰를 받을 가드너 아이디,가드너 물뿌리개 증가, 새싹 경험치 올리기,
    const { gardenerId, budId, playTime, themeName, reviewScore } = req.body;
    const transaction = await sequelize.transaction();
    try {
        // 유효성 검사
        if (!gardenerId || !budId || !themeName) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        //리뷰 평가를 안했다면 4점으로 평가
        if (!reviewScore) {
            reviewScore = 4;
        }

        let intReviewScore = parseInt(reviewScore, 10);

        const bottleInfo = await WaterBottle.findOne(
            {
                where: {
                    waterBottle_id: gardenerId,
                },
            },
            { transaction }
        );

        if (!bottleInfo) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Water bottle not found' });
        }

        const reward = parseInt(playTime, 10) / 30;

        bottleInfo.bottle_count += reward;
        await bottleInfo.save({ transaction });

        const reviewInfo = await Review.findOne(
            {
                where: {
                    review_id: gardenerId,
                },
            },
            { transaction }
        );

        if (!reviewInfo) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Reviewee not found' });
        }

        reviewInfo.review_score += intReviewScore;
        await reviewInfo.save({ transaction });

        // 새싹 업데이트

        const userThemeInfo = await UserTheme.findOne(
            {
                where: {
                    user_id: budId,
                    theme_name: themeName,
                },
            },
            { transaction }
        );

        if (!userThemeInfo) {
            await transaction.rollback();
            return res.status(404).json({ error: 'User theme not found' });
        }

        userThemeInfo.exp += reward;
        await userThemeInfo.save({ transaction });

        await transaction.commit();

        return res.status(200).json({ message: 'garden has ended successful!!' });
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: 'Internal sever error' });
    }
});

module.exports = router;
