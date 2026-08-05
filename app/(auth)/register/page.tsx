"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  registerSchema,
  type RegisterInput,
} from "@/modules/auth/validation/auth.schema";
import { useAuthStore } from "@/stores/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "student",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Registration failed");
        return;
      }

      setUser(result.user);
      toast.success("Account created successfully!");

      const dashboardMap: Record<string, string> = {
        student: "/student",
        teacher: "/teacher",
        parent: "/parent",
        admin: "/admin",
      };
      router.push(dashboardMap[result.user.role] || "/student");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600">
          Start your GCE prep journey today
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Ngwa Blessing"
            className="border-slate-200 bg-white text-slate-900 focus-visible:ring-blue-500"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-rose-600 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="border-slate-200 bg-white text-slate-900 focus-visible:ring-blue-500"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-rose-600 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimum 8 characters"
            className="border-slate-200 bg-white text-slate-900 focus-visible:ring-blue-500"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-xs text-rose-600 font-medium">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">I am a…</Label>
          <Select
            defaultValue="student"
            onValueChange={(value) =>
              setValue("role", value as RegisterInput["role"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="role" className="border-slate-200 bg-white text-slate-900">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-xs text-rose-600 font-medium">{errors.role.message}</p>
          )}
        </div>

        {selectedRole === "student" && (
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">GCE Level</Label>
            <Select
              onValueChange={(value) =>
                setValue("gceLevel", value as "Ordinary" | "Advanced", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="gceLevel" className="border-slate-200 bg-white text-slate-900">
                <SelectValue placeholder="Select your GCE level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ordinary">O Level (Ordinary)</SelectItem>
                <SelectItem value="Advanced">A Level (Advanced)</SelectItem>
              </SelectContent>
            </Select>
            {errors.gceLevel && (
              <p className="text-xs text-rose-600 font-medium">{errors.gceLevel.message}</p>
            )}
          </div>
        )}

        {selectedRole === "teacher" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
            <p className="text-xs text-amber-800 font-medium">
              <strong>Note:</strong> Teacher accounts require admin approval
              before full access is granted.
            </p>
          </div>
        )}

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
