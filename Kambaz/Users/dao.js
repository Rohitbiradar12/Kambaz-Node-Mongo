import { v4 as uuidv4 } from "uuid";

export default function UsersDao(db) {
  // Create a new user and append to db.users
  function createUser(user) {
    const newUser = { ...user, _id: uuidv4() };
    db.users = [...db.users, newUser];
    return newUser;
  }

  // Return all users from the DB
  function findAllUsers() {
    return db.users;
  }

  // Find a single user by their ID
  function findUserById(userId) {
    return db.users.find((user) => String(user._id) === String(userId));
  }

  // Find a single user by username
  function findUserByUsername(username) {
    return db.users.find((user) => user.username === username);
  }

  // Find a user by username + password (for login)
  function findUserByCredentials(username, password) {
    return db.users.find(
      (user) => user.username === username && user.password === password
    );
  }

  // Update a user by ID with partial updates
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

  // Delete a user by ID
  function deleteUser(userId) {
    const { users } = db;
    const before = users.length;
    db.users = users.filter((u) => String(u._id) !== String(userId));
    return { deletedCount: before - db.users.length };
  }

  // 🔥 For People section: all users enrolled in a given course
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
