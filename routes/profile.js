const express = require('express');
const router = express.Router();
const { Sequelize, Review, Profile, userTheme } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.get('/:userId', async (req, res) => {
    //  #swagger.description = '멤버 프로필 조회'
    //  #swagger.tags = ['PROFILE']
    const user_id = req.params.userId;
    try {
        if (!user_id) {
            // 유저 아이디 필요합니다.
            return res.status(400).json({ error: '조회 가능한  유저가 없습니다.' });
        }
        // 프로필에 있는 정보 주기
        const profile = await Profile.findOne({
            where: {
                profile_id: user_id,
            },
        });

        if (!profile) {
            return res.status(400).json({ error: '존재하는 회원이 없습니다.' });
        }
        //유저의 각 테마별 정보 주기
        const userThemes = await userTheme.findAll({
            where: {
                user_id: user_id,
            },
        });

        //평점
        const reviewInfo = await Review.findOne({
            where: {
                review_id: user_id,
            },
        });

        res.status(201).json({ profile, reviewInfo, userThemes });
    } catch (err) {
        res.status(500).json({ error: '프로필 조회 에러' });
    }
});

module.exports = router;
