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
  metadataBase: new URL("https://hicejo.com"),
  title: "Hicejo — A More Thoughtful Job Search",
  description: "Build a clear resume, see how it fits a role, and prepare for interviews with practical career tools that keep your experience at the center.",
  keywords: [
    "resume builder",
    "ATS resume checker",
    "resume tailor",
    "cover letter generator",
    "resume roast",
    "mock interview practice",
    "STAR interview prep",
    "AI career coach"
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
    title: "Hicejo — A More Thoughtful Job Search",
    description: "Build a clear resume, see how it fits a role, and prepare for interviews with practical career tools that keep your experience at the center.",
    siteName: "Hicejo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hicejo — A More Thoughtful Job Search",
    description: "Build a clear resume, see how it fits a role, and prepare for interviews with practical career tools that keep your experience at the center.",
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
