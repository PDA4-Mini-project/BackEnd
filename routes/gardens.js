const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const client = createClient();
const { v4: uuidv4 } = require('uuid');

(async () => {
    await client.connect();
})();

router.post('/rooms', async (req, res) => {
    //  #swagger.description = '정원 정보 저장'
    //  #swagger.tags = ['Gardens']
    const { _id, time, category } = req.body;
    if (!_id || !time || !category) {
        return res.status(400).send('All fields (_id, time, category) are required');
    }

    try {
        const roomId = uuidv4(); // 임의의 roomId 생성
        await client.hSet(roomId, {
            peerId: _id,
            time: time,
            theme: category,
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

        res.json(rooms);
    } catch (err) {
        return res.status(500).send('Error retrieving from Redis: ' + err.message);
    }
});

module.exports = router;
