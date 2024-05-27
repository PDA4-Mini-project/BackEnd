const express = require('express');
const router = express.Router();
const { Sequelize, User, Auth } = require('../models');
const bcrypt = require('bcrypt');

router.post('/signup', async (req, res) => {
    const { _id, name, email, password } = req.body;

    try {
        // _id로 이미 유저가 존재하는지 check
        const existingUser = await User.findOne({
            where: {
                [Sequelize.Op.or]: [{ _id }, { email }],
            },
        });

        if (existingUser) {
            // JSON 형식으로 일반적인 메시지를 반환
            return res.status(400).json({ error: 'Registration failed' });
        }

        // 비밀번호 해시 처리
        const hashedPassword = await bcrypt.hash(password, 10);

        // 새 사용자 및 인증 정보 생성
        const newUser = await User.create({
            _id,
            name,
            email,
        });
        await Auth.create({
            userId: newUser._id,
            password: hashedPassword,
        });

        // JSON 형식으로 성공 메시지 반환
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err); // 콘솔에 오류 출력
        res.status(500).json({ error: '회원가입 에러' });
    }
});
module.exports = router;
