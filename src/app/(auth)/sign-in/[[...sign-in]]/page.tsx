import { SignIn } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-dvh flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-semibold text-white">AI Use Case Finder</span>
        </div>

        <div className="space-y-4">
          <blockquote className="text-white/90 text-xl font-medium leading-relaxed">
            "Identify, score, and prioritize AI opportunities across your entire
            organization — powered by Gemini."
          </blockquote>
          <div className="space-y-3">
            {[
              "Gemini-powered use case analysis",
              "Feasibility & impact scoring",
              "90-day implementation roadmap",
              "Export-ready executive reports",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 text-white/80 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/50 text-xs">
          © {new Date().getFullYear()} AI Use Case Finder
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm">AI Use Case Finder</span>
          </div>
          <SignIn />
        </div>
      </div>
    </div>
  );
}
