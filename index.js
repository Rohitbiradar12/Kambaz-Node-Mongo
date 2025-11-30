import express from "express";
import "dotenv/config";
import cors from "cors";
import session from "express-session";

import Hello from "./Hello.js";
import Lab5 from "./Lab5/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModulesRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentsRoutes from "./Kambaz/Enrollments/routes.js";

import connectDb from "./mongoose.js";
import seedFromDatabase from "./Kambaz/Database/seed.js";

import path from "path";

const CONNECTION_STRING =
  process.env.DATABASE_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";

const app = express();

async function start() {
  try {
    await connectDb(CONNECTION_STRING);
  } catch (err) {
    console.error("Failed to connect to MongoDB, exiting.", err);
    process.exit(1);
  }

  app.set("trust proxy", 1);

  app.use(
    cors({
      credentials: true,
      origin: process.env.CLIENT_URL || "http://localhost:3000",
    })
  );

  app.use(express.json());

  const isDev = process.env.SERVER_ENV === "development";

  const sessionOptions = {
    secret: process.env.SESSION_SECRET || "kambaz",
    resave: false,
    saveUninitialized: false,
    proxy: !isDev,
  };

  const cookieOptions = {
    httpOnly: true,
    sameSite: isDev ? "lax" : "none",
    secure: isDev ? false : true,
  };

  if (process.env.SESSION_COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.SESSION_COOKIE_DOMAIN;
  }

  sessionOptions.cookie = cookieOptions;

  app.use(session(sessionOptions));

  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  UserRoutes(app);
  CourseRoutes(app);
  ModulesRoutes(app);
  AssignmentRoutes(app);
  EnrollmentsRoutes(app);
  Lab5(app);
  Hello(app);

  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  });

  app.use(
    "/images",
    express.static(path.join(process.cwd(), "public", "images"))
  );

  const PORT = process.env.PORT || 4000;

  await seedFromDatabase("./Kambaz/Database");

  app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT} (env=${
        process.env.SERVER_ENV || "development"
      })`
    );
    console.log(`CLIENT_URL=${process.env.CLIENT_URL}`);
  });
}

start();
