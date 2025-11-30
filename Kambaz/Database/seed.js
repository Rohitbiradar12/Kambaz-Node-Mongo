// src/db/seedFromJsOrJson.js
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { v4 as uuidv4 } from "uuid";

import UserModel from "../Users/model.js";
import CourseModel from "../Courses/model.js";
import EnrollmentModel from "../Enrollments/model.js";
import AssignmentModel from "../Assignments/model.js";

async function loadArrayFromFile(dir, baseName) {
  const jsPath = path.resolve(dir, `${baseName}.js`);
  if (fsSync.existsSync(jsPath)) {
    try {
      const mod = await import(pathToFileURL(jsPath).href);
      if (Array.isArray(mod.default)) return mod.default;
      console.warn(
        `Seeder: ${baseName}.js found but default export not an array.`
      );
      return null;
    } catch (err) {
      console.error(`Seeder: failed importing ${jsPath}:`, err);
      return null;
    }
  }

  const jsonPath = path.resolve(dir, `${baseName}.json`);
  if (fsSync.existsSync(jsonPath)) {
    try {
      const raw = await fs.readFile(jsonPath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      console.warn(`Seeder: ${baseName}.json found but content not an array.`);
      return null;
    } catch (err) {
      console.error(`Seeder: failed reading/parsing ${jsonPath}:`, err);
      return null;
    }
  }

  return null;
}

const ensureId = (doc) => {
  if (!doc._id) doc._id = uuidv4();
  return doc;
};

export default async function seedFromDatabase(dataDir = "./Kambaz/Database") {
  console.log("Seeder: looking for JS/JSON files in", dataDir);

  const usersArr = await loadArrayFromFile(dataDir, "users");
  const coursesArr = await loadArrayFromFile(dataDir, "courses");
  const modulesArr = await loadArrayFromFile(dataDir, "modules");
  const enrollmentsArr = await loadArrayFromFile(dataDir, "enrollments");
  const assignmentsArr = await loadArrayFromFile(dataDir, "assignments");


  try {
    const usersCount = await UserModel.countDocuments();
    if (usersCount === 0 && Array.isArray(usersArr) && usersArr.length > 0) {
      console.log(
        `Seeder: inserting ${usersArr.length} users (per-doc validation)`
      );

      const allowedRoles = new Set(["STUDENT", "FACULTY", "ADMIN", "USER"]);

      for (const rawUser of usersArr) {
        const u = { ...rawUser };
        if (!u._id) u._id = uuidv4();

        if (!u.role || !allowedRoles.has(u.role)) {
          console.warn(
            `Seeder: user ${u.username || u._id} has invalid/missing role "${
              u.role
            }", defaulting to "STUDENT"`
          );
          u.role = "STUDENT";
        }

        if (u.dob && typeof u.dob === "string") {
          const d = new Date(u.dob);
          if (!isNaN(d)) u.dob = d;
          else delete u.dob; 
        }

        if (!u.username || !u.password) {
          console.error(
            `Seeder: skipping user because required field missing. username="${u.username}", _id=${u._id}`
          );
          continue;
        }

        try {
          const created = await UserModel.create(u);
          console.log(
            `Seeder: created user ${created.username} (id=${created._id})`
          );
        } catch (err) {
          if (err && err.name === "ValidationError") {
            console.error(
              `Seeder: validation error for user ${u.username}:`,
              err.message
            );
          } else if (err && err.code === 11000) {
            console.error(
              `Seeder: duplicate key error inserting user ${u.username}:`,
              err.message
            );
          } else {
            console.error(
              `Seeder: error inserting user ${u.username}:`,
              err && (err.message || err)
            );
          }
        }
      } 
    } else {
      console.log(
        `Seeder: users collection not empty or no users file (count=${usersCount})`
      );
    }
  } catch (err) {
    console.error("Seeder: users insert error:", err);
  }

  try {
    const coursesCount = await CourseModel.countDocuments();
    if (
      coursesCount === 0 &&
      Array.isArray(coursesArr) &&
      coursesArr.length > 0
    ) {
      console.log(`Seeder: inserting ${coursesArr.length} courses`);
      const toInsert = coursesArr.map((c) => {
        const cc = { ...c };
        ensureId(cc);
        if (Array.isArray(cc.modules)) {
          cc.modules = cc.modules.map((m) => {
            const mm = { ...m };
            ensureId(mm);
            if (Array.isArray(mm.lessons)) {
              mm.lessons = mm.lessons.map((ls) => ensureId(ls));
            }
            return mm;
          });
        }
        return cc;
      });
      await CourseModel.insertMany(toInsert);
    } else {
      console.log(
        `Seeder: courses collection not empty or no courses file (count=${coursesCount})`
      );
    }
  } catch (err) {
    console.error("Seeder: courses insert error:", err);
  }

  if (Array.isArray(modulesArr) && modulesArr.length > 0) {
    try {
      console.log(
        `Seeder: processing ${modulesArr.length} modules from modules file`
      );
      for (const mod of modulesArr) {
        const moduleObj = { ...mod };
        ensureId(moduleObj);
        if (Array.isArray(moduleObj.lessons)) {
          moduleObj.lessons = moduleObj.lessons.map((ls) => ensureId(ls));
        }
        const courseId = moduleObj.course || moduleObj.courseId;
        if (!courseId) {
          console.warn(
            "Seeder: module missing course/courseId field, skipping",
            moduleObj
          );
          continue;
        }
        const updateRes = await CourseModel.updateOne(
          { _id: courseId, "modules._id": { $ne: moduleObj._id } },
          { $push: { modules: moduleObj } }
        );

        if (updateRes.matchedCount === 0) {
          const courseExists = await CourseModel.exists({ _id: courseId });
          if (!courseExists) {
            console.warn(
              `Seeder: no course found for module (courseId=${courseId}), skipping module _id=${moduleObj._id}`
            );
          } else {
            console.log(
              `Seeder: module ${moduleObj._id} already exists in course ${courseId}, skipping.`
            );
          }
        } else {
          console.log(
            `Seeder: pushed module ${moduleObj._id} into course ${courseId}`
          );
        }
      }
    } catch (err) {
      console.error("Seeder: modules processing error:", err);
    }
  } else {
    console.log("Seeder: no modules file found or empty");
  }

  try {
    const enrollCount = await EnrollmentModel.countDocuments();
    if (
      enrollCount === 0 &&
      Array.isArray(enrollmentsArr) &&
      enrollmentsArr.length > 0
    ) {
      console.log(`Seeder: inserting ${enrollmentsArr.length} enrollments`);
      const toInsert = enrollmentsArr.map((e) => ensureId({ ...e }));
      await EnrollmentModel.insertMany(toInsert);
    } else {
      console.log(
        `Seeder: enrollments collection not empty or no enrollments file (count=${enrollCount})`
      );
    }
  } catch (err) {
    console.error("Seeder: enrollments insert error:", err);
  }

  try {
    const assignCount = await AssignmentModel.countDocuments();
    if (
      assignCount === 0 &&
      Array.isArray(assignmentsArr) &&
      assignmentsArr.length > 0
    ) {
      console.log(`Seeder: inserting ${assignmentsArr.length} assignments`);
      const toInsert = assignmentsArr.map((a) => ensureId({ ...a }));
      await AssignmentModel.insertMany(toInsert);
    } else {
      console.log(
        `Seeder: assignments collection not empty or no assignments file (count=${assignCount})`
      );
    }
  } catch (err) {
    console.error("Seeder: assignments insert error:", err);
  }

  console.log("Seeder: finished.");
}