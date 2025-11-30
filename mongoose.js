import mongoose from "mongoose";

const connectDb = async (connectionString) => {
  if (!connectionString) {
    throw new Error("DATABASE_CONNECTION_STRING not set");
  }

  await mongoose.connect(connectionString);

  console.log("MongoDB connected");
};

export default connectDb;
