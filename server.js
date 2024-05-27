const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger-output');

const path = require('path');
const morgan = require('morgan');
const express = require("express");
const bodyParser = require("body-parser");

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

// users 라우트 모듈 가져오기
const usersRouter = require('./routes/users');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));


// 포트넘버 설정
app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
