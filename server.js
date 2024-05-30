const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger-output');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
// index.js에 있는 db.sequelize 객체 모듈을 구조분해로 불러온다.
const app = express();
require('dotenv').config();

app.use(cors()); // temp

app.use(morgan('dev')); // 로그

// users 라우트 모듈 가져오기
const usersRouter = require('./routes/users');
const gardensRouter = require('./routes/gardens');
const ratesRouter = require('./routes/rates');
const profileRouter = require('./routes/profile');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// users 라우트를 '/users' 경로에 연결
app.use('/rates', ratesRouter);
app.use('/users', usersRouter);
app.use('/gardens', gardensRouter);
app.use('/profile', profileRouter);

app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// 포트넘버 설정
app.listen(3000, () => {
    console.log('Server is running on port 3000.');
});
