const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const { WaterBottle, UserTheme, Review, sequelize } = require('../models');
const userTheme = require('../models/userTheme');
const client = createClient();
const { v4: uuidv4 } = require('uuid');
const { Profile, User } = require('../models');
(async () => {
    await client.connect();
    console.log('Connected to Redis');
})();

client.on('error', (err) => {
    console.error('Redis client error', err);
});
router.post('/rooms', async (req, res) => {
    //  #swagger.description = '정원 정보 저장'
    //  #swagger.tags = ['Gardens']
    const { _id, time, category, title } = req.body;
    if (!_id || !time || !category || !title) {
        return res.status(400).send('All fields (_id, time, category, title) are required');
    }

    try {
        const user = await User.findOne({ where: { _id: _id } });
        const name = user ? user.name : '닉네임(이름) 없음';
        const profile = await Profile.findOne({ where: { profile_id: _id } });
        const image_url = profile
            ? profile.image_url
            : 'https://images.unsplash.com/photo-1709588191280-acd9303db2cc?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8NHx8fGVufDB8fHx8fA%3D%3D';
        const createdAt = new Date().toISOString();
        const roomId = uuidv4(); // 임의의 roomId 생성
        await client.hSet(roomId, {
            _id: _id,
            name: name,
            time: time,
            category: category,
            title: title,
            image_url: image_url,
            createdAt: createdAt,
            roomdId: roomId,
        });
        res.status(200).json({ message: 'Room data saved successfully', roomId: roomId });
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
        const rooms = [];

        // 모든 키에 대해 hGetAll을 호출하여 데이터를 가져옴
        for (const key of keys) {
            const roomData = await client.hGetAll(key);
            rooms.push({
                roomId: key,
                ...roomData,
            });
        }

        console.log(rooms);
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
