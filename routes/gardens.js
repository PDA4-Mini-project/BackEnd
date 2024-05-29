const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
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

module.exports = router;
