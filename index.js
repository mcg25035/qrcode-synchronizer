const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require("path")
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')))

app.get('/qrcode', (req, res) => {
    res.sendFile(__dirname + '/qrcode.html');
});

app.get('/scanner', (req, res) => {
    res.sendFile(__dirname + '/scanner.html');
});

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle messages from clients
    socket.on('QRCodeDetected', (msg) => {
        console.log(msg)
        socket.broadcast.emit('QRCodeDetected', msg);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log('Server listening on http://localhost:3000');
});
