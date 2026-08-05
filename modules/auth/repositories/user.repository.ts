import { Types } from "mongoose";
import connectToDatabase from "@/lib/db/mongodb";
import { User, type IUserDocument, type IUser } from "../models/user.model";

const memoryUsers: Array<Record<string, any>> = [];

const createMemoryId = () => new Types.ObjectId().toString();

const normalizeMemoryUser = (userData: Partial<IUser>) => {
  const now = new Date();
  const createdName = userData.name ?? userData.fullName ?? "";
  const createdFullName = userData.fullName ?? userData.name ?? "";

  return {
    _id: createMemoryId(),
    fullName: createdFullName,
    name: createdName,
    email: (userData.email ?? "").toLowerCase().trim(),
    passwordHash: userData.passwordHash ?? userData.password ?? "",
    password: userData.password ?? null,
    role: userData.role,
    gceLevel: userData.gceLevel,
    teacherApprovalStatus: userData.teacherApprovalStatus,
    parentLinkCode: userData.parentLinkCode ?? undefined,
    children: userData.children ?? [],
    resetPasswordToken: userData.resetPasswordToken ?? null,
    resetPasswordExpires: userData.resetPasswordExpires ?? null,
    createdAt: now,
    updatedAt: now,
  } as unknown as IUserDocument;
};

export interface IUserRepository {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findById(id: string | Types.ObjectId): Promise<IUserDocument | null>;
  create(userData: Partial<IUser>): Promise<IUserDocument>;
  findByResetToken(token: string): Promise<IUserDocument | null>;
  update(id: string | Types.ObjectId, updateData: Partial<IUser>): Promise<IUserDocument | null>;
}

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      await connectToDatabase();
      return User.findOne({ email: normalizedEmail }).select("+passwordHash");
    } catch {
      return (
        memoryUsers.find((user) => user.email === normalizedEmail) ?? null
      ) as unknown as IUserDocument | null;
    }
  }

  async findById(id: string | Types.ObjectId): Promise<IUserDocument | null> {
    const normalizedId = String(id);

    const memoryUser =
      memoryUsers.find((user) => String(user._id) === normalizedId) ?? null;

    if (memoryUser) {
      return memoryUser as IUserDocument;
    }

    if (!Types.ObjectId.isValid(normalizedId)) {
      return null;
    }

    try {
      await connectToDatabase();
      return User.findById(normalizedId).select("+passwordHash");
    } catch {
      return null;
    }
  }

  async create(userData: Partial<IUser>): Promise<IUserDocument> {
    try {
      await connectToDatabase();
      const normalized = {
        ...userData,
        fullName: userData.fullName ?? userData.name ?? "",
        name: userData.name ?? userData.fullName ?? "",
        passwordHash: userData.passwordHash ?? userData.password ?? "",
      };

      return User.create(normalized);
    } catch {
      const createdUser = normalizeMemoryUser(userData);
      memoryUsers.push(createdUser);
      return createdUser;
    }
  }

  async findByResetToken(token: string): Promise<IUserDocument | null> {
    try {
      await connectToDatabase();
      return User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      }).select("+passwordHash");
    } catch {
      return (
        memoryUsers.find(
          (user) =>
            user.resetPasswordToken === token &&
            new Date(user.resetPasswordExpires) > new Date()
        ) ?? null
      ) as unknown as IUserDocument | null;
    }
  }

  async update(id: string | Types.ObjectId, updateData: Partial<IUser>): Promise<IUserDocument | null> {
    const normalizedId = String(id);

    if (!Types.ObjectId.isValid(normalizedId)) {
      return null;
    }

    try {
      await connectToDatabase();
      return User.findByIdAndUpdate(normalizedId, updateData, {
        new: true,
        runValidators: true,
      });
    } catch {
      const index = memoryUsers.findIndex((user) => String(user._id) === normalizedId);
      if (index === -1) {
        return null;
      }

      memoryUsers[index] = {
        ...memoryUsers[index],
        ...updateData,
        updatedAt: new Date(),
      };

      return memoryUsers[index] as IUserDocument;
    }
  }
}

export const userRepository = new UserRepository();
export default userRepository;
