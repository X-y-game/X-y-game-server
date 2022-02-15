// 카드 선택에 따른 점수 산출 유틸
function getScore(x, y, data) {
	let score = [0, 0, 0, 0];
	for (let i = 0; i < 4; i++) {
		score[i] = data[i] === "X" ? x : y;
	}
	return score;
}

// 해당 라운드 카드 선택에 따른 점수 계산
export function getRoundResult(data) {
	let countX = 0;
	data.forEach((element) => {
		if (element == "X") {
			countX += 1;
		}
	});
	switch (countX) {
		case 0:
			return getScore(0, 100, data);
		case 1:
			return getScore(300, -100, data);
		case 2:
			return getScore(200, -200, data);
		case 3:
			return getScore(100, -300, data);
		case 4:
			return getScore(-100, 0, data);
	}
}
