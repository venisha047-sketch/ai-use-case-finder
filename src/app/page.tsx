import Link from "next/link";
import {
  Sparkles,
  BarChart3,
  Route,
  FileDown,
  ChevronRight,
  CheckCircle2,
  Brain,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: Brain,
    title: "Gemini-Powered Analysis",
    description:
      "Leverage Google's Gemini 2.5 Flash to analyze your business context and surface the highest-value AI opportunities.",
  },
  {
    icon: BarChart3,
    title: "Multi-Dimensional Scoring",
    description:
      "Every use case is scored across feasibility, impact, and complexity — giving you a clear prioritization framework.",
  },
  {
    icon: Route,
    title: "30-60-90 Day Roadmap",
    description:
      "Get a structured implementation roadmap with milestones and tasks organized into actionable 30, 60, and 90-day phases.",
  },
  {
    icon: Target,
    title: "ROI Projection",
    description:
      "Each recommendation includes ROI level estimates and a realistic timeline to value so stakeholders can make informed decisions.",
  },
  {
    icon: Zap,
    title: "Tech Stack Guidance",
    description:
      "Receive curated technology recommendations — core tools, optional enhancements, and future-state architecture — tailored to your context.",
  },
  {
    icon: FileDown,
    title: "PDF Export",
    description:
      "Download a formatted PDF report covering scores, use cases, roadmap, and tech stack — ready to share with stakeholders and leadership.",
  },
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Manufacturing",
  "Education",
  "Logistics",
  "Energy",
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight">
              AI Use Case Finder
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 sm:py-28 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.12),transparent)]" />
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <Badge variant="secondary" className="mb-6 text-xs font-medium">
              Powered by Gemini 2.5 Flash
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              Find the Right AI Use Cases{" "}
              <span className="text-primary">for Your Business</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Describe your business challenge, and get a prioritized analysis
              of AI opportunities — complete with feasibility scores, ROI
              estimates, implementation roadmaps, and tech stack guidance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/sign-up">
                <Button size="lg" className="gap-2 min-w-40">
                  Start for free
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="min-w-40">
                  Sign in
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              No credit card required
            </p>
          </div>
        </section>

        {/* Social proof strip */}
        <section className="border-y border-border bg-muted/30 py-4">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
              {INDUSTRIES.map((industry) => (
                <span key={industry} className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-primary/60" />
                  {industry}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 sm:py-24">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                From problem to roadmap in minutes
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Three simple steps to transform a business challenge into an
                actionable AI strategy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
              {[
                {
                  step: "01",
                  title: "Describe your challenge",
                  desc: "Enter your industry, department, problem statement, and current process details.",
                },
                {
                  step: "02",
                  title: "AI analyzes opportunities",
                  desc: "Gemini identifies the most relevant AI use cases and scores them across multiple dimensions.",
                },
                {
                  step: "03",
                  title: "Act on your roadmap",
                  desc: "Review scored use cases, implementation milestones, and export an executive summary.",
                },
              ].map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="relative bg-card border border-border rounded-xl p-6"
                >
                  <div className="text-4xl font-bold text-primary/20 mb-4 font-mono">
                    {step}
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="py-20 sm:py-24 bg-muted/30 border-y border-border">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                Everything you need to evaluate AI readiness
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                A complete analysis toolkit designed for decision-makers and
                implementation teams alike.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-card border border-border rounded-xl p-5 group hover:border-primary/40 transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's in a report */}
        <section className="py-20 sm:py-24">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                  A complete analysis report for every project
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Each analysis delivers a rich set of outputs designed to move
                  your team from idea to decision.
                </p>
                <ul className="space-y-3">
                  {[
                    "Executive summary with key findings",
                    "Prioritized AI use case list with scores",
                    "Feasibility, impact & complexity gauges",
                    "ROI level and time-to-value estimates",
                    "30-60-90 day implementation roadmap",
                    "Core, optional & future tech stack",
                    "Risk & benefit analysis per use case",
                    "PDF export for stakeholder distribution",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mock report card */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Analysis Report
                    </div>
                    <div className="font-semibold text-sm">
                      Retail Customer Support
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                    High ROI
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Feasibility", value: 82, color: "bg-emerald-500" },
                    { label: "Impact", value: 91, color: "bg-primary" },
                    { label: "Complexity", value: 58, color: "bg-amber-500" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <div className="text-2xl font-bold tracking-tight">
                        {value}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {label}
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Top Use Cases
                  </div>
                  <div className="space-y-1.5">
                    {[
                      "AI-powered ticket triage",
                      "Customer sentiment analysis",
                      "Automated FAQ resolution",
                    ].map((uc) => (
                      <div
                        key={uc}
                        className="flex items-center gap-2 text-xs text-foreground"
                      >
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        {uc}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Roadmap Phases
                  </div>
                  <div className="flex gap-2">
                    {["Day 30", "Day 60", "Day 90"].map((phase, i) => (
                      <div
                        key={phase}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-center text-xs font-medium ${
                          i === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {phase}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-24 bg-primary">
          <div className="container max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
              Ready to find your AI opportunities?
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Create your first analysis in under 5 minutes. No AI expertise
              required — just describe your business challenge.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 bg-white text-primary hover:bg-white/90"
              >
                Get started free
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium">AI Use Case Finder</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
