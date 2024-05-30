const socketIo = require('socket.io');

module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: '*', // 실제 배포시에는 보다 구체적인 호스트 지정이 필요
        },
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('candidate', ({ roomId, candidate }) => {
            console.log('Candidate received:', candidate);
            console.log(roomId);
            socket.to(roomId).emit('candidate', { candidate });
        });

        socket.on('offer', ({ roomId, offer }) => {
            socket.to(roomId).emit('offer', offer);
        });

        socket.on('answer', ({ roomId, answer }) => {
            socket.to(roomId).emit('answer', answer);
        });

        socket.on('joinRoom', ({ roomId, userId }) => {
            socket.join(roomId);
            console.log('User joined room:', roomId);
            console.log(`User ID: ${userId}`);

            // 방에 있는 사용자 수 확인
            const room = io.sockets.adapter.rooms.get(roomId);
            const numClients = room ? room.size : 0;
            console.log(`Number of clients in room ${roomId}: ${numClients}`);

            // 방에 새로운 사용자가 참여했다는 것을 방의 모든 사용자에게 알림
            socket.to(roomId).emit('userJoined', { userId, numClients });

            // 사용자가 방을 떠날 때 처리
            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
                socket.to(roomId).emit('userLeft', userId);
                socket.leave(roomId);
            });
        });
    });
};
