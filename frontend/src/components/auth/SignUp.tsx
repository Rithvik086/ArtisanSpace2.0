import { useState } from "react";
import Stepper, { Step } from "../Stepper";
import { useForm, type SubmitHandler } from "react-hook-form";

type Inputs = {
  example: string;
  exampleRequired: string;
};

export default function SignUp() {
  const [name, setName] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  return (
    <div className="min-h-screen bg-amber-50 pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto mb-6 text-center">
        <h1 className="text-4xl font-black text-amber-950">
          Create your account
        </h1>
        <p className="mt-2 text-amber-900">
          Join ArtisanSpace in minutes and start showcasing your craft.
        </p>
      </div>
      <Stepper
        className="w-full flex flex-col items-center justify-start p-0"
        initialStep={1}
        onStepChange={(step) => {
          console.log(step);
        }}
        onFinalStepCompleted={() => console.log("All steps completed!")}
        backButtonText="Back"
        nextButtonText="Continue"
        stepCircleContainerClassName="border border-amber-200 bg-white"
        stepContainerClassName="justify-center gap-3"
        contentClassName="py-8"
        footerClassName=""
        backButtonProps={{
          className:
            "rounded-lg px-4 py-2 text-amber-900 hover:text-amber-950 transition-colors hover:cursor-pointer",
        }}
        nextButtonProps={{
          className:
            "rounded-lg bg-amber-950 text-amber-100 px-5 py-2 hover:bg-amber-900 transition-colors shadow-lg hover:cursor-pointer ",
        }}
      >
        <Step>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-amber-950">
              Welcome to ArtisanSpace
            </h2>
            <p className="text-amber-900">
              Let's set up your account in a few quick steps.
            </p>
          </div>
        </Step>
        <Step>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-amber-950">Basic info</h2>
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-amber-900">
                  Your name
                </span>
                <input
                  className="mt-1 w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-amber-950 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-800/60"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Riya Sharma"
                />
              </label>
            </div>
          </div>
        </Step>
        <Step>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-amber-950">
              Profile details
            </h2>
            <p className="text-amber-900">
              Add some optional details now or finish later.
            </p>
          </div>
        </Step>
        <Step>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-amber-950">
              You're all set!
            </h2>
            <p className="text-amber-900">
              We'll take you to your dashboard next.
            </p>
          </div>
        </Step>
      </Stepper>
    </div>
  );
}
