import socketIo from "socket.io";
import { getRoundResult, getMidResult, getCurTeamScore } from "./src/controllers/result";

export default (server) => {
	const io = socketIo(server, {
		cors: {
			origin: "http://localhost:3000",
			methods: ["GET", "POST"],
		},
	});

	const room = io.of("/room");
	let activeRooms = {}; // 활성화된 게임룸
	let results = {}; // X,Y 선택 정보
	let scores = {}; // 라운드별 산정된 점수

	io.on("connection", (socket) => {
		const req = socket.request;
		const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
		//console.log("새로운 클라이언트 접속!", ip, socket.id);

		// 채널이름-룸이름으로 소켓룸 연결. 네임스페이스로 바꿀 것
		socket.on("join", (roomName) => {
			console.log(`Socket ${socket.id} joining ${roomName}`);
			socket.join(roomName);
		});

		// 팀 선택
		socket.on("select_team", (chId, roomId, roomName, teamId) => {
			if (chId === undefined || roomId === undefined || teamId === undefined || teamId === 0) {
				return;
			}
			if (roomName in activeRooms) {
				let canStart = false;
				activeRooms[roomName][teamId - 1] = 1; // 접속 확인
				if (Object.values(activeRooms[roomName]).toString() == [1, 1, 1, 1]) {
					canStart = true; // 모두 접속
				}
				// 모두 접속되었음을 전달. 전달 후 클라이언트 리렌더링 어떻게 해야할지 고민
				socket.to(roomName).emit("can_start", canStart);
			} else {
				console.log(`채널${chId}, 룸${roomId}이 활성화 되었습니다`);
				activeRooms[roomName] = [0, 0, 0, 0]; // 활성화된 룸 초기화
				activeRooms[roomName][teamId - 1] = 1;
			}
			console.log(activeRooms);
		});

		// 인게임 카드 선택
		socket.on("select_card", (roomName, team, round, mycard) => {
			round -= 1;
			team = team.slice(4);
			if (roomName in results) {
				if (results[roomName][round][team - 1] == "") {
					results[roomName][round][team - 1] = mycard; // 라운드별 카드 선택
				}
				// 라운드 모든 팀 카드 선택 완료
				if (!results[roomName][round].includes("")) {
					let roundResult = getRoundResult(Object.values(results[roomName][round]));
					if (roomName in scores) {
						scores[roomName][round] = roundResult;
					} else {
						// 10개 라운드 정보를 담을 점수 배열
						scores[roomName] = [];
						for (let i = 0; i < 10; i++) {
							scores[roomName].push([0, 0, 0, 0]);
						}
						scores[roomName][round] = roundResult;
					}
					console.log("finish", results[roomName][round], roundResult, scores);
					// 라운드가 종료되면 라운드 결과를 전송. 렌더링 고민
					socket.to(roomName).emit("show_round_result", (results[roomName][round], roundResult));
				}
			} else {
				// 10개 라운드 정보를 담을 카드선택 배열
				results[roomName] = [];
				for (let i = 0; i < 10; i++) {
					results[roomName].push(["", "", "", ""]);
				}
				results[roomName][round][team - 1] = mycard;
			}
			console.log(results);
		});

		// 라운드별/팀별 점수/결과 전달
		socket.on("get_score", (roomName, team, round) => {
			// 중간결과, 최종결과. 테스트 진행중
			if (team == "all") {
				socket.to(roomName).emit("show_score", getMidResult(results[roomName], scores[roomName], round));
			}
			// 현재 라운드까지의 팀 점수. 테스트 진행중
			else {
				socket.to(roomName).emit("show_score", getCurTeamScore(scores[roomName], team, round));
			}
		});

		// All event
		socket.onAny((event) => {
			// 모든 이벤트 감시
			console.log(event, "check all Event");
		});

		// room.on("connection", (socket) => {
		//   console.log("room 네임스페이스에 접속");
		//   socket.on("disconnect", () => {
		//     console.log("room 네임스페이스 접속 해제");
		//   });
		// });

		// DisConnect
		socket.on("disconnect", () => {
			console.log("클라이언트 접속 해제", ip, socket.id);
		});

		socket.on("error", (error) => {
			console.log(error);
		});
	});
};
