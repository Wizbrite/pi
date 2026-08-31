import { Types } from "mongoose";
import connectToDatabase from "@/lib/db/mongodb";
import { User, type IUserDocument, type IUser } from "../models/user.model";




export interface IUserRepository {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findById(id: string | Types.ObjectId): Promise<IUserDocument | null>;
  create(userData: Partial<IUser>): Promise<IUserDocument>;
  findByResetToken(token: string): Promise<IUserDocument | null>;
  update(id: string | Types.ObjectId, updateData: Partial<IUser>): Promise<IUserDocument | null>;
}

export class UserRepository implements IUserRepository {
  async findByEmail(email: string, options?: { includePassword?: boolean }): Promise<IUserDocument | null> {
    await connectToDatabase();
    const query = User.findOne({ email: email.toLowerCase().trim() });
    if (options?.includePassword) query.select("+passwordHash");
    return query;
  }

  async findById(
    id: string | Types.ObjectId,
    options?: { includePassword?: boolean }
  ): Promise<IUserDocument | null> {
    await connectToDatabase();
    const query = User.findById(id);
    if (options?.includePassword) query.select("+passwordHash");
    return query;
  }

  async create(userData: Partial<IUser>): Promise<IUserDocument> {
    await connectToDatabase();
    return User.create({
      ...userData,
      fullName: userData.fullName ?? userData.name ?? "",
      name: userData.name ?? userData.fullName ?? "",
      passwordHash: userData.passwordHash ?? "",
    });
  }

  async findByResetToken(token: string): Promise<IUserDocument | null> {
    await connectToDatabase();
    return User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+passwordHash");
  }

  async update(id: string | Types.ObjectId, updateData: Partial<IUser>): Promise<IUserDocument | null> {
    const normalizedId = String(id);
    if (!Types.ObjectId.isValid(normalizedId)) return null;
    await connectToDatabase();
    return User.findByIdAndUpdate(normalizedId, updateData, { new: true, runValidators: true });
  }
}

export const userRepository = new UserRepository();
export default userRepository;
