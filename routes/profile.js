const express = require('express');
const router = express.Router();
const { Sequelize, Review, Profile, UserTheme, User } = require('../models');
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
        const userThemes = await UserTheme.findAll({
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

        let averageScore = Math.ceil(reviewInfo.review_score / reviewInfo.review_count);
        if (averageScore > 5) {
            averageScore = 5;
        }
        const reviewData = {
            average_score: averageScore,
        };

        console.log(reviewData);

        // 유저 이름
        const userInfo = await User.findOne({
            where: {
                _id: user_id,
            },
        });

        const userName = { userName: userInfo.name };

        res.status(201).json({ profile, reviewData, userName, userThemes });
    } catch (err) {
        res.status(500).json({ error: '프로필 조회 에러' });
    }
});

router.post('/image', async (req, res) => {
    //  #swagger.description = '프로필 이미지 수정'
    //  #swagger.tags = ['PROFILE']

    const { user_id, profile_img_url } = req.body;

    try {
        const profile = await Profile.findOne({
            where: {
                profile_id: user_id,
            },
        });

        if (profile) {
            await profile.update({ image_url: profile_img_url });
            res.status(201).json({ message: 'Profile image change Successful!' });
        } else {
            res.status(404).json({ error: '프로필을 찾을 수 없습니다.' });
        }
    } catch (err) {
        res.status(500).json({ error: '프로필 변경 실패 에러' });
    }
});

router.post('/portfolio', async (req, res) => {
    //  #swagger.description = '포트폴리오 수정'
    //  #swagger.tags = ['PROFILE']

    const { user_id, portfolio_url } = req.body;

    try {
        const profile = await Profile.findOne({
            where: {
                profile_id: user_id,
            },
        });

        if (profile) {
            await profile.update({ portfolio_url: portfolio_url });
            res.status(201).json({ message: 'portfolio change Successful!' });
        } else {
            res.status(404).json({ error: '포트폴리오 수정을 위한 회원이 존재하지 않습니다.' });
        }
    } catch (err) {
        res.status(500).json({ error: '포트폴리오 변경 실패' });
    }
});

router.post('/intro', async (req, res) => {
    //  #swagger.description = '소개글 수정'
    //  #swagger.tags = ['PROFILE']

    const { user_id, content } = req.body;

    try {
        const profile = await Profile.findOne({
            where: {
                profile_id: user_id,
            },
        });

        if (profile) {
            await profile.update({ introduction: content });
            res.status(201).json({ message: 'profile introduction change Successful!' });
        } else {
            res.status(404).json({ error: '마이페이지 소개글 수정을 위한 회원이 존재하지 않습니다.' });
        }
    } catch (err) {
        res.status(500).json({ error: '소개글 변경 실패' });
    }
});

module.exports = router;
