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
    res.status(201).json({ message: "success", newChannel });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const removeChannel = async (req, res, next) => {
  try {
    const { channelId } = req.body;
    const channel = await Channel.findById(channelId);
    const Rooms = await Room.find({ _id: { $in: channel.rooms } });
    Rooms.forEach(async (room) => {
      await Team.deleteMany({ _id: { $in: room.teams } });
    });

    const deleteChannel = await Channel.findByIdAndDelete(channelId);
    await Room.deleteMany({ _id: { $in: deleteChannel.rooms } });

    res.json({ message: "success to delete" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getRooms = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const roomLists = await Channel.findById(channelId).populate("rooms");

    res.json({ roomLists: roomLists.rooms });
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
    const { roomId } = req.params;
    const teamLists = await Room.findById(roomId).populate("teams");

    res.json({ teamLists: teamLists.teams });
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

export const deleteRoom = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    const deletedRoom = await Room.findByIdAndDelete(roomId);
    await Team.deleteMany({ _id: { $in: deletedRoom.teams } });
    res.json({ message: "success to delete room" });
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const { teamId } = req.body;
    const deletedTeam = await Team.findByIdAndDelete(teamId);
    await User.deleteMany({ _id: { $in: deletedTeam.users } });
    res.json({ message: "success to delete team" });
  } catch (error) {
    next(error);
  }
};
