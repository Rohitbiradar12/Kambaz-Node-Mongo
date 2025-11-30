import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function UsersDao() {
  function generateLoginId() {
    const num = Math.floor(100000000 + Math.random() * 900000000)
      .toString()
      .padStart(9, "0");
    return `${num}S`;
  }

  const createUser = (user) => {
    const newUser = {
      _id: uuidv4(),
      username: user.username,
      password: user.password,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      dob: user.dob ? new Date(user.dob) : null,
      role: user.role || "STUDENT",
      loginId: user.loginId || generateLoginId(),
      section: user.section || "S101",
      lastActivity:
        user.lastActivity || new Date().toISOString().slice(0, 10),
      totalActivity: user.totalActivity || "00:00:00",
    };

    return model.create(newUser);
  };

  const findAllUsers = () => model.find();
  const findUserById = (userId) => model.findById(userId);
  const findUserByUsername = (username) =>
    model.findOne({ username });
  const findUserByCredentials = (username, password) =>
    model.findOne({ username, password });
  const updateUser = (userId, userUpdates) =>
    model.updateOne({ _id: userId }, { $set: userUpdates });
  const deleteUser = (userId) => model.deleteOne({ _id: userId });
  const findUsersByRole = (role) => model.find({ role: role });
  const findUsersByPartialName = (partialName) => {
  const regex = new RegExp(partialName, "i");
  return model.find({
    $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
  });
};


  return {
    createUser,
    findAllUsers,
    findUserById,
    findUserByUsername,
    findUserByCredentials,
    updateUser,
    deleteUser,
    findUsersByRole,
    findUsersByPartialName,
  };
}
