import mongoose from "mongoose";
import request from "supertest";
import { expect } from "chai";
import app from "../src/app";
import Channel from "../src/models/channel";
import Room from "../src/models/room";

describe("Room API", () => {
  const mockChannels = require("./channels.json");

  let storedChannel = null;

  const storedMockChannels = async () => {
    for (let i = 0; i < mockChannels.length; i++) {
      await new Channel(mockChannels[i]).save();
    }
  };

  const deleteStoredMockChannels = async function () {
    for (let i = 0; i < mockChannels.length; i++) {
      await Channel.findByIdAndDelete(mockChannels[i]._id);
    }
  };

  const fetchAllChannels = (done) => {
    storedMockChannels().then(() => {
      Channel.find()
        .lean()
        .exec(function (err, channels) {
          if (err) return done(err);
          storedChannel = JSON.parse(JSON.stringify(channels));

          done();
        });
    });
  };

  const deleteAllChannels = (done) => {
    deleteStoredMockChannels().then(() => {
      storedChannel = null;
      done();
    });
  };

  before(fetchAllChannels);
  after(deleteAllChannels);

  it("POST /room", (done) => {
    const mockChannelId = "620fc465637d51b9186caa7f";
    const mockRoomTitle = "테스트 111번채널의 1번룸이다";
    const newMockRoom = {
      title: mockRoomTitle,
      channelId: mockChannelId,
    };

    request(app)
      .post("/room")
      .send(newMockRoom)
      .expect(201)

      .end(async (err, res) => {
        if (err) return done(err);
        expect(res.body.message).to.exist;
        expect(res.body.newRoom).to.exist;

        expect(res.body.message).to.eql("success");

        const room = res.body.newRoom;

        expect(res.body.newRoom).to.exist;
        expect(res.body.newRoom._id).to.exist;
        expect(mongoose.Types.ObjectId.isValid(room._id)).to.be.true;

        const addedRoom = await Room.findOne({
          title: mockRoomTitle,
        });

        expect(addedRoom).to.exist;

        const existChannel = await Channel.findById(mockChannelId);
        expect(existChannel.rooms[0]).to.eql(mongoose.Types.ObjectId(room._id));

        done();
      });
  });
});
