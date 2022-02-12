import Channel from "../models/channel";
import Room from "../models/room";
import Team from "../models/team";

export const getChannels = async (req, res, next) => {
  try {
    const channelLists = await Channel.find({});
    res.json({ channelLists });
  } catch (error) {
    next(error);
  }
};

export const makeChannel = async (req, res, next) => {
  try {
    const { title, password } = req.body;
    const newChannel = await Channel.create({
      title,
      password,
    });
    res.json({ message: "success", newChannel });
  } catch (error) {
    next(error);
  }
};

export const getRooms = async (req, res, next) => {
  try {
    const roomLists = await Room.find({});
    res.json({ roomLists });
  } catch (error) {
    next(error);
  }
};

export const makeRooms = async (req, res, next) => {
  try {
    const { channelId, title } = req.body;
    const newRoom = await Room.create({
      title,
    });

    await Channel.findByIdAndUpdate(
      channelId,
      {
        $push: { rooms: newRoom._id },
      },
      { new: true }
    );

    res.json({ message: "success", newRoom });
  } catch (error) {
    next(error);
  }
};

export const getTeams = async (req, res, next) => {
  try {
    const teamLists = await Team.find({});
    res.json({ teamLists });
  } catch (error) {
    next(error);
  }
};

export const makeTeams = async (req, res, next) => {
  try {
    const { roomId, title } = req.body;
    const newTeam = await Team.create({
      title,
    });

    await Room.findByIdAndUpdate(
      roomId,
      {
        $push: { teams: newTeam._id },
      },
      { new: true }
    );
    res.json({ message: "success", newTeam });
  } catch (error) {
    next(error);
  }
};
