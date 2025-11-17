import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import { useDispatch } from "react-redux";
import { login } from "../../redux/slices/authSlice";

type Inputs = {
  username: string;
  password: string;
};

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/login", data);
      console.log("Login successful:", response.data);

      // Dispatch login action to Redux
      dispatch(login(response.data.user));

      // Redirect based on role or to customer page
      navigate("/customer");
    } catch (error: any) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || "Login failed";
      setError("username", { message });
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
          <h1 className="text-4xl font-black text-[#4b2e2b]">Welcome back</h1>
          <p className="mt-2 text-stone-700">
            Sign in to your ArtisanSpace account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <label className="block">
              <span className={labelClassName}>Username</span>
              <input
                type="text"
                {...register("username", {
                  required: "Username is required",
                })}
                placeholder="e.g. riya_sharma"
                className={inputClassName}
              />
              {errors.username && (
                <p className={errorClassName}>{errors.username.message}</p>
              )}
            </label>

            <label className="block">
              <span className={labelClassName}>Password</span>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                })}
                placeholder="••••••••"
                className={inputClassName}
              />
              {errors.password && (
                <p className={errorClassName}>{errors.password.message}</p>
              )}
            </label>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#5c4033] text-white px-5 py-3 text-base font-medium hover:bg-[#4b2e2b] transition-colors shadow-lg hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-stone-700">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-[#5c4033] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
