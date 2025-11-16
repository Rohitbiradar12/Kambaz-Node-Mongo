import EnrollmentsDao from "./dao.js";

export default function EnrollmentsRoutes(app, db) {
  const dao = EnrollmentsDao(db);

  const findEnrollmentsForUser = (req, res) => {
    let { userId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    const enrollments = dao.findEnrollmentsForUser(userId);
    res.json(enrollments);
  };

  const enroll = (req, res) => {
    let { userId } = req.params;
    const { courseId } = req.body;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    dao.enrollUserInCourse(userId, courseId);
    res.sendStatus(204);
  };

  const unenroll = (req, res) => {
    let { userId } = req.params;
    const { courseId } = req.body;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    dao.unenrollUserFromCourse(userId, courseId);
    res.sendStatus(204);
  };

  app.get("/api/users/:userId/enrollments", findEnrollmentsForUser);
  app.post("/api/users/:userId/enrollments", enroll);
  app.delete("/api/users/:userId/enrollments", unenroll);
}
