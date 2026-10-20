import fs from "fs";
import path from "path";
import { cookies } from "next/headers";

// Path to store mock database JSON file locally in the src folder
const mockDbPath = path.join(process.cwd(), "src/lib/mock-db.json");

interface MockDb {
  profiles: Record<string, any>;
  resumes: any[];
  coverLetters: any[];
}

// Safe check to determine if Supabase keys are placeholder OR if user is in sandbox demo mode
export async function isDemoMode(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.startsWith("https://placeholder")) {
    return true;
  }

  // Also check if current request has sb-mock-session cookie
  try {
    const cookieStore = await cookies();
    return cookieStore.get("sb-mock-session")?.value === "true";
  } catch {
    // If called outside request context (e.g. during build)
  }

  return false;
}

// Async-safe alias of isDemoMode for backward compatibility
export const isDemoSession = isDemoMode;

// Module-level in-memory fallback cache for serverless/read-only environments
let inMemoryDbCache: MockDb | null = null;

function getDefaultDb(): MockDb {
  return {
    profiles: {
      "demo-user-id": {
        id: "demo-user-id",
        email: "demo@hicejo.com",
        full_name: "Jayant",
        target_role: "Software Engineer",
        target_industry: "Technology",
        target_salary: "$120,000"
      }
    },
    resumes: [
      {
        id: "1",
        user_id: "demo-user-id",
        title: "Full-Stack Dev Resume",
        content: {
          personalInfo: { fullName: "Jayant", email: "jayant@email.com", phone: "(555) 000-0000", location: "San Francisco, CA", website: "", linkedin: "" },
          summary: "Experienced Full-Stack developer specializing in React/Next.js.",
          experience: [],
          education: [],
          projects: [],
          skills: []
        },
        ats_score: 85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    coverLetters: []
  };
}

function getDb(): MockDb {
  if (inMemoryDbCache) {
    return inMemoryDbCache;
  }

  try {
    const dir = path.dirname(mockDbPath);
    if (!fs.existsSync(dir)) {
      try { fs.mkdirSync(dir, { recursive: true }); } catch {}
    }

    if (fs.existsSync(mockDbPath)) {
      const content = fs.readFileSync(mockDbPath, "utf-8");
      inMemoryDbCache = JSON.parse(content);
      return inMemoryDbCache!;
    }
  } catch (err) {
    console.warn("Serverless disk read warning, using in-memory mock DB:", err);
  }

  inMemoryDbCache = getDefaultDb();
  return inMemoryDbCache;
}

function saveDb(db: MockDb) {
  inMemoryDbCache = db;
  try {
    fs.writeFileSync(mockDbPath, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.warn("Serverless disk write warning, relying on in-memory cache:", err);
  }
}

export function getDemoProfile() {
  const db = getDb();
  return db.profiles["demo-user-id"] || getDefaultDb().profiles["demo-user-id"];
}

export function updateDemoProfile(updates: any) {
  const db = getDb();
  db.profiles["demo-user-id"] = {
    ...(db.profiles["demo-user-id"] || {}),
    ...updates,
    updated_at: new Date().toISOString()
  };
  saveDb(db);
  return db.profiles["demo-user-id"];
}

export function getDemoResumes() {
  const db = getDb();
  return db.resumes;
}

export function getDemoResume(id: string) {
  const db = getDb();
  return db.resumes.find((r) => r.id === id);
}

export function insertDemoResume(title: string, content: any) {
  const db = getDb();
  const newResume = {
    id: String(Date.now()),
    user_id: "demo-user-id",
    title: title || "Untitled Resume",
    content: content || {
      personalInfo: { fullName: "Jayant", email: "jayant@email.com", phone: "", location: "", website: "", linkedin: "" },
      summary: "",
      experience: [],
      education: [],
      projects: [],
      skills: []
    },
    ats_score: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.resumes.unshift(newResume);
  saveDb(db);
  return newResume;
}

export function updateDemoResume(id: string, updates: { title?: string; content?: any; ats_score?: number }) {
  const db = getDb();
  const index = db.resumes.findIndex((r) => r.id === id);
  if (index === -1) return null;

  db.resumes[index] = {
    ...db.resumes[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  saveDb(db);
  return db.resumes[index];
}

export function deleteDemoResume(id: string) {
  const db = getDb();
  const initialLength = db.resumes.length;
  db.resumes = db.resumes.filter((r) => r.id !== id);
  saveDb(db);
  return db.resumes.length < initialLength;
}

export function getDemoCoverLetters() {
  const db = getDb();
  return db.coverLetters || [];
}

export function insertDemoCoverLetter(
  companyOrObj: string | { company: string; job_title: string; content: string; resume_id?: string },
  job_title?: string,
  content?: string,
  resume_id?: string | null
) {
  const db = getDb();
  let entry: { company: string; job_title: string; content: string; resume_id?: string | null };

  if (typeof companyOrObj === "object") {
    entry = companyOrObj;
  } else {
    entry = {
      company: companyOrObj,
      job_title: job_title || "",
      content: content || "",
      resume_id: resume_id || null
    };
  }

  const newLetter = {
    id: String(Date.now()),
    user_id: "demo-user-id",
    company: entry.company,
    job_title: entry.job_title,
    content: entry.content,
    resume_id: entry.resume_id || null,
    created_at: new Date().toISOString()
  };
  if (!db.coverLetters) db.coverLetters = [];
  db.coverLetters.unshift(newLetter);
  saveDb(db);
  return newLetter;
}

export function deleteDemoCoverLetter(id: string) {
  const db = getDb();
  if (!db.coverLetters) return false;
  const initialLength = db.coverLetters.length;
  db.coverLetters = db.coverLetters.filter((c: any) => c.id !== id);
  saveDb(db);
  return db.coverLetters.length < initialLength;
}
