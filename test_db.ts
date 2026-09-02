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
  
  const parent = await User.findOne({ email: "parent@gmail.com" });
  if (!parent) {
    console.log("Parent not found");
    process.exit(1);
  }
  
  const conns = await ParentConnection.find({ studentId: student._id });
  console.log("Connections found for student:", conns.length);
  for (const c of conns) {
    console.log(`- Connection ID: ${c._id}, Status: ${c.status}`);
  }
  
  const notifs = await Notification.find({ userId: student._id, type: 'parent_request' });
  console.log("Parent request notifications for student:", notifs.length);
  
  process.exit(0);
}
check();
