const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0', language: 'ko' });

const options = {
    info: {
        title: '쏙쏙가든 API docs',
        description: 'PDA-4th 미니프로젝트 쏙쏙 가든 API 관리',
    },
    servers: [
        {
            url: 'http://localhost:3000',
        },
    ],
    securityDefinitions: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            in: 'header',
            bearerFormat: 'JWT',
        },
    },
};
const outputFile = './swagger-output.json';
const endpointsFiles = ['../server.js'];

swaggerAutogen(outputFile, endpointsFiles, options);
