const
    io = require("socket.io-client"),

    // ioClient = io.connect("http://localhost:3000");
    ioClient = io.connect("http://localhost:8123", {
        path: "/podiyumm-ws/socket.io/"
    }); //http://localhost:8000

ioClient.on("text", (msg) => console.info(msg));