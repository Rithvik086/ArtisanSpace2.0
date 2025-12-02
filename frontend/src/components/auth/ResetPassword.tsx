import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../lib/axios";

type Inputs = {
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<Inputs>();

  const password = watch("newPassword");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid reset link. No token provided.");
    }
  }, [token]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!token) {
      setError("newPassword", { message: "Invalid reset token" });
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      });
      setMessage(response.data.message);
    } catch (error: any) {
      console.error("Reset password failed:", error);
      const message =
        error.response?.data?.message || "Failed to reset password";
      setError("newPassword", { message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5c4033]/40";
  const errorClassName = "mt-1 text-xs text-red-600";
  const labelClassName = "text-sm font-medium text-stone-700";

  if (!token) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="p-6 sm:p-10 max-w-md w-full text-center">
          <h1 className="text-4xl font-black text-[#4b2e2b]">Invalid Link</h1>
          <p className="mt-2 text-stone-700">
            This password reset link is invalid or expired.
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="rounded-lg bg-[#5c4033] text-white px-5 py-3 text-base font-medium hover:bg-[#4b2e2b] transition-colors shadow-lg"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <div className="p-6 sm:p-10 max-w-md w-full">
        <div className="max-w-md mx-auto mb-6 text-center">
          <h1 className="text-4xl font-black text-[#4b2e2b]">Reset Password</h1>
          <p className="mt-2 text-stone-700">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <label className="block">
              <span className={labelClassName}>New Password</span>
              <input
                type="password"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="••••••••"
                className={inputClassName}
              />
              {errors.newPassword && (
                <p className={errorClassName}>{errors.newPassword.message}</p>
              )}
            </label>

            <label className="block">
              <span className={labelClassName}>Confirm New Password</span>
              <input
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                placeholder="••••••••"
                className={inputClassName}
              />
              {errors.confirmPassword && (
                <p className={errorClassName}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </label>
          </div>

          {message && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#5c4033] text-white px-5 py-3 text-base font-medium hover:bg-[#4b2e2b] transition-colors shadow-lg hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-stone-700">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-[#5c4033] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
