const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');

// index.js에 있는 db.sequelize 객체 모듈을 구조분해로 불러온다.
const { sequelize } = require('./models/index');
const app = express();

sequelize
    .sync({ force: true })
    .then(() => {
        console.log('데이터베이스 연결됨.');
    })
    .catch((err) => {
        console.error(err);
    });
app.use(morgan('dev')); // 로그

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});

// 포트넘버 설정
app.listen(3000, () => {
    console.log('Server is running on port 3000.');
});
