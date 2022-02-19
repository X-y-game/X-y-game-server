import mongoose from "mongoose";
import request from "supertest";
import { expect } from "chai";
import app from "../src/app";
import Channel from "../src/models/channel";
import Room from "../src/models/room";
import channel from "../src/models/channel";

describe("Room API", () => {
  const mockRooms = require("./room.json");
  const mockChannels = require("./channels.json");

  let storedRooms = null;

  const storedMockRooms = async () => {
    for (let i = 0; i < mockChannels.length; i++) {
      await new Channel(mockChannels[i]).save();
    }
    for (let j = 0; j < mockRooms.length; j++) {
      await new Room(mockRooms[j]).save();
    }
  };

  const deleteStoredMockChannels = async function () {
    for (let i = 0; i < mockChannels.length; i++) {
      await Channel.findByIdAndDelete(mockChannels[i]._id);
    }
    for (let j = 0; j < mockRooms.length; j++) {
      await Room.findByIdAndDelete(mockRooms[j]._id);
    }
  };

  const fetchAllRooms = (done) => {
    storedMockRooms().then(() => {
      Room.find()
        .lean()
        .exec(function (err, rooms) {
          if (err) return done(err);
          storedRooms = JSON.parse(JSON.stringify(rooms));
          done();
        });
    });
  };

  const deleteAllRooms = (done) => {
    deleteStoredMockChannels().then(() => {
      storedRooms = null;
      done();
    });
  };

  beforeEach(fetchAllRooms);
  afterEach(deleteAllRooms);

  it("POST /room", (done) => {
    const mockChannelId = "620fc465637d51b9186caa7f";
    const mockRoomTitle = "테스트 111번채널의 1번룸이다";
    const newMockRoom = {
      title: mockRoomTitle,
      channelId: mockChannelId,
    };

    const deleteMockRoom = async function () {
      await Room.findOneAndDelete({ title: mockRoomTitle });
    };

    after(deleteMockRoom);
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

        const allRooms = await Room.find({});
        const existChannel = await Channel.findById(mockChannelId);
        expect(existChannel.rooms[0]).to.eql(mongoose.Types.ObjectId(room._id));
        expect(allRooms.length).to.eql(storedRooms.length + 1);

        done();
      });
  });

  it("DELETE /room", (done) => {
    const mockRoomId = "6211066c11e6dc045d7458ff";

    request(app)
      .delete("/room")
      .send({ roomId: mockRoomId })
      .expect(200)
      .end(async (err, res) => {
        expect(res.body.message).to.exists;
        expect(res.body.message).to.eql("success to delete room");

        const allRooms = await Room.find();

        const deletedRoom = await Room.findOne({ _id: mockRoomId });

        expect(allRooms.length).to.eql(storedRooms.length - 1);
        expect(deletedRoom).to.not.exist;

        done();
      });
  });
});
