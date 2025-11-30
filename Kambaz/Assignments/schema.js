import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    _id: String,
    title: String,
    description: String,
    course: { type: String, ref: "CourseModel" },
    points: Number,
    due: Date,
    available: Date,
    until: Date,
  },
  { collection: "assignments" }
);

export default assignmentSchema;
