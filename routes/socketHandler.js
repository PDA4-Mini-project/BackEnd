const socketIo = require('socket.io');
const { createClient } = require('redis');
const client = createClient();

module.exports = (server) => {
    (async () => {
        await client.connect();
    })();

    const io = socketIo(server, {
        cors: {
            origin: '*', // 실제 배포시에는 보다 구체적인 호스트 지정이 필요
        },
    });

    io.on('connection', (socket) => {
        socket.on('candidate', ({ roomId, candidate }) => {
            socket.to(roomId).emit('candidate', { candidate });
        });

        socket.on('offer', async ({ roomId, userId, offer }) => {
            async function getRoomInfo(roomId) {
                return await client.hGetAll(roomId);
            }
            const room_info = await getRoomInfo(roomId);
            const host_id = room_info._id;
            socket.to(roomId).emit('offer', { host_id, offer });
        });

        socket.on('answer', ({ roomId, answer }) => {
            socket.to(roomId).emit('answer', answer);
        });

        socket.on('readyStateChanged', async ({ roomId, userId, ready }) => {
            async function getRoomInfo(roomId) {
                return await client.hGetAll(roomId);
            }
            const room_info = await getRoomInfo(roomId);
            const host_id = room_info._id;
            socket.to(roomId).emit('readyStateChanged', { userId: host_id, ready });
        });
        socket.on('canStartStateChanged', async ({ roomId, userId, canStart }) => {
            async function getRoomInfo(roomId) {
                return await client.hGetAll(roomId);
            }
            const room_info = await getRoomInfo(roomId);
            const host_id = room_info._id;

            socket.to(roomId).emit('canStartStateChanged', { userId: host_id, canStart });
        });
        socket.on('joinRoom', async ({ roomId, userId }) => {
            // 방에 들어오면 CNT 증가해야 함
            const roomData = await client.HGETALL(roomId);

            // 방에 있는 사용자 수 확인
            const room = io.sockets.adapter.rooms.get(roomId);
            let numClients = room ? room.size : 0;

            if (parseInt(`${numClients}`, 10) + 1 > 2) {
                //2명 이상인 경우 참여 불가.
                socket.emit('roomFull', roomId);
                return;
            }

            // 방 입장
            socket.join(roomId);
            await client.HSET(roomId, 'user_cnt', parseInt(`${numClients}`, 10) + 1);

            if (!(roomData._id === userId)) {
                //현재 들어온 유저가 방장이 아닌 경우 인원 수 증가
                // 게스트 ID 설정
                await client.HSET(roomId, 'guest_id', userId);
            }

            // 방에 새로운 사용자가 참여했다는 것을 방의 모든 사용자에게 알림
            socket.to(roomId).emit('userJoined', { userId, numClients });

            // 사용자가 방을 떠날 때 처리
            socket.on('disconnect', async () => {
                // 사용자가 나간 방 정보
                const roomInfo = await client.HGETALL(roomId);

                // 방의 호스트가 연결이 끊긴 경우
                if (roomInfo && roomInfo._id === userId) {
                    // 방 정보 삭제
                    await client.DEL(roomId);

                    // 방에 있는 모든 사용자에게 방이 삭제되었음을 알림
                    socket.to(roomId).emit('roomClosed');
                }

                // 방의 사용자 수 업데이트
                let room = io.sockets.adapter.rooms.get(roomId);
                let numClients = room ? room.size : 0;
                await client.HSET(roomId, 'user_cnt', Math.max(0, numClients)); // 사용자가 나가면서 수 감소
                if (parseInt(roomInfo.user_cnt) === 1) {
                    await client.DEL(roomId);
                }
                socket.to(roomId).emit('userLeft', userId);
                socket.leave(roomId);
            });
        });
    });
};
