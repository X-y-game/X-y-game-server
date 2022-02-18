//import Channel from "../src/models/channel";
//import Room from "../src/models/room";
//import Team from "../src/models/team";

describe("model Test", () => {
  console.log(this, "this");
  // this.timeout(10000);

  const mongoose = require("mongoose");
  const db = mongoose.connection;

  let mockChannels;
  let mockRooms;
  let mockTeams;

  before((done) => {
    console.log(done, "done");
  });
});
