import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z
    .string()
    .trim()
    .min(10, "MONGODB_URI must be configured")
    .regex(/^mongodb(?:\+srv)?:\/\//, "MONGODB_URI must be a valid MongoDB connection string"),
  JWT_SECRET: z.string().trim().min(32, "JWT_SECRET must be at least 32 characters long"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .trim()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),
  CLOUDINARY_CLOUD_NAME: z.string().trim().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().trim().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().trim().min(1, "CLOUDINARY_API_SECRET is required"),
  MISTRAL_API_KEY: z.string().trim().min(1, "MISTRAL_API_KEY is required"),
});

const parsed = envSchema.safeParse({
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000"),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
});

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", parsed.error.format());
  throw new Error("Invalid environment configuration. Fix the environment variables in .env.local");
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
