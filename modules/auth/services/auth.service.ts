import crypto from "crypto";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { env } from "@/lib/config/env";
import userRepository from "../repositories/user.repository";
import { type IUser, type IUserDocument } from "../models/user.model";
import { type RegisterInput } from "../validation/auth.schema";
import { type LoginInput } from "../validation/auth.schema";

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(env.JWT_SECRET);
}

export class AuthService {
  async generateToken(user: IUserDocument): Promise<string> {
    const rawId = user._id;
    const userId =
      typeof rawId?.toHexString === "function"
        ? rawId.toHexString()
        : String(rawId);

    return new jose.SignJWT({
      id: userId,
      sub: userId,
      email: user.email,
      role: user.role,
      fullName: user.fullName || user.name,
      name: user.name || user.fullName,
      teacherApprovalStatus: user.teacherApprovalStatus,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(getJwtSecret());
  }

  async verifyToken(token: string) {
    try {
      const { payload } = await jose.jwtVerify(token, getJwtSecret());
      return payload;
    } catch {
      return null;
    }
  }

  async register(data: RegisterInput): Promise<{ user: IUserDocument; token: string }> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepository.create({
      name: data.name,
      fullName: data.name,
      email: data.email,
      passwordHash: hashedPassword,
      role: data.role,
      gceLevel: data.gceLevel,
    });

    const token = await this.generateToken(user);
    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: IUserDocument; token: string }> {
    const user = await userRepository.findByEmail(email, { includePassword: true });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordHash = user.passwordHash;
    if (!passwordHash) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const token = await this.generateToken(user);
    return { user, token };
  }

  async createPasswordResetToken(email: string): Promise<{ resetLink: string; token: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("No account found with this email");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 3600000);

    await userRepository.update(user._id.toString(), {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expires,
    });

    const resetLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    return { resetLink, token };
  }

  async resetPassword(token: string, newPassword: string): Promise<IUserDocument> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userRepository.findByResetToken(hashedToken);
    if (!user) {
      throw new Error("Password reset token is invalid or has expired");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await userRepository.update(user._id.toString(), {
      passwordHash: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    if (!updatedUser) {
      throw new Error("Failed to reset password. Please try again.");
    }

    return updatedUser;
  }
}

export const authService = new AuthService();
export default authService;