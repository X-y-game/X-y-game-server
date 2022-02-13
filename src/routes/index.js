import express from "express";

import {
  getChannels,
  makeChannel,
  removeChannel,
  getRooms,
  makeRooms,
  getTeams,
  makeTeams,
  deleteRoom,
  deleteTeam,
} from "../controllers/game";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ title: "XY-game" });
});

router
  .route("/channel")
  .get(getChannels)
  .post(makeChannel)
  .delete(removeChannel);
router.post("/room", makeRooms);
router.delete("/room", deleteRoom);
router.get("/room/:channelId", getRooms);
router.get("/team/:roomId", getTeams);
router.post("/team", makeTeams);
router.delete("/team", deleteTeam);

export default router;
