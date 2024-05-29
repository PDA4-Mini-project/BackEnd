const express = require('express');
const router = express.Router();
const { Sequelize, Review } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

router.post('/', async (req, res) => {
    //  #swagger.description = '리뷰 등록'
    //  #swagger.tags = ['REVIEWS']
    const { review_id, review_score } = req.body;

    try {
        const reviewee = await Review.findOne({
            where: {
                review_id: review_id,
            },
        });

        if (!reviewee) {
            return res.status(400).json({ error: '리뷰 대상을 찾을 수 없습니다.' });
        }

        //리뷰 받을 대상을 성공적으로 찾은 경우
        let score = parseInt(review_score);
        reviewee.review_score += score;
        reviewee.save();

        res.status(201).json({ message: 'User reviewed successfully' });
    } catch (err) {
        res.status(500).json({ error: '리뷰 에러' });
    }
});

module.exports = router;
