import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Use Case Finder",
    template: "%s | AI Use Case Finder",
  },
  description:
    "Discover and prioritize AI use cases for your organization with Gemini-powered analysis, feasibility scores, ROI estimates, and 90-day implementation roadmaps.",
  keywords: [
    "AI use cases",
    "artificial intelligence",
    "business strategy",
    "AI roadmap",
    "Gemini AI",
    "ROI analysis",
  ],
  openGraph: {
    type: "website",
    siteName: "AI Use Case Finder",
    title: "AI Use Case Finder",
    description:
      "Describe your business challenge and get a prioritized AI analysis — complete with feasibility scores, ROI estimates, implementation roadmaps, and tech stack guidance.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Use Case Finder",
    description:
      "Discover the right AI opportunities for your business with Gemini-powered analysis.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full`}
      >
        <body className="min-h-dvh bg-background antialiased">
          {children}
          <Toaster position="bottom-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
