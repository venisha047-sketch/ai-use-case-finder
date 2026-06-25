import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-5xl font-bold tracking-tight mb-2">404</h1>
      <p className="text-lg font-medium mb-2">Page not found</p>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Button>
      </Link>
    </div>
  );
}
