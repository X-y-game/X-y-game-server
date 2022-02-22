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

router
  .route("/channel")
  .get(getChannels)
  .post(makeChannel)
  .delete(removeChannel);
router.route("/room").post(makeRooms).delete(deleteRoom);
router.get("/room/:channelId", getRooms);
router.route("/team").post(makeTeams).delete(deleteTeam);
router.get("/team/:roomId", getTeams);

export default router;
