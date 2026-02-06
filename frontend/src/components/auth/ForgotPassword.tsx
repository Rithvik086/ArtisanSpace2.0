import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import api from "../../lib/axios";

type Inputs = {
  email: string;
};

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await api.post("/auth/forgot-password", data);
      setMessage(response.data.message);
    } catch (error: any) {
      console.error("Forgot password failed:", error);
      const message =
        error.response?.data?.message || "Failed to send reset email";
      setError("email", { message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5c4033]/40";
  const errorClassName = "mt-1 text-xs text-red-600";
  const labelClassName = "text-sm font-medium text-stone-700";

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <div className="p-6 sm:p-10 max-w-md w-full">
        <div className="max-w-md mx-auto mb-6 text-center">
          <h1 className="text-4xl font-black text-[#4b2e2b]">
            Forgot Password
          </h1>
          <p className="mt-2 text-stone-700">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <label className="block">
              <span className={labelClassName}>Email</span>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="your@email.com"
                className={inputClassName}
              />
              {errors.email && (
                <p className={errorClassName}>{errors.email.message}</p>
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
              {isSubmitting ? "Sending..." : "Send Reset Link"}
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
