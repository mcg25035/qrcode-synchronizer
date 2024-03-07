const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require("path")
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const Discord = require("discord.js")
const secretData = require('./.secret.json');

const client = new Discord.Client({intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages    
]})

client.login(secretData.token)
lastDiscordMessageNotified = -1;

client.on('ready', async () => {
    const channel = client.channels.cache.get(secretData.channel)
    await channel.send('烏龜烏龜翹系統已啟動');
    
});


var qrcodeData = ""

app.use(express.static(path.join(__dirname, 'public')))


app.get('/scanner', (req, res) => {
    res.sendFile(__dirname + '/scanner.html');
});
app.get('/qrcode', (req, res) => {
    res.sendFile(__dirname + '/qrcode.html');
});


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('QRCodeDetected', (msg) => {
        if (msg != qrcodeData){
            qrcodeData = msg
            socket.broadcast.emit('refresh', msg);
        }
    });

    socket.on('ScannerConntected', async ()=>{
        socket.broadcast.emit('notify');
        var now = Date.now();
        if (now - lastDiscordMessageNotified < 1000*60*10) return;
        lastDiscordMessageNotified = now;
        const channel = client.channels.cache.get(secretData.channel)
        await channel.send(
            `<@&${secretData.role}>\n`+
            '各位烏龜大家好\n'+
            '等等我們即將開始課程的點名\n'+
            `敬請各位準備好連上[網站](${secretData.url})\n`+
            '並打開你的行動逢甲\n'+
            '我們準備點名'
        );

    })

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server listening on http://localhost:3000');
});
