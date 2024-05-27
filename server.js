const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger-output');
const path = require('path');
const morgan = require('morgan');

// index.js에 있는 db.sequelize 객체 모듈을 구조분해로 불러온다.
const { sequelize } = require('./models/index');
const app = express();
const db = require('./models/index'); // 잠깐 테스트를 위해 만듬

sequelize
    .sync({ force: true })
    .then(async () => {
        console.log('데이터베이스 연결됨.');
    })
    .catch((err) => {
        console.error(err);
    });
app.use(morgan('dev')); // 로그

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const apiRouter = require('./routes/users');

app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});

app.use('/user', apiRouter);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// 포트넘버 설정
app.listen(3000, () => {
    console.log('Server is running on port 3000.');
});
