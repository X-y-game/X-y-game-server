import socketIo from "socket.io";

export default (server) => {
  const io = socketIo(server, { path: "/socket.io" });
  const test = socketIo(server);

  // console.log(io);
  // console.log("----------------------------");
  // console.log("test:", test);

  const room = io.of("/room");
  const channel = io.of("/channel");

  io.on("connection", (socket) => {
    const req = socket.request;
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("새로운 클라이언트 접속!", ip, socket.id);

    //All event
    socket.onAny((event) => {
      //모든 이벤트 감시
      console.log(event);
    });

    // 2. 이벤트 리스너 붙이기
    socket.on("disconnect", () => {
      console.log("클라이언트 접속 해제", ip, socket.id);
      clearInterval(socket.interval);
    });

    socket.on("error", (error) => {
      console.log(error);
    });
  });
};
