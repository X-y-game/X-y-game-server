import socketIo from "socket.io";

export default (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  const room = io.of("/room");

  io.on("connection", (socket) => {
    const req = socket.request;
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    //console.log("새로운 클라이언트 접속!", ip, socket.id);

    // All event
    socket.onAny((event) => {
      // 모든 이벤트 감시
      console.log(event, "check all Event");
    });

    room.on("connection", (socket) => {
      console.log("room 네임스페이스에 접속");
      socket.on("disconnect", () => {
        console.log("room 네임스페이스 접속 해제");
      });
    });

    // DisConnect
    socket.on("disconnect", () => {
      console.log("클라이언트 접속 해제", ip, socket.id);
    });

    socket.on("error", (error) => {
      console.log(error);
    });
  });
};
