import { useState } from "react";
import Stepper, { Step } from "../Stepper";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";

// 1. Updated the Inputs type for all fields
type Inputs = {
  username: string;
  email: string;
  password: string;
  name: string;
  mobile_no: string;
  role: string;
  terms: boolean;
};

export default function SignUp() {
  // 2. Added currentStep state to control footer visibility
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
    trigger,
  } = useForm<Inputs>({
    mode: "onChange",
    defaultValues: {
      role: "customer", // Set a default role
    },
  });

  const onBeforeNext = async (step: number) => {
    if (step === 1) {
      // Validate form fields first
      const isValid = await trigger(["username", "email", "password"]);
      if (!isValid) throw new Error("Validation failed");

      // Then check uniqueness
      const values = getValues();
      const [usernameRes, emailRes] = await Promise.all([
        api.post("/auth/check-username", { username: values.username }),
        api.post("/auth/check-email", { email: values.email }),
      ]);
      if (!usernameRes.data.available) {
        setError("username", { message: usernameRes.data.message });
        throw new Error("Validation failed");
      }
      if (!emailRes.data.available) {
        setError("email", { message: emailRes.data.message });
        throw new Error("Validation failed");
      }
    } else if (step === 2) {
      const isValid = await trigger(["name", "mobile_no"]);
      if (!isValid) throw new Error("Validation failed");
    } else if (step === 3) {
      const isValid = await trigger(["role", "terms"]);
      if (!isValid) throw new Error("Validation failed");
    }
  };

  // This is your final submit handler
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/signup", data);
      console.log("Signup successful:", response.data);
      // Redirect user to the appropriate dashboard based on selected role
      // Use replace to avoid back-navigation to signup
      if (data.role === "artisan") {
        navigate("/artisan", { replace: true });
      } else {
        // default to customer dashboard
        navigate("/customer", { replace: true });
      }
    } catch (error: any) {
      console.error("Signup failed:", error);
      const message = error.response?.data?.message || "Signup failed";
      if (message.includes("Username")) {
        setError("username", { message: "Username already exists" });
      } else if (
        message.includes("email") ||
        message === "Invalid email format"
      ) {
        setError("email", { message });
      } else {
        setError("username", { message });
      }
      throw new Error(message); // Reject to prevent stepper from advancing
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
      <div className="p-6 sm:p-10 max-w-2xl w-full">
        <div className="max-w-2xl mx-auto mb-6 text-center">
          <h1 className="text-4xl font-black text-[#4b2e2b]">
            Create your account
          </h1>
          <p className="mt-2 text-stone-700">
            Join ArtisanSpace in minutes and start showcasing your craft.
          </p>
        </div>

        {/* 3. Form wraps the entire Stepper */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stepper
            className="w-full flex flex-col items-center justify-start p-0"
            initialStep={1}
            onBeforeNext={onBeforeNext}
            onStepChange={(step) => {
              // 4. Update the current step
              setCurrentStep(step);
            }}
            // 5. This prop now controls advancing *after* successful submission
            onFinalStepCompleted={handleSubmit(onSubmit)}
            backButtonText="Back"
            nextButtonText="Continue"
            stepCircleContainerClassName="border border-stone-200 bg-white"
            stepContainerClassName="justify-center gap-3"
            contentClassName="py-10 max-w-md w-full mx-auto" // tighter & centered
            // 5. Hide the default footer on the final *form* step (Step 3)
            footerClassName={currentStep === 3 ? "hidden" : ""}
            backButtonProps={{
              className:
                "rounded-lg px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors hover:cursor-pointer",
            }}
            nextButtonProps={{
              className:
                "rounded-lg bg-[#5c4033] text-white px-5 py-2 hover:bg-[#4b2e2b] transition-colors shadow-lg hover:cursor-pointer ",
            }}
          >
            {/* --- STEP 1: Account Credentials --- */}
            <Step>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#4b2e2b] text-center">
                  Account Credentials
                </h2>
                <label className="block">
                  <span className={labelClassName}>Username</span>
                  <input
                    type="text"
                    {...register("username", {
                      required: "Username is required",
                      minLength: {
                        value: 3,
                        message: "Username must be at least 3 characters long",
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message:
                          "Username can only contain letters, numbers, and underscores",
                      },
                    })}
                    placeholder="e.g. riya_sharma"
                    className={inputClassName}
                  />
                  {errors.username && (
                    <p className={errorClassName}>{errors.username.message}</p>
                  )}
                </label>

                <label className="block">
                  <span className={labelClassName}>Email</span>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                        message: "Invalid email address",
                      },
                    })}
                    placeholder="riya@example.com"
                    className={inputClassName}
                  />
                  {errors.email && (
                    <p className={errorClassName}>{errors.email.message}</p>
                  )}
                </label>

                <label className="block">
                  <span className={labelClassName}>Password</span>
                  <input
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    placeholder="••••••••"
                    className={inputClassName}
                  />
                  {errors.password && (
                    <p className={errorClassName}>{errors.password.message}</p>
                  )}
                </label>
              </div>
            </Step>

            {/* --- STEP 2: Personal Details --- */}
            <Step>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#4b2e2b] text-center">
                  Personal Details
                </h2>
                <label className="block">
                  <span className={labelClassName}>Your name</span>
                  <input
                    type="text"
                    {...register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 3,
                        message: "Name must be at least 3 characters long",
                      },
                      pattern: {
                        value: /^[a-zA-Z\s]+$/,
                        message: "Name can only contain letters and spaces",
                      },
                    })}
                    placeholder="e.g. Riya Sharma"
                    className={inputClassName}
                  />
                  {errors.name && (
                    <p className={errorClassName}>{errors.name.message}</p>
                  )}
                </label>

                <label className="block">
                  <span className={labelClassName}>Mobile number</span>
                  <input
                    type="tel"
                    {...register("mobile_no", {
                      required: "Mobile number is required",
                      pattern: {
                        value: /^\d{10}$/,
                        message: "Invalid mobile number (must be 10 digits)",
                      },
                    })}
                    placeholder="9090909090"
                    className={inputClassName}
                  />
                  {errors.mobile_no && (
                    <p className={errorClassName}>{errors.mobile_no.message}</p>
                  )}
                </label>
              </div>
            </Step>

            {/* --- STEP 3: Role & Finalize --- */}
            <Step>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#4b2e2b] text-center">
                  Final Details
                </h2>
                <label className="block">
                  <span className={labelClassName}>Select your role</span>
                  <select {...register("role")} className={inputClassName}>
                    <option value="customer">Customer (Browsing art)</option>
                    <option value="artisan">Artisan (Selling art)</option>
                  </select>
                  {/* Errors not really needed for a select with a default */}
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register("terms", {
                      required: "You must accept the terms",
                    })}
                    className="rounded border-stone-300 text-[#4b2e2b] focus:ring-[#5c4033]/40"
                  />
                  <span className="text-sm text-stone-700">
                    I agree to the{" "}
                    <a href="#" className="font-medium hover:underline">
                      Terms and Conditions
                    </a>
                  </span>
                </label>
                {errors.terms && (
                  <p className={errorClassName}>{errors.terms.message}</p>
                )}
              </div>

              {/* 6. This is the new, primary submit button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-[#5c4033] text-white px-5 py-3 text-base font-medium hover:bg-[#4b2e2b] transition-colors shadow-lg hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </Step>
          </Stepper>
        </form>
      </div>
    </div>
  );
}
