const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const client = createClient();

(async () => {
    await client.connect();
})();

router.post('/rooms', async (req, res) => {
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

module.exports = router;
