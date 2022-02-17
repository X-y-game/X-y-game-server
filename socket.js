import socketIo from "socket.io";
import { getRoundResult } from "./src/controllers/result";

export default (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  let activeRooms = {};
  let results = {};
  let scores = {};
  let curRound = {};

  io.on("connection", (socket) => {
    socket.on("join", (roomName) => {
      console.log(`Socket ${socket.id} joining ${roomName}`);
      socket.join(roomName);
      if (roomName in curRound) {
        io.to(roomName).emit("cur_round", curRound[roomName]);
      }
      if (roomName in results) {
        io.to(roomName).emit("cur_result", results[roomName]);
      }
      if (roomName in scores) {
        io.to(roomName).emit("cur_score", scores[roomName]);
      }
    });

    socket.on("select_team", (chId, roomId, roomName, teamId) => {
      let canStart = false;
      if (chId === undefined || roomId === undefined || teamId === undefined || teamId === 0) {
        return;
      }
      if (roomName in activeRooms) {
        activeRooms[roomName][teamId - 1] = 1;
        if (Object.values(activeRooms[roomName]).toString() == [1, 1, 1, 1]) {
          canStart = true;

          io.to(roomName).emit("can_start", canStart);
        }
      } else {
        console.log(`채널${chId}, 룸${roomId}이 활성화 되었습니다`);
        activeRooms[roomName] = [0, 0, 0, 0];
        curRound[roomName] = 1;
        activeRooms[roomName][teamId - 1] = 1;
      }

      console.log(activeRooms, "active Romms");
    });

    socket.on("select_card", (roomName, team, round, mycard) => {
      curRound[roomName] = round;
      round -= 1;
      team = team.slice(4);
      if (roomName in results) {
        if (results[roomName][round][team - 1] == "") {
          results[roomName][round][team - 1] = mycard;
        }
        if (!results[roomName][round].includes("")) {
          curRound[roomName]++;
          scores[roomName][round] = getRoundResult(Object.values(results[roomName][round]), round + 1);
          io.to(roomName).emit("show_round_score", getRoundResult(Object.values(results[roomName][round]), round + 1));
          io.to(roomName).emit("show_score", scores[roomName]);
          io.to(roomName).emit("show_select", results[roomName]);
        }
      } else {
        results[roomName] = [];
        for (let i = 0; i < 10; i++) {
          results[roomName].push(["", "", "", ""]);
        }
        results[roomName][round][team - 1] = mycard;

        scores[roomName] = [];
        for (let i = 0; i < 10; i++) {
          scores[roomName].push([0, 0, 0, 0]);
        }
        scores[roomName][round] = getRoundResult(Object.values(results[roomName][round]), round + 1);
      }
    });

    // All event
    socket.onAny((event) => {
      // 모든 이벤트 감시
      console.log(event, "check all Event");
    });

    // DisConnect
    socket.on("disconnect", () => {
      console.log("클라이언트 접속 해제", socket.id);
    });

    socket.on("error", (error) => {
      console.log(error);
    });
  });
};
