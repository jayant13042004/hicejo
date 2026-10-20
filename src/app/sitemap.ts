import { MetadataRoute } from "next";
import { BLOG_ARTICLES } from "@/data/blogArticles";
import { STARTER_TEMPLATES } from "@/data/starterTemplates";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hicejo.com";
  const lastModified = new Date();

  const coreRoutes = [
    "",
    "/login",
    "/register",
    "/about",
    "/contact",
    "/security",
    "/terms",
    "/privacy",
    "/cookie-policy",
    "/templates",
    "/blog",
    "/tools/ats-resume-checker",
    "/tools/resume-roast",
    "/tools/resume-tailor",
    "/tools/cover-letter-generator"
  ];

  const templateRoutes = STARTER_TEMPLATES.map((t) => `/templates/${t.id}-resume`);
  const blogRoutes = BLOG_ARTICLES.map((b) => `/blog/${b.slug}`);

  const allRoutes = [...coreRoutes, ...templateRoutes, ...blogRoutes];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "daily" : route.startsWith("/blog") ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : route.startsWith("/tools") ? 0.9 : route.startsWith("/templates") ? 0.85 : 0.75
  }));
}
