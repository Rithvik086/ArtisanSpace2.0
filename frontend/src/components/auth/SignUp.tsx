import { useState } from "react";
import Stepper, { Step } from "../Stepper";
import { useForm, type SubmitHandler } from "react-hook-form";

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      role: "customer", // Set a default role
    },
  });

  // This is your final submit handler
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log("Form data submitted:", data);
    // This is where you would send the data to your API
    // The Stepper's onFinalStepCompleted will handle moving to the next step
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
                        value: /^\S+@\S+$/i,
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
                    {...register("name", { required: "Name is required" })}
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
                  className="w-full rounded-lg bg-[#5c4033] text-white px-5 py-3 text-base font-medium hover:bg-[#4b2e2b] transition-colors shadow-lg hover:cursor-pointer "
                >
                  Create Account
                </button>
              </div>
            </Step>

            {/* --- STEP 4: Completion Screen --- */}
            <Step>
              <div className="text-center space-y-2 py-8">
                <h2 className="text-2xl font-bold text-[#4b2e2b]">
                  You're all set!
                </h2>
                <p className="text-stone-700">
                  Welcome to ArtisanSpace. We'll take you to your dashboard now.
                </p>
                {/* You could add a link or auto-redirect here */}
              </div>
            </Step>
          </Stepper>
        </form>
      </div>
    </div>
  );
}
