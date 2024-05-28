const socketIo = require('socket.io');

module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: '*',
        },
    });
    io.on('connection', (socket) => {
        console.log('a user connected');

        // 유저가 룸에 입장하겠다.라고 joinRoom 이벤트를 발생시키면
        socket.on('joinRoom', (roomId) => {
            // 현재 소켓을 roomId에 해당하는 방에 참여시킴
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
            // roodId에 해당하는 방에 있는 모든 소켓에게 이벤트 userJoined라는 이벤트 전송
            socket.to(roomId).emit('userJoined', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
};
