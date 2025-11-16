import { v4 as uuidv4 } from "uuid";

export default function UsersDao(db) {

  function generateLoginId() {

    const num = Math.floor(100000000 + Math.random() * 900000000)
      .toString()
      .padStart(9, "0");
    return `${num}S`;
  }

  function createUser(user) {
    const newUser = {
      _id: uuidv4(),
      username: user.username,
      password: user.password,

      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",


      dob: user.dob ? new Date(user.dob).toISOString() : null,

      role: user.role || "STUDENT",


      loginId: user.loginId || generateLoginId(),
      section: user.section || "S101",
      lastActivity:
        user.lastActivity || new Date().toISOString().slice(0, 10), 
      totalActivity: user.totalActivity || "00:00:00",
    };


    db.users = [...db.users, newUser];
    return newUser;
  }

  function findAllUsers() {
    return db.users;
  }

  function findUserById(userId) {
    return db.users.find((user) => String(user._id) === String(userId));
  }

  function findUserByUsername(username) {
    return db.users.find((user) => user.username === username);
  }

  function findUserByCredentials(username, password) {
    return db.users.find(
      (user) => user.username === username && user.password === password
    );
  }

  function updateUser(userId, userUpdates) {
    const { users } = db;
    const existing = users.find((u) => String(u._id) === String(userId));
    if (!existing) {
      return null;
    }

    const updated = { ...existing, ...userUpdates, _id: existing._id };
    db.users = users.map((u) =>
      String(u._id) === String(userId) ? updated : u
    );
    return updated;
  }

  function deleteUser(userId) {
    const { users } = db;
    const before = users.length;
    db.users = users.filter((u) => String(u._id) !== String(userId));
    return { deletedCount: before - db.users.length };
  }

  function findUsersForCourse(courseId) {
    const { users, enrollments } = db;
    const enrolledUserIds = enrollments
      .filter((e) => String(e.course) === String(courseId))
      .map((e) => String(e.user));

    return users.filter((u) => enrolledUserIds.includes(String(u._id)));
  }

  return {
    createUser,
    findAllUsers,
    findUserById,
    findUserByUsername,
    findUserByCredentials,
    updateUser,
    deleteUser,
    findUsersForCourse,
  };
}
