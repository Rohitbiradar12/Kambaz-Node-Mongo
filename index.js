import express from "express";
import cors from "cors";
import session from "express-session";
import "dotenv/config";

import Hello from "./Hello.js";
import Lab5 from "./Lab5/index.js";
import db from "./Kambaz/Database/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModulesRoutes from "./Kambaz/Modules/routes.js";
import AssignmentsRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentsRoutes from "./Kambaz/Enrollments/routes.js";

const app = express();


const FRONTEND_ORIGIN =
  process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

app.set("trust proxy", 1);

app.use(
  session({
    name: "kambaz.sid",
    secret: process.env.SESSION_SECRET || "kambaz",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);


UserRoutes(app, db);
CourseRoutes(app, db);
ModulesRoutes(app, db);
AssignmentsRoutes(app, db);
EnrollmentsRoutes(app, db);

Lab5(app);
Hello(app);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
