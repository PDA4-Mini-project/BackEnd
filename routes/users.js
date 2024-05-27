const express = require('express');
const router = express.Router();
const { Sequelize, sequelize, User, Auth, Profile, Review } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

router.post('/signup', async (req, res) => {
    //  #swagger.description = '유저 등록'
    //  #swagger.tags = ['User']
    const { _id, name, email, password } = req.body;

    const transaction = await sequelize.transaction();

    try {
        // _id로 이미 유저가 존재하는지 check
        const existingUser = await User.findOne({
            where: {
                [Sequelize.Op.or]: [{ _id }, { email }],
            },
            transaction, //트랜잭션 추가
        });

        if (existingUser) {
            //트랜잭션 롤백
            await transaction.rollback();
            // JSON 형식으로 일반적인 메시지를 반환
            return res.status(400).json({ error: 'Registration failed' });
        }

        // 비밀번호 해시 처리
        const hashedPassword = await bcrypt.hash(password, 10);
        // 새 사용자 및 인증 정보 생성
        const newUser = await User.create(
            {
                _id,
                name,
                email,
            },
            { transaction }
        );

        await Auth.create(
            {
                userId: newUser._id,
                password: hashedPassword,
            },
            { transaction }
        );
        //Profile 모델에 회원 정보 추가
        await Profile.create(
            {
                profile_id: newUser._id,
                introduction: '자기 소개글을 작성해주세요 :)',
                portfolio_url: 'null',
                image_url: 'null',
            },
            { transaction }
        );
        await Review.create(
            {
                review_id: newUser._id,
            },
            { transaction }
        );

        //트랜잭션 커밋
        await transaction.commit();

        // JSON 형식으로 성공 메시지 반환
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ error: '회원가입 에러' });
    }
});

router.post('/login', async (req, res) => {
    const { _id, password } = req.body;

    try {
        const user = await User.findOne({
            where: { _id },
        });
        // TODO: 예러 출력 함수
        if (!user) {
            return res.status(400).json({ error: 'login failed' });
        }

        const authInfo = await Auth.findOne({
            where: { userId: user._id },
        });

        if (!authInfo) {
            return res.status(400).json({ error: 'login failed' });
        }

        const isMatch = await bcrypt.compare(password, authInfo.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // jwt 생성
        // {클레임, 서명 시 사용하는 비밀키, 토큰 만료 시간}
        // 만료되면 다시 인증 받거나 새 토큰 요청해야함
        const token = jwt.sign({ userId: user._id, name: user.name }, secretKey, { expiresIn: '1h' });

        res.json({ message: 'login successful', token });
    } catch (err) {
        // 배포 전 콘솔은 삭제할 것
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
