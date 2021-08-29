require('dotenv').config()

const redis = require('redis');

// Configuration: adapt to your environment
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = parseInt(process.env.REDIS_PORT);
const REDIS_PWD = process.env.REDIS_PWD;
const WEB_SOCKET_PORT = parseInt(process.env.WEB_SOCKET_PORT);

const REDIS_CHANNEL='podiyumm:notifications'
const
    io = require("socket.io"),
    server = io.listen(parseInt(WEB_SOCKET_PORT));


// Connect to Redis and subscribe to "app:notifications" channel
var redisClient = redis.createClient(
    {
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PWD
    }
);
// TODO scaling (channel per slideshow)? if so, do we spawn server.on per slideshow?
// https://stackoverflow.com/questions/6965451/redis-key-naming-conventions
redisClient.subscribe(REDIS_CHANNEL);

// event fired every time a new client connects:
server.on("connection", (socket) => {
    console.info(`Client connected [id=${socket.id}]`);

    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
        console.info(`Client gone [id=${socket.id}]`);
    });

    // broadcast on web socket when receving a Redis PUB/SUB Event
    redisClient.on('message', function(channel, message){
        console.log(message);
        socket.emit("text", message);
    })
});

server.on('slideActivated', data => {

    redisClient.publish(REDIS_CHANNEL, data, function(){
        // nothing to do
        // process.exit(0);
    });
});
