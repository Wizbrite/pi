import mongoose from "mongoose";
import { User } from "./modules/auth/models/user.model";
import { ParentConnection } from "./modules/parent/models/parent-connection.model";
import { Notification } from "./modules/parent/models/notification.model";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to DB");
  
  const student = await User.findOne({ email: "njinifavourbemsimbom@gmail.com" });
  if (!student) {
    console.log("Student not found");
    process.exit(1);
  }
  console.log("Student:", student._id);
  
  const conns = await ParentConnection.find({ studentId: student._id });
  console.log("Connections:", conns);
  
  const notifs = await Notification.find({ userId: student._id });
  console.log("Notifications:", notifs);
  
  process.exit(0);
}
check();
