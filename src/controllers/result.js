import { MAX_TEAM } from "../constants";

// 카드 선택에 따른 점수 산출 유틸
function getScore(x, y, data) {
  let score = [0, 0, 0, 0];
  for (let i = 0; i < MAX_TEAM; i++) {
    score[i] = data[i] === "X" ? x : y;
  }
  return score;
}

// 해당 라운드 카드 선택에 따른 점수 계산
export function getRoundResult(data, round) {
  let weight = 1;
  switch (round) {
    case 5:
      weight = 3;
      break;
    case 8:
      weight = 5;
      break;
    case 10:
      weight = 10;
      break;
    default:
      weight = 1;
      break;
  }
  let countX = 0;
  data.forEach((element) => {
    if (element == "X") {
      countX += 1;
    }
  });
  switch (countX) {
    case 0:
      return getScore(0, 100 * weight, data);
    case 1:
      return getScore(300 * weight, -100 * weight, data);
    case 2:
      return getScore(200 * weight, -200 * weight, data);
    case 3:
      return getScore(100 * weight, -300 * weight, data);
    case 4:
      return getScore(-100 * weight, 0, data);
  }
}
