import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/shared/AnalyticsProvider";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
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
  title: "Hicejo — The AI Career Platform & Resume Optimizer",
  description: "Optimize your job search. Hicejo helps you build, checker, roast, and tailor your resumes and cover letters against applicant tracking systems (ATS) using advanced AI matching algorithms.",
  keywords: [
    "resume builder",
    "ATS resume checker",
    "resume tailor",
    "cover letter generator",
    "resume roast",
    "AI career coach",
    "job search organizer"
  ],
  authors: [{ name: "Hicejo Engineering" }],
  creator: "Hicejo Inc.",
  publisher: "Hicejo Inc.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hicejo.com",
    title: "Hicejo — The AI Career Platform & Resume Optimizer",
    description: "Optimize your job search. Hicejo helps you build, checker, roast, and tailor your resumes and cover letters against applicant tracking systems (ATS) using advanced AI matching algorithms.",
    siteName: "Hicejo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hicejo — The AI Career Platform & Resume Optimizer",
    description: "Optimize your job search. Build, checker, roast, and tailor resumes using advanced AI matching.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
