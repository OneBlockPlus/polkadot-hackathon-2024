import { WebSocketServer } from 'ws';

const E_ROOM_DOES_NOT_EXIST = 101;
const E_ROOM_IF_FULL = 202;
const E_NOT_AN_OWNER = 303;

const SUCCESS = 100;
const CONNECTED = 150;
const DISCONNECTED = 151;
const START_THE_GAME = 200;
const WINNER = 250;

const rooms = [];

const wss = new WebSocketServer({
    port: 8080,
});

wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.roomId = undefined;
    ws.wallet = undefined;

    ws.on('error', (error) => console.log(error));

    ws.on('pong', () => (ws.isAlive = true));

    ws.on('message', (message) => {
        const [sender, command, roomId] = message.split(' ');
        ws.wallet = sender;

        if (command == 'host') {
            rooms.push({ id: roomId, players: [sender], sockets: [ws] });
            ws.roomId = roomId;
        }

        if (command == 'join') {
            const room = rooms.find((room) => room.id == roomId);
            if (!room) return ws.send(E_ROOM_DOES_NOT_EXIST);
            if (room.players.length == 4) return ws.send(E_ROOM_IF_FULL);

            for (const socket of room.sockets) {
                socket.send(`${CONNECTED} ${sender}`);
            }

            ws.roomId = roomId;
            room.players.push(sender);
            room.sockets.push(ws);
        }

        if (command == 'start') {
            const room = rooms.find((room) => room.id == roomId);
            if (!room) return ws.send(E_ROOM_DOES_NOT_EXIST);
            if (room.players[0] != sender) return ws.send(E_NOT_AN_OWNER);

            room.sockets.forEach((socket) => socket.send(START_THE_GAME));
        }

        if (command == 'finish') {
            const room = rooms.find((room) => room.id == roomId);
            if (room.players[0] != sender) return ws.send(E_NOT_AN_OWNER);

            const max = room.clicks[0];
            room.clicks.map((clicks) => (max = Math.max(max, clicks)));
            const winner = room.clicks.indexOf(max);

            room.sockets.forEach((socket) => socket.send(`${WINNER} ${room.players[winner]}`));
        }

        ws.send(SUCCESS);
    });

    ws.on('close', () => {
        if (!ws.roomId || !ws.wallet) return;

        const room = rooms.find((room) => room.id == ws.roomId);
        const user = room.players.indexOf(ws.wallet);

        room.players[user] = undefined;
        room.sockets[user] = undefined;

        room.sockets.forEach((socket) => socket.send(`${DISCONNECTED} ${ws.wallet}`));
    });
});

const interval = setInterval(() => {
    rooms.forEach((room) =>
        room.sockets.forEach((ws, index) => {
            if (ws.isAlive === false) {
                room.players[index] = undefined;
                room.sockets[index] = undefined;
                return ws.terminate();
            }

            ws.isAlive = false;
            ws.ping();
        })
    );
}, 30_000);

wss.on('close', () => clearInterval(interval));
