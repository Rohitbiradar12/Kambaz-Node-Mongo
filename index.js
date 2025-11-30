import express from "express";
import cors from "cors";
import session from "express-session";
import "dotenv/config";
import mongoose from "mongoose";

import Hello from "./Hello.js";
import Lab5 from "./Lab5/index.js";
import db from "./Kambaz/Database/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModulesRoutes from "./Kambaz/Modules/routes.js";
import AssignmentsRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentsRoutes from "./Kambaz/Enrollments/routes.js";
import seedDatabase from "./Kambaz/Database/seed.js";

const CONNECTION_STRING =
  process.env.DATABASE_CONNECTION_STRING ||
  "mongodb://127.0.0.1:27017/kambaz";

const app = express();

app.set("trust proxy", 1);

const FRONTEND_ORIGIN = process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

const isDev = process.env.SERVER_ENV === "development";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "kambaz",
    resave: false,
    saveUninitialized: false,
    proxy: !isDev,
    cookie: {
      httpOnly: true,
      sameSite: isDev ? "lax" : "none",
      secure: isDev ? false : true,
      // secure: !isDev
    },
  })
);

UserRoutes(app, db);
CourseRoutes(app, db);
ModulesRoutes(app);
AssignmentsRoutes(app, db);
EnrollmentsRoutes(app, db);

Lab5(app);
Hello(app);

mongoose
  .connect(CONNECTION_STRING)
  .then(async () => {
    await seedDatabase();
    console.log("MongoDB connected and seeded");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

export default app;
