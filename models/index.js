const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development'; // 지정된 환경변수가 없으면 'development'로 지정

// config/config.json 파일에 있는 설정값들을 불러온다.
// config객체의 env변수(development)키 의 객체값들을 불러온다.
// 즉, 데이터베이스 설정을 불러온다고 말할 수 있다.
const config = require('../config/config.json')[env];

const db = {};

// new Sequelize를 통해 MySQL 연결 객체를 생성한다.
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// 연결객체를 나중에 재사용하기 위해 db.sequelize에 넣어둔다.
db.sequelize = sequelize;
db.Sequelize = Sequelize;
// Auth 모델 불러오기
db.Auth = require('./auth')(sequelize, Sequelize);
// Profile 모델 불러오기
db.Profile = require('./profile')(sequelize, Sequelize);
// User 모델 불러오기
db.User = require('./user')(sequelize, Sequelize);
// Review 모델 불러오기
db.Review = require('./review')(sequelize, Sequelize);
// theme 모델 불러오기
db.Theme = require('./theme')(sequelize, Sequelize);
// level 모델 불러오기
db.Level = require('./level')(sequelize, Sequelize);
// waterBottle 모델 불러오기
db.WaterBottle = require('./waterBottle')(sequelize, Sequelize);
// userTheme 모델 불러오기
db.UserTheme = require('./userTheme')(sequelize, Sequelize);

sequelize
    .sync({ force: false })
    .then(async () => {
        //데이터베이스 연결
    })
    .catch((err) => {
        console.error(err);
    });

// 모듈로 꺼낸다.
module.exports = db;
