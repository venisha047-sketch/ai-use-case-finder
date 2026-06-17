import { SignUp } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-dvh flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-semibold text-white">AI Use Case Finder</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-white text-2xl font-semibold leading-snug">
            Start discovering AI opportunities for your organization.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Get started for free. Analyze unlimited use cases, generate
            prioritized roadmaps, and export executive-ready reports.
          </p>
        </div>

        <p className="text-white/50 text-xs">
          © {new Date().getFullYear()} AI Use Case Finder
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm">AI Use Case Finder</span>
          </div>
          <SignUp />
        </div>
      </div>
    </div>
  );
}
