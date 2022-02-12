import express from "express";

import {
  getChannels,
  makeChannel,
  getRooms,
  makeRooms,
  getTeams,
  makeTeams,
} from "../controllers/game";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ title: "XY-game" });
});

router.route("/channel").get(getChannels).post(makeChannel);
router.route("/room").get(getRooms).post(makeRooms);
router.route("/team").get(getTeams).post(makeTeams);

export default router;
