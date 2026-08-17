import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hicejo.com";
  const lastModified = new Date();

  const publicRoutes = [
    "",
    "/login",
    "/register",
    "/tools/ats-resume-checker",
    "/tools/resume-roast",
    "/tools/resume-tailor",
    "/tools/cover-letter-generator",
    "/templates/software-engineer-resume",
    "/templates/product-manager-resume",
    "/templates/data-scientist-resume",
    "/templates/marketing-specialist-resume",
    "/templates/college-student-resume",
    "/blog",
    "/blog/how-to-beat-ats-in-2026",
    "/blog/top-50-resume-action-verbs",
    "/blog/how-to-tailor-resume-for-job-description"
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/tools") ? 0.9 : route.startsWith("/templates") ? 0.8 : 0.7
  }));
}
