import mongoose from "mongoose";
import schema from "../Modules/schema.js"

const courseSchema = new mongoose.Schema(
  {
    _id: String,
    name: String,
    number: String,
    startDate: String, 
    endDate: String,       
    department: String,
    credits: Number,
    image: String,         
    description: String,
    modules: [schema],
  },
  { collection: "courses" }
);

export default courseSchema;
