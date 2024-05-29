const socketIo = require('socket.io');

module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: '*',
        },
    });
    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.on('candidate', ({ roomId, candidate }) => {
            console.log('candidate:', candidate);
            socket.to(roomId).emit('candidate', { candidate });
        });

        socket.on('offer', ({ roomId, offer }) => {
            console.log('offer: ', offer);
            socket.to(roomId).emit('offer', offer);
        });
        socket.on('answer', ({ roomId, answer }) => {
            console.log('answer: ', answer);
            socket.to(roomId).emit('answer', answer);
        });

        // 유저가 룸에 입장하겠다.라고 joinRoom 이벤트를 발생시키면
        socket.on('joinRoom', ({ roomId, userId }) => {
            // 현재 소켓을 roomId에 해당하는 방에 참여시킴
            socket.join(roomId);

            console.log('joinRoom 이벤트 실행 at server');
            console.log(`User joined room: ${roomId}`);

            console.log('소켓 연결 수 확인');
            const room = io.sockets.adapter.rooms.get(roomId);
            const numClients = room ? room.size : 0;
            console.log(`Number of clients in room ${roomId}: ${numClients}`);
            // roodId에 해당하는 방에 있는 모든 소켓에게 이벤트 userJoined라는 이벤트 전송
            io.to(roomId).emit('userJoined', userId);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
};
