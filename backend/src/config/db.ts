import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Db connection established`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

export default dbConnect;
