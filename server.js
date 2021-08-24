require('dotenv').config()

const WebSocket = require('ws');
const redis = require('redis');

// Configuration: adapt to your environment
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = parseInt(process.env.REDIS_PORT);
const REDIS_PWD = process.env.REDIS_PWD;
const WEB_SOCKET_PORT = parseInt(process.env.WEB_SOCKET_PORT);

const REDIS_CHANNEL='podiyumm:notifications'

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

// Create & Start the WebSocket server
const server = new WebSocket.Server({
    host : '0.0.0.0',
    port : WEB_SOCKET_PORT });

// Register event for client connection
server.on('connection', function connection(ws) {

    // broadcast on web socket when receving a Redis PUB/SUB Event
    redisClient.on('message', function(channel, message){
        console.log(message);
        ws.send(message);
    })

});

server.on('slideActivated', data => {

    redisClient.publish(REDIS_CHANNEL, data, function(){
        // nothing to do
        // process.exit(0);
    });
});

console.log("WebSocket server started at ws://0.0.0.0:"+ WEB_SOCKET_PORT);