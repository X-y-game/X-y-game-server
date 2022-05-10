import socketIo from "socket.io";
import { getRoundResult } from "./controllers/result";
import { MAX_ROUND, CLIENT_ENDPOINT } from "./constants";
import res from "express/lib/response";

export default (server) => {
  const io = socketIo(server, {
    cors: {
      origin: CLIENT_ENDPOINT,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  let activeRooms = {};
  let results = {};
  let scores = {};
  let curRound = {};

  io.on("connection", (socket) => {
    io.emit("info", { activeRooms, results, scores, curRound });
    socket.on("control", (data) => {
      console.log(data.roomName);
      curRound[data.roomName] = data.round;
      io.emit("info", { activeRooms, results, scores, curRound });
      io.to(data.roomName).emit("cur_round", curRound);
      if (data.round === 1) {
        io.to(data.roomName).emit("setGame", data.roomName);
      }
    });

    socket.on("reset", (roomName) => {
      delete activeRooms[roomName];
      delete curRound[roomName];
      delete results[roomName];
      delete scores[roomName];
      console.log(results, scores);
      io.emit("info", { activeRooms, results, scores, curRound });
    });

    socket.on("modal", (roomName) => {
      io.to(roomName).emit("openModal");
    });

    socket.on("join", (roomName) => {
      socket.join(roomName);

      if (roomName in curRound) {
        io.to(roomName).emit("cur_round", curRound);
      }

      if (roomName in results) {
        io.to(roomName).emit("cur_result", results[roomName]);
      }

      if (roomName in scores) {
        io.to(roomName).emit("cur_score", scores[roomName]);
      }

      io.emit("info", { activeRooms, results, scores, curRound });
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
        activeRooms[roomName] = [0, 0, 0, 0];
        curRound[roomName] = 0;
        activeRooms[roomName][teamId - 1] = 1;
      }

      io.emit("info", { activeRooms, results, scores, curRound });
    });

    socket.on("select_card", (roomName, team, round, choice) => {
      if (roomName in results) {
        results[roomName][round - 1][team - 1] = choice;
        io.to(roomName).emit("show_select", results[roomName]);

        // 4팀 완료
        if (!results[roomName][round - 1].includes("")) {
          // 스코어 계산
          scores[roomName][round - 1] = getRoundResult(Object.values(results[roomName][round - 1]), round);

          io.to(roomName).emit("show_round_score", getRoundResult(Object.values(results[roomName][round - 1]), round));
          io.to(roomName).emit("show_score", scores[roomName]);
        }
      } else {
        results[roomName] = [];

        for (let i = 0; i < MAX_ROUND; i++) {
          results[roomName].push(["", "", "", ""]);
        }
        results[roomName][round - 1][team - 1] = choice;

        scores[roomName] = [];

        for (let i = 0; i < MAX_ROUND; i++) {
          scores[roomName].push([0, 0, 0, 0]);
        }
        scores[roomName][round - 1] = getRoundResult(Object.values(results[roomName][round - 1]), round);
      }

      io.emit("info", { activeRooms, results, scores, curRound });
    });

    // // All event
    // socket.onAny((event) => {
    //   // 모든 이벤트 감시
    //   console.log(event, "check all Event");
    // });

    // DisConnect
    socket.on("disconnect", () => {
      console.log("클라이언트 접속 해제", socket.id);
    });

    socket.on("error", (error) => {
      console.log(error);
    });
  });
};
