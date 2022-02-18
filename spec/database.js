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

  const storedMockChannel = async () => {
    const mockChannel = {
      title: "4번 테스트 채널",
      password: "test2345",
      rooms: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await new Channel(mockChannel).save();
  };

  const fetchAllChannels = (done) => {
    storedMockChannel().then(() => {
      Channel.find()
        .lean()
        .exec(function (err, channels) {
          if (err) return done(err);
          storedChannel = JSON.parse(JSON.stringify(channels));

          done();
        });
    });
  };

  const deleteChannel = async function () {
    await Channel.findOneAndDelete({ title: "4번 테스트 채널" });
  };

  before((done) => {
    (function checkDatabaseConnection() {
      if (db.readyState === 1) {
        return done();
      }

      setTimeout(checkDatabaseConnection, 1000);
    })();
  });

  describe(" GET `/channel`", () => {
    beforeEach(fetchAllChannels);
    afterEach(deleteChannel);

    it("should get all channels from the DB and return in response", (done) => {
      const ObjectID = require("mongodb").ObjectId;
      request(app)
        .get("/channel")
        .expect(200)
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
});
