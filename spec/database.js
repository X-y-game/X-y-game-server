import mongoose from "mongoose";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app";
import Channel from "../src/models/channel";

describe("MongoDB database", function () {
  this.timeout(10000);

  const db = mongoose.connection;
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

  before((done) => {
    (function checkDatabaseConnection() {
      if (db.readyState === 1) {
        return done();
      }

      setTimeout(checkDatabaseConnection, 1000);
    })();
  });

  describe("GET `/channel`", () => {
    beforeEach(fetchAllChannels);
    afterEach(deleteAllChannels);

    it("should get all channels from the DB and return in response", (done) => {
      const ObjectID = require("mongodb").ObjectId;
      request(app)
        .get("/channel")
        .expect(200)
        .expect("Content-type", /json/)
        .end((err, res) => {
          if (err) return done(err);

          const channels = res.body.channelLists;
          channels.map((channel) => {
            expect(ObjectID.isValid(channel._id)).to.equal(true);
            expect(channel._id.length).to.equal(24);
            expect(channel.title).to.be.a("string");
            expect(channel.password).to.be.a("string");
          });

          expect(channels).to.exist;
          expect(Array.isArray(channels)).to.be.true;
          expect(res.text).to.include(storedChannel[0].title);

          done();
        });
    });
  });

  describe("POST `/channel`", () => {
    const deleteMockChannel = async function () {
      await Channel.findOneAndDelete({ title: "mockTest1" });
    };
    const newMockChannel = {
      title: "mockTest1",
      password: "q1w2e3",
      rooms: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    afterEach(deleteMockChannel);

    it("should add a newChannel into DB", (done) => {
      request(app)
        .post("/channel")
        .send(newMockChannel)
        .expect(201)
        .end(async (err, res) => {
          if (err) return done(err);

          const newChannel = res.body.newChannel;

          expect(newChannel).to.exist;
          expect(newChannel).to.contain.property("_id");
          expect(newChannel).to.contain.property("title");
          expect(newChannel).to.contain.property("password");
          expect(newChannel).to.contain.property("rooms");

          done();
        });
    });
  });

  describe("DELETE `/channel`", () => {
    beforeEach(fetchAllChannels);
    afterEach(deleteAllChannels);

    it("should deleted existing channel", (done) => {
      const channelId = "620fc465637d51b9186caa7f";

      request(app)
        .delete("/channel")
        .set("Accept", "application/json")
        .send({ channelId: "620fc465637d51b9186caa7f" })
        .expect(200)
        .expect("Content-Type", /json/)
        .end(async (err, res) => {
          if (err) return done(err);

          expect(res.body.message).to.exist;
          expect(res.body.message).to.eql("success to delete");

          const allChannels = await Channel.find();
          const deletedChannel = await Channel.findOne({ _id: channelId });

          expect(allChannels.length).to.eql(storedChannel.length - 1);
          expect(deletedChannel).to.not.exist;

          done();
        });
    });
  });
});
