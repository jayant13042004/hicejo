import fs from "fs";
import path from "path";

// Path to store mock database JSON file locally in the src folder
const mockDbPath = path.join(process.cwd(), "src/lib/mock-db.json");

interface MockDb {
  profiles: Record<string, any>;
  resumes: any[];
  coverLetters: any[];
}

// Safe check to determine if Supabase keys are placeholder
export function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.startsWith("https://placeholder");
}

function getDb(): MockDb {
  const dir = path.dirname(mockDbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(mockDbPath)) {
    const defaultDb: MockDb = {
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
    fs.writeFileSync(mockDbPath, JSON.stringify(defaultDb, null, 2));
    return defaultDb;
  }
  
  try {
    return JSON.parse(fs.readFileSync(mockDbPath, "utf-8"));
  } catch {
    // Return empty on error
    return { profiles: {}, resumes: [], coverLetters: [] };
  }
}

function saveDb(db: MockDb) {
  try {
    fs.writeFileSync(mockDbPath, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Failed to save mock DB file", err);
  }
}

// 1. Profiles API fallbacks
export function getDemoProfile() {
  const db = getDb();
  return db.profiles["demo-user-id"] || {
    id: "demo-user-id",
    email: "demo@hicejo.com",
    full_name: "Jayant",
    target_role: "",
    target_industry: "",
    target_salary: ""
  };
}

export function updateDemoProfile(data: any) {
  const db = getDb();
  const current = getDemoProfile();
  const updated = { ...current, ...data, updated_at: new Date().toISOString() };
  db.profiles["demo-user-id"] = updated;
  saveDb(db);
  return updated;
}

// 2. Resumes API fallbacks
export function getDemoResumes() {
  const db = getDb();
  return db.resumes;
}

export function getDemoResume(id: string) {
  const db = getDb();
  return db.resumes.find(r => r.id === id) || null;
}

export function insertDemoResume(title: string, content: any) {
  const db = getDb();
  const newResume = {
    id: crypto.randomUUID(),
    user_id: "demo-user-id",
    title,
    content,
    ats_score: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.resumes.push(newResume);
  saveDb(db);
  return newResume;
}

export function updateDemoResume(id: string, updates: any) {
  const db = getDb();
  let updatedResume = null;
  db.resumes = db.resumes.map(r => {
    if (r.id === id) {
      updatedResume = { ...r, ...updates, updated_at: new Date().toISOString() };
      return updatedResume;
    }
    return r;
  });
  saveDb(db);
  return updatedResume;
}

export function deleteDemoResume(id: string) {
  const db = getDb();
  db.resumes = db.resumes.filter(r => r.id !== id);
  saveDb(db);
  return true;
}

// 3. Cover Letters API fallbacks
export function getDemoCoverLetters() {
  const db = getDb();
  return db.coverLetters;
}

export function insertDemoCoverLetter(company: string, jobTitle: string, content: string, resumeId: string) {
  const db = getDb();
  const newLetter = {
    id: crypto.randomUUID(),
    user_id: "demo-user-id",
    resume_id: resumeId,
    job_title: jobTitle,
    company,
    content,
    created_at: new Date().toISOString()
  };
  db.coverLetters.push(newLetter);
  saveDb(db);
  return newLetter;
}

export function deleteDemoCoverLetter(id: string) {
  const db = getDb();
  db.coverLetters = db.coverLetters.filter(l => l.id !== id);
  saveDb(db);
  return true;
}
