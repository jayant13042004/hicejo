"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  UserRound,
  FileText,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Cpu,
  Palette,
  Sparkles,
  Download,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Scissors,
  Check,
  FileCheck,
  LayoutTemplate,
  Printer,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useResumeStore } from "@/store/useResumeStore";
import { Skill, FitAnalysis, ResumeDensity, formatEducationGrade } from "@/types/resume";
import { DensityController } from "@/components/builder/DensityController";
import { FitIndicatorBar } from "@/components/builder/FitIndicatorBar";
import { FitAnalysisDrawer } from "@/components/builder/FitAnalysisDrawer";
import { SmartBulletCompressorModal } from "@/components/builder/SmartBulletCompressorModal";
import { StarterTemplatesModal } from "@/components/builder/StarterTemplatesModal";
import { StarterTemplate, STARTER_TEMPLATES } from "@/data/starterTemplates";
import { ResumePerfectionBar } from "@/components/builder/ResumePerfectionBar";
import { ROLE_CURRICULA, getCuratedSkillsForRole } from "@/data/learningCurricula";

// 5 Curated ATS Typography Styles
const fontClassMap: Record<string, string> = {
  "font-sans": "font-sans",
  "font-serif": "font-serif font-[Merriweather,Georgia,serif]",
  "font-mono": "font-sans font-[Inter,Calibri,Arial,system-ui,sans-serif]",
  "font-executive": "font-[Garamond,Georgia,serif]",
  "font-geometric": "font-[Outfit,system-ui,sans-serif]"
};

// Safe date range formatter: avoids empty date columns or trailing dashes.
// Prioritizes explicitly typed dates (e.g. "2026") so typed graduation or end dates are never overwritten by "Present".
function formatSafeDateRange(startDate?: string, endDate?: string, current?: boolean): string | null {
  const start = (startDate || "").trim();
  const rawEnd = (endDate || "").trim();
  const end = rawEnd || (current ? "Present" : "");
  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  if (end) return end;
  return null;
}

// Clean title/subtitle separator helper: prevents dangling em-dashes/hyphens when one side is missing
function renderTitleWithSubtitle(title?: string, subtitle?: string, separator = "—"): string {
  const cleanTitle = (title || "").trim().replace(/[\s—–-]+$/, "");
  const cleanSubtitle = (subtitle || "").trim().replace(/^[\s—–-]+/, "");
  if (cleanTitle && cleanSubtitle) {
    return `${cleanTitle} ${separator} ${cleanSubtitle}`;
  }
  return cleanTitle || cleanSubtitle || "";
}

// 5 Text Scale Levels
const fontSizeMap: Record<string, string> = {
  "xs": "text-[11.5px] leading-snug",
  "sm": "text-[12.5px] leading-snug",
  "md": "text-[14px] leading-normal",
  "lg": "text-[15px] leading-relaxed",
  "xl": "text-[16.5px] leading-relaxed"
};

function ResumeBuilderContent() {
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("id");
  const isAllFixed = searchParams.get("fixed") === "all";
  const [showAllFixedBanner, setShowAllFixedBanner] = React.useState(false);

  React.useEffect(() => {
    if (isAllFixed) {
      setShowAllFixedBanner(true);
    }
  }, [isAllFixed]);

  const {
    id,
    title,
    data,
    saveState,
    loadResume,
    importResumeData,
    setResumeId,
    setTitle,
    setSaveState,
    updatePersonalInfo,
    updateSummary,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addProject,
    updateProject,
    removeProject,
    addSkill,
    updateSkill,
    removeSkill,
    updateDesignSettings,
    setDensity,
    applyCompressedBullet,
    undo,
    redo,
    past,
    future,
    activeJobContext,
    careerProfile,
    pendingImprovement,
    setPendingImprovement,
  } = useResumeStore();

  const [activeTab, setActiveTab] = React.useState<
    "personal" | "summary" | "experience" | "education" | "projects" | "skills" | "design"
  >("personal");

  const [mobileViewMode, setMobileViewMode] = React.useState<"editor" | "preview">("editor");

  const [enhancingId, setEnhancingId] = React.useState<string | null>(null);
  const [newSkillName, setNewSkillName] = React.useState("");
  const [newSkillCategory, setNewSkillCategory] = React.useState("");

  // Download PDF Modal state
  const [isDownloadModalOpen, setIsDownloadModalOpen] = React.useState(false);
  const [downloadFileName, setDownloadFileName] = React.useState("");
  const [isDownloadingPDF, setIsDownloadingPDF] = React.useState(false);

  // Starter Templates Modal state
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = React.useState(false);

  // Import Modal states
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [importTab, setImportTab] = React.useState<"text" | "portfolio">("text");
  const [importRawText, setImportRawText] = React.useState("");
  const [portfolioResumes, setPortfolioResumes] = React.useState<any[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);
  const [parseStage, setParseStage] = React.useState<string>("");
  const [importError, setImportError] = React.useState<string | null>(null);

  // Smart Bullet Compressor Modal states
  const [compressorState, setCompressorState] = React.useState<{
    isOpen: boolean;
    bulletText: string;
    itemId: string;
    itemType: "experience" | "projects";
  }>({
    isOpen: false,
    bulletText: "",
    itemId: "",
    itemType: "experience"
  });

  const templateParam = searchParams.get("template");

  // Fetch initial resume draft or hydrate starter template
  React.useEffect(() => {
    const fetchResume = async () => {
      // 1. If a template query param was passed, hydrate that starter template immediately
      if (templateParam) {
        const foundTemplate = STARTER_TEMPLATES.find((t) => t.id === templateParam);
        if (foundTemplate) {
          setTitle(foundTemplate.name);
          importResumeData(foundTemplate.data);
          return;
        }
      }

      if (!resumeIdParam) {
        // Preserve in-memory draft if already loaded (e.g. from Tailor or ongoing work)
        if (data.personalInfo.fullName || data.experience.length > 0 || data.skills.length > 0) {
          return;
        }
        loadResume(null, "Untitled Resume", {
          personalInfo: { fullName: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "" },
          summary: "",
          experience: [],
          education: [],
          projects: [],
          skills: [],
          design: {
            fontFamily: "font-sans",
            fontSize: "md",
            sectionOrder: ["summary", "experience", "projects", "education", "skills"],
            density: "normal",
            sectionSpacing: 1.0,
            itemSpacing: 1.0,
            lineHeight: 1.4
          }
        });

        // Prompt first-time users with template choices instead of an intimidating blank canvas
        const hasPrompted = sessionStorage.getItem("hicejo_template_prompted");
        if (!hasPrompted) {
          sessionStorage.setItem("hicejo_template_prompted", "true");
          setIsTemplatesModalOpen(true);
        }
        return;
      }

      try {
        const res = await fetch(`/api/resume/${resumeIdParam}`);
        const result = await res.json();
        if (result.success && result.data) {
          loadResume(result.data.id, result.data.title, result.data.content);
        }
      } catch (err) {
        console.error("Failed to load resume draft", err);
      }
    };
    fetchResume();
  }, [resumeIdParam, templateParam, loadResume, importResumeData]);

  // Auto-switch to target section if an improvement recommendation was passed
  React.useEffect(() => {
    if (pendingImprovement?.targetSection) {
      setActiveTab(pendingImprovement.targetSection as any);
    }
  }, [pendingImprovement]);

  // Debounced Auto-save to cloud DB
  React.useEffect(() => {
    if (saveState !== "typing") return;

    const timer = setTimeout(async () => {
      setSaveState("saving");
      try {
        const endpoint = id ? `/api/resume/${id}` : "/api/resume";
        const method = id ? "PUT" : "POST";

        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim() || "Untitled Resume",
            content: data
          })
        });
        const result = await res.json();

        if (result.success && result.data) {
          if (!id) {
            setResumeId(result.data.id);
            const newUrl = `${window.location.pathname}?id=${result.data.id}`;
            window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
          }
          setSaveState("saved");
        } else {
          console.error("Auto-save server response:", result.error);
          setSaveState("error");
        }
      } catch (err) {
        console.error("Auto-save network error:", err);
        setSaveState("error");
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [data, title, id, saveState, setResumeId, setSaveState]);

  // One-Page Fit Analysis & Auto-Optimizer states
  const [fitAnalysis, setFitAnalysis] = React.useState<FitAnalysis>({
    status: "fits",
    pageCount: 1,
    utilizationPercentage: 88,
    overflowLines: 0,
    overflowPercentage: 0,
    contentHeightPx: 1000,
    targetPageHeightPx: 1123,
    readabilityGrade: "Excellent",
    atsSafetyGrade: "Excellent",
    contentDensity: "Optimal",
    recommendedAction: "Your resume cleanly fits on a single page."
  });
  const [isFitDrawerOpen, setIsFitDrawerOpen] = React.useState(false);
  const [isAutoFitting, setIsAutoFitting] = React.useState(false);
  const [autoFitNotification, setAutoFitNotification] = React.useState<string | null>(null);

  // Real-time calculation of page fit and line overflow
  const calculateFit = React.useCallback(() => {
    const resumeEl = document.getElementById("resume-print-area");
    if (!resumeEl) return;

    const targetHeight = Math.round(resumeEl.offsetWidth * (297 / 210)) || 1123;
    
    // Accurately measure actual rendered content bottom to detect trailing blank space
    const sections = resumeEl.querySelectorAll(".section-item");
    const lastSection = sections[sections.length - 1] as HTMLElement;
    let actualContentHeight = 0;
    if (lastSection) {
      const resumeRect = resumeEl.getBoundingClientRect();
      const lastRect = lastSection.getBoundingClientRect();
      actualContentHeight = Math.round(lastRect.bottom - resumeRect.top + 30);
    } else {
      actualContentHeight = resumeEl.scrollHeight;
    }

    const isOverflowing = resumeEl.scrollHeight > targetHeight + 6;
    const diff = resumeEl.scrollHeight - targetHeight;
    const overflowLines = isOverflowing ? Math.max(1, Math.round(diff / 22)) : 0;
    
    // Utilization based on real content position
    const utilization = isOverflowing
      ? 100
      : Math.min(100, Math.max(15, Math.round((actualContentHeight / targetHeight) * 100)));

    let status: FitAnalysis["status"] = "fits";
    if (isOverflowing) {
      status = "overflowing";
    } else if (utilization >= 92 || data.design?.balancePageHeight) {
      status = "perfect";
    } else {
      status = "underutilized";
    }

    const currentDensity = data.design?.density || "normal";
    const densityMap: Record<ResumeDensity, FitAnalysis["contentDensity"]> = {
      relaxed: "Relaxed",
      normal: "Optimal",
      compact: "Compact",
      "ultra-compact": "Dense"
    };

    setFitAnalysis({
      status,
      pageCount: isOverflowing ? 2 : 1,
      utilizationPercentage: data.design?.balancePageHeight ? 100 : utilization,
      overflowLines,
      overflowPercentage: isOverflowing ? Math.round((diff / targetHeight) * 100) : 0,
      contentHeightPx: actualContentHeight,
      targetPageHeightPx: targetHeight,
      readabilityGrade: data.design?.fontSize === "xs" ? "Tight" : "Excellent",
      atsSafetyGrade: "Excellent",
      contentDensity: densityMap[currentDensity] || "Optimal",
      recommendedAction: isOverflowing
        ? `${overflowLines} line${overflowLines === 1 ? "" : "s"} overflowing. Click "Fix to 1 Page" to auto-fit.`
        : utilization < 90
        ? `Resume uses ${utilization}% of page. Click "Fill 1 Page (100%)" to eliminate bottom white space.`
        : "Resume fits cleanly on a single page."
    });
  }, [data]);

  React.useEffect(() => {
    const timer = setTimeout(calculateFit, 150);
    window.addEventListener("resize", calculateFit);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateFit);
    };
  }, [calculateFit]);

  // Robust Multi-Stage Auto-Fit Solver
  const handleMultiStageAutoFit = async () => {
    setIsAutoFitting(true);
    const resumeEl = document.getElementById("resume-print-area");
    if (!resumeEl) {
      setIsAutoFitting(false);
      return;
    }

    const targetHeight = Math.round(resumeEl.offsetWidth * (297 / 210)) || 1123;
    const initialOverflow = resumeEl.scrollHeight - targetHeight;

    if (initialOverflow <= 6) {
      setAutoFitNotification("Your resume already fits cleanly on 1 page!");
      setIsAutoFitting(false);
      return;
    }

    const currentDensity = data.design?.density || "normal";
    const currentFontSize = data.design?.fontSize || "md";
    const changes: string[] = [];

    // Stage 1: Spacing & Density progression (relaxed -> normal -> compact -> ultra-compact)
    let nextDensity: ResumeDensity = currentDensity;
    if (currentDensity === "relaxed") {
      nextDensity = "normal";
      changes.push("Density: Relaxed → Normal");
    } else if (currentDensity === "normal") {
      nextDensity = "compact";
      changes.push("Density: Normal → Compact");
    } else if (currentDensity === "compact") {
      nextDensity = "ultra-compact";
      changes.push("Density: Compact → Ultra-compact");
    }

    if (nextDensity !== currentDensity) {
      setDensity(nextDensity);
      await new Promise((r) => setTimeout(r, 150));
    }

    // Check if solved after density adjustment
    let currentHeight = resumeEl.scrollHeight;
    if (currentHeight > targetHeight + 6) {
      // Stage 2: Typography scale adjustment (xl -> lg -> md -> sm)
      let nextFontSize = currentFontSize;
      if (currentFontSize === "xl") {
        nextFontSize = "lg";
        changes.push("Font Scale: Spacious → Medium");
      } else if (currentFontSize === "lg") {
        nextFontSize = "md";
        changes.push("Font Scale: Medium → Standard");
      } else if (currentFontSize === "md") {
        nextFontSize = "sm";
        changes.push("Font Scale: Standard → Small");
      }

      if (nextFontSize !== currentFontSize) {
        updateDesignSettings({ fontSize: nextFontSize });
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    // Check if further density compaction needed
    currentHeight = resumeEl.scrollHeight;
    if (currentHeight > targetHeight + 6 && nextDensity === "normal") {
      setDensity("compact");
      changes.push("Density: Normal → Compact");
      await new Promise((r) => setTimeout(r, 150));
    }

    calculateFit();
    setIsAutoFitting(false);

    const finalDiff = resumeEl.scrollHeight - targetHeight;
    if (finalDiff <= 6) {
      setAutoFitNotification(
        `✨ Solved! ${changes.join(" • ")}. Your resume now fits cleanly on 1 page.`
      );
    } else {
      const remainingLines = Math.max(1, Math.round(finalDiff / 22));
      setAutoFitNotification(
        `Applied: ${changes.join(" • ")}. Still ${remainingLines} line${remainingLines === 1 ? "" : "s"} over — open the Fit Audit below to compress verbose bullets.`
      );
      setIsFitDrawerOpen(true);
    }
  };

  // Expand Underfilled Resume to 100% of Single Page (Eliminating Bottom White Space)
  const handleExpandToFillPage = async () => {
    const resumeEl = document.getElementById("resume-print-area");
    if (!resumeEl) return;

    setIsAutoFitting(true);
    const targetHeight = Math.round(resumeEl.offsetWidth * (297 / 210)) || 1123;
    const currentDensity = data.design?.density || "normal";
    const currentFontSize = data.design?.fontSize || "md";
    const changes: string[] = [];

    const getActualHeight = () => {
      const sections = resumeEl.querySelectorAll(".section-item");
      const lastSection = sections[sections.length - 1] as HTMLElement;
      if (lastSection) {
        const resumeRect = resumeEl.getBoundingClientRect();
        const lastRect = lastSection.getBoundingClientRect();
        return Math.round(lastRect.bottom - resumeRect.top + 30);
      }
      return resumeEl.scrollHeight;
    };

    let actualHeight = getActualHeight();

    // Stage 1: Expand Density (ultra-compact -> compact -> normal -> relaxed)
    let nextDensity: ResumeDensity = currentDensity;
    if (currentDensity === "ultra-compact") {
      nextDensity = "compact";
      changes.push("Density: Compact");
    } else if (currentDensity === "compact") {
      nextDensity = "normal";
      changes.push("Density: Normal");
    } else if (currentDensity === "normal" && actualHeight < targetHeight - 80) {
      nextDensity = "relaxed";
      changes.push("Density: Relaxed");
    }

    if (nextDensity !== currentDensity) {
      setDensity(nextDensity);
      await new Promise((r) => setTimeout(r, 120));
    }

    // Stage 2: Typography Scale (sm -> md -> lg)
    actualHeight = getActualHeight();
    if (actualHeight < targetHeight - 70) {
      let nextFontSize = currentFontSize;
      if (currentFontSize === "xs") {
        nextFontSize = "sm";
        changes.push("Font: Standard");
      } else if (currentFontSize === "sm") {
        nextFontSize = "md";
        changes.push("Font: Medium");
      } else if (currentFontSize === "md" && actualHeight < targetHeight - 120) {
        nextFontSize = "lg";
        changes.push("Font: Large");
      }

      if (nextFontSize !== currentFontSize) {
        updateDesignSettings({ fontSize: nextFontSize });
        await new Promise((r) => setTimeout(r, 120));
      }
    }

    // Stage 3: Section Spacing & Edge-to-Edge Page Balancing
    const currentSectionSpacing = data.design?.sectionSpacing || 1.0;
    const nextSpacing = Math.min(1.5, Number((currentSectionSpacing + 0.2).toFixed(2)));
    
    updateDesignSettings({
      sectionSpacing: nextSpacing,
      balancePageHeight: true
    });
    changes.push("100% Page Balance (Zero White Space)");
    await new Promise((r) => setTimeout(r, 120));

    // Safety rollback check: if pushed past targetHeight + 6, back off slightly
    if (resumeEl.scrollHeight > targetHeight + 6) {
      updateDesignSettings({
        sectionSpacing: Math.max(1.0, Number((nextSpacing - 0.2).toFixed(2))),
        balancePageHeight: false
      });
      await new Promise((r) => setTimeout(r, 120));
    }

    calculateFit();
    setIsAutoFitting(false);

    setAutoFitNotification(
      `✨ 100% Page Balance Applied: ${changes.join(" • ") || "Spacing scaled"}. Trailing white space eliminated!`
    );
  };

  // Native Searchable/Vector PDF Trigger (100% Vector Text for ATS Parsers)
  const handleExecutePrintPDF = () => {
    setIsDownloadModalOpen(false);
    const originalTitle = document.title;
    const cleanFileName = (downloadFileName.trim() || title || "Resume").replace(/[^a-zA-Z0-9_\-\s]/g, "");
    document.title = cleanFileName;

    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 250);
  };

  // Open Download Modal and prefill name
  const handleOpenDownloadModal = () => {
    const defaultName = (data.personalInfo.fullName || title || "Resume")
      .trim()
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .replace(/\s+/g, "_");
    setDownloadFileName(`${defaultName}_Resume`);
    setIsDownloadModalOpen(true);
  };

  // Direct 1-Click High-Quality PDF Download (100% Reliable, Saves Directly to User Downloads)
  const handleExecutePDFDownload = async () => {
    const resumeEl = document.getElementById("resume-print-area");
    if (!resumeEl) return;

    setIsDownloadingPDF(true);
    try {
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      // Temporarily clear box shadow and border for clean print raster
      const prevShadow = resumeEl.style.boxShadow;
      const prevBorder = resumeEl.style.border;
      resumeEl.style.boxShadow = "none";
      resumeEl.style.border = "none";

      const dataUrl = await toPng(resumeEl, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: (node: HTMLElement) => {
          if (node.classList && (node.classList.contains("no-print") || node.hasAttribute("data-no-print"))) {
            return false;
          }
          return true;
        }
      });

      // Restore original styling
      resumeEl.style.boxShadow = prevShadow;
      resumeEl.style.border = prevBorder;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      // Exact A4 dimensions: 210mm x 297mm
      pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297, undefined, "FAST");

      // Embed interactive, clickable hyperlink annotations over every <a> tag in the resume
      try {
        const resumeRect = resumeEl.getBoundingClientRect();
        if (resumeRect.width > 0 && resumeRect.height > 0) {
          const anchors = resumeEl.querySelectorAll<HTMLAnchorElement>("a[href]");
          anchors.forEach((a) => {
            let href = a.getAttribute("href") || a.href;
            if (!href || href === "#" || href.trim() === "") return;

            // Normalize protocol
            if (
              !href.startsWith("http://") &&
              !href.startsWith("https://") &&
              !href.startsWith("mailto:") &&
              !href.startsWith("tel:")
            ) {
              href = `https://${href}`;
            }

            const rect = a.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              // Exact coordinate mapping to A4 dimensions (210mm x 297mm)
              const x = ((rect.left - resumeRect.left) / resumeRect.width) * 210;
              const y = ((rect.top - resumeRect.top) / resumeRect.height) * 297;
              const w = (rect.width / resumeRect.width) * 210;
              const h = (rect.height / resumeRect.height) * 297;

              // Generous 0.5mm hit target padding for easy clicking in PDF viewers
              const pad = 0.5;
              const safeX = Math.max(0, x - pad);
              const safeY = Math.max(0, y - pad);
              const safeW = Math.min(210 - safeX, w + pad * 2);
              const safeH = Math.min(297 - safeY, h + pad * 2);

              pdf.link(safeX, safeY, safeW, safeH, { url: href });
            }
          });
        }
      } catch (linkErr) {
        console.warn("Could not embed PDF hyperlink annotations:", linkErr);
      }

      // Embed searchable, ATS-compliant text layer for ATS parsers and text extraction
      try {
        const rawText = resumeEl.innerText || "";
        if (rawText.trim()) {
          const lines = pdf.splitTextToSize(rawText.trim(), 190);
          pdf.text(lines, 10, 10, { renderingMode: "invisible" });
        }
      } catch {
        // Non-blocking if invisible text embedding has browser constraints
      }

      const defaultName = (data.personalInfo.fullName || title || "Resume")
        .trim()
        .replace(/[^a-zA-Z0-9_\-\s]/g, "")
        .replace(/\s+/g, "_");
      const cleanName = (downloadFileName.trim() || defaultName || "Resume").replace(/[^a-zA-Z0-9_\-\s]/g, "");

      pdf.save(`${cleanName || "Resume"}.pdf`);
      setIsDownloadModalOpen(false);
      setAutoFitNotification("✨ Resume PDF downloaded directly to your downloads folder!");
    } catch (err: any) {
      console.warn("Direct html-to-image render encountered error, trying fallback canvas:", err);
      try {
        const html2canvas = (await import("html2canvas")).default;
        const { jsPDF } = await import("jspdf");
        const canvas = await html2canvas(resumeEl, { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

        // Embed interactive, clickable hyperlink annotations over every <a> tag in the resume
        try {
          const resumeRect = resumeEl.getBoundingClientRect();
          if (resumeRect.width > 0 && resumeRect.height > 0) {
            const anchors = resumeEl.querySelectorAll<HTMLAnchorElement>("a[href]");
            anchors.forEach((a) => {
              let href = a.getAttribute("href") || a.href;
              if (!href || href === "#" || href.trim() === "") return;

              if (
                !href.startsWith("http://") &&
                !href.startsWith("https://") &&
                !href.startsWith("mailto:") &&
                !href.startsWith("tel:")
              ) {
                href = `https://${href}`;
              }

              const rect = a.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                const x = ((rect.left - resumeRect.left) / resumeRect.width) * 210;
                const y = ((rect.top - resumeRect.top) / resumeRect.height) * 297;
                const w = (rect.width / resumeRect.width) * 210;
                const h = (rect.height / resumeRect.height) * 297;

                const pad = 0.5;
                const safeX = Math.max(0, x - pad);
                const safeY = Math.max(0, y - pad);
                const safeW = Math.min(210 - safeX, w + pad * 2);
                const safeH = Math.min(297 - safeY, h + pad * 2);

                pdf.link(safeX, safeY, safeW, safeH, { url: href });
              }
            });
          }
        } catch (linkErr) {
          console.warn("Could not embed PDF hyperlink annotations:", linkErr);
        }

        try {
          const rawText = resumeEl.innerText || "";
          if (rawText.trim()) {
            const lines = pdf.splitTextToSize(rawText.trim(), 190);
            pdf.text(lines, 10, 10, { renderingMode: "invisible" });
          }
        } catch {
          // Non-blocking fallback
        }
        const defaultName = (data.personalInfo.fullName || title || "Resume").trim().replace(/[^a-zA-Z0-9_\-\s]/g, "").replace(/\s+/g, "_");
        const cleanName = (downloadFileName.trim() || defaultName || "Resume").replace(/[^a-zA-Z0-9_\-\s]/g, "");
        pdf.save(`${cleanName || "Resume"}.pdf`);
        setIsDownloadModalOpen(false);
        setAutoFitNotification("✨ Resume PDF downloaded directly to your downloads folder!");
      } catch (fallbackErr) {
        console.error("PDF download failed completely:", fallbackErr);
        alert("Direct PDF export encountered an error in this browser. Please try again.");
      }
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // AI Bullet Enhancer endpoint trigger (Google XYZ format)
  const handleEnhanceBullet = async (itemId: string, text: string, itemType: "experience" | "projects") => {
    if (!text || text.trim() === "") return;
    setEnhancingId(itemId);

    try {
      const targetRoleName = careerProfile?.targetRole || activeJobContext?.jobTitle || "Software Engineer";
      const res = await fetch("/api/ai/enhance-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletText: text,
          jobTitle: targetRoleName
        })
      });
      const result = await res.json();
      if (result.success && result.data?.enhanced) {
        if (itemType === "experience") {
          updateExperience(itemId, { description: result.data.enhanced });
        } else {
          updateProject(itemId, { description: result.data.enhanced });
        }
        setAutoFitNotification("✨ Bullets formatted with Google XYZ format! Use Undo (Ctrl+Z) if you prefer original.");
      }
    } catch (err) {
      console.error("Failed to enhance bullet", err);
    } finally {
      setEnhancingId(null);
    }
  };

  // AI Summary Polish
  const handleEnhanceSummary = async () => {
    if (!data.summary || data.summary.trim() === "") return;
    setEnhancingId("summary");

    try {
      const targetRoleName = careerProfile?.targetRole || activeJobContext?.jobTitle || "Software Engineer";
      const res = await fetch("/api/ai/enhance-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletText: data.summary,
          jobTitle: targetRoleName
        })
      });
      const result = await res.json();
      if (result.success && result.data?.enhanced) {
        // Strip bullet prefix if added
        const cleanedSummary = result.data.enhanced.replace(/^•\s*/, "");
        updateSummary(cleanedSummary);
        setAutoFitNotification("✨ Summary polished into a concise, high-impact professional overview!");
      }
    } catch (err) {
      console.error("Failed to polish summary", err);
    } finally {
      setEnhancingId(null);
    }
  };

  // 1-Click Genuine Recommended Skills for Target Role
  const handleAddRecommendedSkills = () => {
    const rawTarget = (careerProfile?.targetRole || activeJobContext?.jobTitle || "Software Engineer").trim();
    
    // Get curated, genuine, unshortened resume skills specifically for this role
    const curatedList = getCuratedSkillsForRole(rawTarget);

    const toAdd: { name: string; category: string }[] = [];
    curatedList.forEach((sk) => {
      const cleanName = sk.name.trim();
      if (
        cleanName.length > 1 &&
        !data.skills.some((existing) => existing.name.toLowerCase() === cleanName.toLowerCase())
      ) {
        toAdd.push({
          name: cleanName,
          category: sk.category || "Technical Skills"
        });
      }
    });

    // Add top verified skills for this role
    const skillsToInject = toAdd.slice(0, 10);
    skillsToInject.forEach((sk) => {
      addSkill(sk.name, sk.category);
    });

    if (skillsToInject.length > 0) {
      setAutoFitNotification(`✨ Added ${skillsToInject.length} verified essential skills for ${rawTarget}!`);
    } else {
      setAutoFitNotification(`✓ All essential skills for ${rawTarget} are already on your resume!`);
    }
  };

  // Group skills by category
  const groupedSkills = React.useMemo(() => {
    const map: Record<string, Skill[]> = {};
    data.skills.forEach((sk) => {
      const cat = sk.category?.trim() || "Technical Skills";
      if (!map[cat]) map[cat] = [];
      map[cat].push(sk);
    });
    return map;
  }, [data.skills]);

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    addSkill(newSkillName.trim(), newSkillCategory.trim() || "Technical Skills");
    setNewSkillName("");
  };

  // Section Ordering handlers
  const handleMoveUp = (index: number) => {
    const list = [...(data.design?.sectionOrder || ["summary", "experience", "projects", "education", "skills"])];
    if (index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      updateDesignSettings({ sectionOrder: list });
    }
  };

  const handleMoveDown = (index: number) => {
    const list = [...(data.design?.sectionOrder || ["summary", "experience", "projects", "education", "skills"])];
    if (index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      updateDesignSettings({ sectionOrder: list });
    }
  };

  // Automated AI Resume Parser & Importer
  const executeAIParsing = async (textToParse: string) => {
    const cleanText = textToParse.trim();
    if (!cleanText) {
      setImportError("Please provide resume text or upload a document to extract.");
      return;
    }
    setIsParsing(true);
    setParseStage("Analyzing resume & extracting all sections with AI...");
    setImportError(null);
    try {
      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: cleanText,
          rawText: cleanText
        })
      });
      const result = await res.json();
      if (result.success && result.data) {
        importResumeData(result.data);
        if (result.data.personalInfo?.fullName && (!title || title === "Untitled Resume")) {
          setTitle(`${result.data.personalInfo.fullName}'s Resume`);
        }
        setIsImportModalOpen(false);
        setImportRawText("");
        const expCount = result.data.experience?.length || 0;
        const projCount = result.data.projects?.length || 0;
        const eduCount = result.data.education?.length || 0;
        const skillsCount = result.data.skills?.length || 0;
        setAutoFitNotification(
          `✓ All information extracted! Loaded ${expCount} work experiences, ${projCount} projects, ${eduCount} education items, and ${skillsCount} skills. You can now edit each section.`
        );
      } else {
        setImportError(result.error || "Failed to extract resume structure.");
      }
    } catch {
      setImportError("Server connection failed during AI parsing.");
    } finally {
      setIsParsing(false);
      setParseStage("");
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsParsing(true);
    setParseStage("Step 1/2: Reading document text...");
    setImportError(null);
    try {
      const fData = new FormData();
      fData.append("file", file);
      const parseRes = await fetch("/api/parse-file", {
        method: "POST",
        body: fData
      });
      const parseData = await parseRes.json();
      if (parseData.success && parseData.text) {
        setImportRawText(parseData.text);
        setParseStage("Step 2/2: Structuring all details with AI into your resume...");
        await executeAIParsing(parseData.text);
      } else {
        setImportError(parseData.error || "Failed to extract text from file.");
        setIsParsing(false);
        setParseStage("");
      }
    } catch {
      setImportError("File upload extraction failed. You can paste the text directly.");
      setIsParsing(false);
      setParseStage("");
    }
  };

  // Compute live spacing multiplier styles based on density
  const sectionSpacingMultiplier = data.design?.sectionSpacing || 1.0;
  const itemSpacingMultiplier = data.design?.itemSpacing || 1.0;
  const lineHeightMultiplier = data.design?.lineHeight || 1.4;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* Top Action Header */}
      <header className="h-16 border-b border-border/40 bg-card px-6 flex items-center justify-between shrink-0 no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
          <div className="h-5 w-[1px] bg-border/60 mx-1" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Resume"
            className="text-lg font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5 rounded transition-colors"
          />
          {/* Cloud Auto-save state pill */}
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
            {saveState === "saving" && (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Saving draft...</span>
              </>
            )}
            {saveState === "saved" && (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Saved to cloud</span>
              </>
            )}
            {saveState === "typing" && (
              <>
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Unsaved changes</span>
              </>
            )}
            {saveState === "error" && (
              <>
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <span>Auto-save failed</span>
              </>
            )}
          </span>
        </div>

        {/* Target Role Badge if Set */}
        {(careerProfile?.targetRole || activeJobContext?.jobTitle) && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs">
            <span className="text-primary font-bold">🎯</span>
            <span className="font-semibold text-foreground truncate max-w-[220px]" title={careerProfile?.targetRole || activeJobContext?.jobTitle}>
              {careerProfile?.targetRole || activeJobContext?.jobTitle}
            </span>
            <Link
              href="/dashboard/jobs"
              className="text-[10px] text-primary hover:underline ml-1 font-bold"
              title="View Target Requirements & Skill Gaps"
            >
              Gaps &rarr;
            </Link>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* History Controls */}
          <div className="flex items-center bg-muted p-1 rounded-lg mr-2 border border-border/40">
            <button
              onClick={undo}
              disabled={past.length === 0}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm("Start a new blank resume from scratch?")) {
                loadResume(null, "Untitled Resume", {
                  personalInfo: { fullName: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "" },
                  summary: "",
                  experience: [],
                  education: [],
                  projects: [],
                  skills: [],
                  design: {
                    fontFamily: "font-sans",
                    fontSize: "md",
                    sectionOrder: ["summary", "experience", "projects", "education", "skills"],
                    density: "normal",
                    sectionSpacing: 1.0,
                    itemSpacing: 1.0,
                    lineHeight: 1.4
                  }
                });
                window.history.replaceState({}, "", "/dashboard/builder");
              }
            }}
            className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            title="Create a new blank resume from scratch"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Blank</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTemplatesModalOpen(true)}
            className="gap-1.5 text-xs font-semibold border-primary/30 hover:border-primary text-foreground"
          >
            <LayoutTemplate className="h-3.5 w-3.5 text-primary" />
            <span>Templates</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import Resume</span>
          </Button>

          <Button
            size="sm"
            onClick={handleExecutePDFDownload}
            disabled={isDownloadingPDF}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
            title="Directly download PDF to your computer"
          >
            {isDownloadingPDF ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Pending Improvement Action Bar (Slim & Non-Intrusive) */}
      {pendingImprovement && (
        <div className="bg-primary/10 border-b border-primary/20 px-6 py-2 flex items-center justify-between gap-4 text-xs no-print shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-primary font-bold">⚡</span>
            <span className="font-semibold text-foreground truncate">
              {pendingImprovement.title}:
            </span>
            <span className="text-muted-foreground truncate hidden sm:inline">
              {pendingImprovement.description || pendingImprovement.details}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              className="h-6.5 text-[11px] font-semibold gap-1 px-2.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                setActiveTab(pendingImprovement.targetSection as any);
                setMobileViewMode("editor");
              }}
            >
              <span>Edit {pendingImprovement.targetSection}</span>
            </Button>
            <button
              onClick={() => setPendingImprovement(null)}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Real-Time Resume Perfection & ATS Readiness Checklist Bar */}
      <ResumePerfectionBar
        data={data}
        fitAnalysis={fitAnalysis}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setMobileViewMode("editor");
        }}
        onAutoFit={handleMultiStageAutoFit}
        targetRole={careerProfile?.targetRole || activeJobContext?.jobTitle}
      />

      {/* Mobile Mode Switcher Bar */}
      <div className="flex md:hidden items-center justify-center p-2 bg-muted/60 border-b border-border/60 gap-2 no-print shrink-0">
        <button
          type="button"
          onClick={() => setMobileViewMode("editor")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mobileViewMode === "editor"
              ? "bg-card text-primary shadow-xs border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ✏️ Edit Form
        </button>
        <button
          type="button"
          onClick={() => setMobileViewMode("preview")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mobileViewMode === "preview"
              ? "bg-card text-primary shadow-xs border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          📄 Live Preview
        </button>
      </div>

      {/* Main Split Interface */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Form Editor Panel */}
        <div className={`w-full md:w-1/2 flex-col border-r border-border/40 bg-card/40 h-full no-print ${mobileViewMode === "editor" ? "flex" : "hidden md:flex"}`}>
          {/* Navigation Form Tabs */}
          <div className="flex items-center gap-1.5 p-2 bg-muted/20 border-b border-border/40 overflow-x-auto text-xs font-medium shrink-0">
            {[
              { id: "personal", label: "Contact", icon: UserRound },
              { id: "summary", label: "Summary", icon: FileText },
              { id: "experience", label: "Work History", icon: Briefcase },
              { id: "education", label: "Education", icon: GraduationCap },
              { id: "projects", label: "Projects", icon: FolderGit2 },
              { id: "skills", label: "Skills", icon: Cpu },
              { id: "design", label: "Design & Density", icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-background shadow-xs text-foreground font-semibold border border-border/70"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Tab Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Contact Info Tab */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Personal Contact Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Your Full Name"
                    value={data.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                  />
                  <Input
                    label="Email Address"
                    placeholder="you@example.com"
                    value={data.personalInfo.email}
                    onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="(555) 123-4567"
                    value={data.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                  />
                  <Input
                    label="Location (City, State)"
                    placeholder="City, State"
                    value={data.personalInfo.location}
                    onChange={(e) => updatePersonalInfo({ location: e.target.value })}
                  />
                  <Input
                    label="Personal Website Portfolio"
                    placeholder="https://yourportfolio.com"
                    value={data.personalInfo.website}
                    onChange={(e) => updatePersonalInfo({ website: e.target.value })}
                  />
                  <Input
                    label="LinkedIn Profile Link"
                    placeholder="https://linkedin.com/in/yourusername"
                    value={data.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
                  />
                  <Input
                    label="GitHub Profile Link"
                    placeholder="https://github.com/yourusername"
                    value={data.personalInfo.github || ""}
                    onChange={(e) => updatePersonalInfo({ github: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Professional Summary Tab */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Professional Summary</h3>
                    <p className="text-[11px] text-muted-foreground">Recommended: 2–4 concise lines highlighting target role and core engineering strengths.</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {data.summary && data.summary.length > 200 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setCompressorState({
                          isOpen: true,
                          bulletText: data.summary,
                          itemId: "summary",
                          itemType: "experience"
                        })}
                        className="text-xs h-7 px-2.5 gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <Scissors className="h-3 w-3" />
                        <span>Compress</span>
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleEnhanceSummary}
                      disabled={enhancingId === "summary" || !data.summary}
                      className="text-xs h-7 px-2.5 gap-1.5 border-primary/40 text-primary hover:bg-primary/10 font-semibold"
                      title="Refines summary into a crisp, high-impact professional overview"
                    >
                      {enhancingId === "summary" ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                          <span>Polishing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 text-primary" />
                          <span>✨ Polish Summary</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <textarea
                  rows={7}
                  placeholder="Senior Software Engineer with 4+ years of experience designing high-throughput distributed systems in TypeScript, Next.js, and Node.js. Track record of reducing API latency and leading cross-functional squads to ship mission-critical cloud applications."
                  value={data.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-all resize-none leading-relaxed"
                />
                <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                  <span>Character count: {data.summary?.length || 0} (50–350 is optimal)</span>
                  {data.summary && data.summary.length > 450 && (
                    <span className="text-amber-500 font-medium">⚠️ Slightly verbose. Keep under 4 lines for best ATS readability.</span>
                  )}
                </div>
              </div>
            )}

            {/* Work History Tab */}
            {activeTab === "experience" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Work History</h3>
                  <Button size="sm" onClick={addExperience} className="gap-1.5 h-8 font-semibold">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Experience</span>
                  </Button>
                </div>

                <div className="space-y-6">
                  {data.experience.map((exp, index) => (
                    <Card key={exp.id} className="border border-border/70 overflow-hidden bg-card/60 shadow-2xs">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/50 text-xs">
                        <span className="font-semibold text-foreground truncate">
                          {exp.position || exp.company ? `${exp.position || "Position"}${exp.company ? ` at ${exp.company}` : ""}` : `Role #${index + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-destructive/10"
                          title="Remove experience"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                      
                      <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Company Name"
                            placeholder="Stripe"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                          />
                          <Input
                            label="Job Position Title"
                            placeholder="Senior Software Engineer"
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                          />
                          <Input
                            label="Office Location"
                            placeholder="San Francisco, CA"
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label="Start Date"
                              placeholder="Jan 2022"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                            />
                            <Input
                              label="End Date"
                              placeholder="Present"
                              value={exp.endDate}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateExperience(exp.id, {
                                  endDate: val,
                                  current: val.trim().toLowerCase() === "present"
                                });
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Bullet Achievements (one per line)
                              </label>
                              <p className="text-[11px] text-muted-foreground">
                                Format: Google XYZ (Accomplished [X], measured by [Y], by doing [Z])
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {exp.description && exp.description.length > 140 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCompressorState({
                                    isOpen: true,
                                    bulletText: exp.description,
                                    itemId: exp.id,
                                    itemType: "experience"
                                  })}
                                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                  title="Shorten verbose bullet lines"
                                >
                                  <Scissors className="h-3 w-3" />
                                  <span>Shorten</span>
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleEnhanceBullet(exp.id, exp.description, "experience")}
                                disabled={enhancingId === exp.id || !exp.description}
                                className="h-7 text-xs gap-1.5 border-primary/40 hover:border-primary hover:bg-primary/10 text-primary font-semibold shadow-2xs"
                                title="Rewrites using Google XYZ format with decisive action verbs and preserves your real metrics"
                              >
                                {enhancingId === exp.id ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                                    <span>Polishing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3 w-3 text-primary" />
                                    <span>✨ Perfect Bullets (Google XYZ)</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                          <textarea
                            rows={5}
                            placeholder="• Built a scalable distributed service reducing latency by 40% using Next.js and Redis...&#10;• Refactored database queries, accelerating response times for 25,000+ daily active users..."
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                            className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-all resize-none leading-relaxed"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {data.experience.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                      No work experiences added yet. Click &quot;Add Experience&quot; above to start.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Education</h3>
                  <Button size="sm" onClick={addEducation} className="gap-1.5 h-8 font-semibold">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Education</span>
                  </Button>
                </div>

                <div className="space-y-6">
                  {data.education.map((edu, index) => {
                    const resolvedGradeType = ((): "cgpa" | "percentage" | "gpa" | "none" => {
                      if (edu.gradeType) {
                        const gt = edu.gradeType.toLowerCase();
                        if (gt === "percentage" || gt === "percent") return "percentage";
                        if (gt === "gpa") return "gpa";
                        if (gt === "none") return "none";
                        if (gt === "cgpa") return "cgpa";
                      }
                      if (edu.grade) {
                        if (edu.grade.includes("%") || /percent/i.test(edu.grade)) return "percentage";
                        if (/gpa/i.test(edu.grade) && !/cgpa/i.test(edu.grade)) return "gpa";
                        return "cgpa";
                      }
                      if (edu.description) {
                        if (/percentage|%/i.test(edu.description)) return "percentage";
                        if (/gpa/i.test(edu.description) && !/cgpa/i.test(edu.description)) return "gpa";
                        if (/cgpa/i.test(edu.description)) return "cgpa";
                      }
                      return "none";
                    })();

                    const previewGrade = formatEducationGrade({ ...edu, gradeType: resolvedGradeType });

                    return (
                      <Card key={edu.id} className="border border-border/70 overflow-hidden bg-card/60 shadow-2xs">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/50 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-foreground truncate">
                              {edu.degree || edu.school ? `${edu.degree || "Degree"}${edu.school ? ` • ${edu.school}` : ""}` : `Education #${index + 1}`}
                            </span>
                            {previewGrade && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-[10px] shrink-0 border border-primary/20">
                                {previewGrade}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEducation(edu.id)}
                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-destructive/10"
                            title="Remove education"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>

                        <CardContent className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="University / Institution"
                              placeholder="Stanford University"
                              value={edu.school}
                              onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                            />
                            <Input
                              label="Degree Name"
                              placeholder="Bachelor of Science"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                            />
                            <Input
                              label="Field of Study"
                              placeholder="Computer Science"
                              value={edu.fieldOfStudy}
                              onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })}
                            />
                            <Input
                              label="Location"
                              placeholder="Stanford, CA"
                              value={edu.location}
                              onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-2 md:col-span-2">
                              <Input
                                label="Start Date"
                                placeholder="Sep 2018"
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                              />
                              <Input
                                label="Graduation Date"
                                placeholder="Jun 2022"
                                value={edu.endDate}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateEducation(edu.id, {
                                    endDate: val,
                                    current: val.trim().toLowerCase() === "present"
                                  });
                                }}
                              />
                            </div>

                            {/* Academic Score: CGPA or Percentage option */}
                            <div className="md:col-span-2 pt-3 border-t border-border/60 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <label className="text-xs font-semibold text-foreground/90 block">
                                    Academic Score / Grade Format
                                  </label>
                                  <p className="text-[11px] text-muted-foreground">
                                    Optionally display your CGPA, Percentage, or GPA on this degree
                                  </p>
                                </div>
                                <div className="inline-flex items-center bg-muted/80 p-0.5 rounded-lg border border-border/60 text-xs shrink-0 shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => updateEducation(edu.id, { gradeType: "cgpa" })}
                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                      resolvedGradeType === "cgpa"
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                                    }`}
                                  >
                                    CGPA
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateEducation(edu.id, { gradeType: "percentage" })}
                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                      resolvedGradeType === "percentage"
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                                    }`}
                                  >
                                    Percentage (%)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateEducation(edu.id, { gradeType: "gpa" })}
                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                      resolvedGradeType === "gpa"
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                                    }`}
                                  >
                                    GPA
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateEducation(edu.id, { gradeType: "none", grade: "" })}
                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                      resolvedGradeType === "none"
                                        ? "bg-background text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                                    }`}
                                  >
                                    None
                                  </button>
                                </div>
                              </div>

                              {resolvedGradeType !== "none" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg border border-border/50 items-center">
                                  <Input
                                    label={
                                      resolvedGradeType === "percentage"
                                        ? "Percentage Score"
                                        : resolvedGradeType === "gpa"
                                        ? "GPA Score (4.0 Scale)"
                                        : "CGPA Score (Scale of 10 or 4)"
                                    }
                                    placeholder={
                                      resolvedGradeType === "percentage"
                                        ? "e.g. 85% or 92.4"
                                        : resolvedGradeType === "gpa"
                                        ? "e.g. 3.8 / 4.0"
                                        : "e.g. 8.8 / 10 or 9.1"
                                    }
                                    value={edu.grade || ""}
                                    onChange={(e) => updateEducation(edu.id, {
                                      grade: e.target.value,
                                      gradeType: resolvedGradeType
                                    })}
                                  />
                                  <div className="flex flex-col justify-center space-y-1 text-xs">
                                    <span className="text-muted-foreground font-medium">Resume Format Preview:</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs font-bold text-foreground bg-background px-2.5 py-1.5 rounded border border-border/70 inline-block shadow-2xs">
                                        {previewGrade || "Enter score on the left..."}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {data.education.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                      No educational records added yet. Click &quot;Add Education&quot; above to start.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Personal Projects</h3>
                  <Button size="sm" onClick={addProject} className="gap-1.5 h-8 font-semibold">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Project</span>
                  </Button>
                </div>

                <div className="space-y-6">
                  {data.projects.map((proj, index) => (
                    <Card key={proj.id} className="border border-border/70 overflow-hidden bg-card/60 shadow-2xs">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/50 text-xs">
                        <span className="font-semibold text-foreground truncate">
                          {proj.name ? `${proj.name}${proj.role ? ` (${proj.role})` : ""}` : `Project #${index + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProject(proj.id)}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-destructive/10"
                          title="Remove project"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Project Name"
                            placeholder="AI Agent Hub"
                            value={proj.name}
                            onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                          />
                          <Input
                            label="Your Role / Contribution"
                            placeholder="Lead Developer"
                            value={proj.role}
                            onChange={(e) => updateProject(proj.id, { role: e.target.value })}
                          />
                          <Input
                            label="Demo URL / GitHub Link"
                            placeholder="https://github.com/yourname/project"
                            value={proj.link}
                            onChange={(e) => updateProject(proj.id, { link: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label="Start Date"
                              placeholder="Oct 2023"
                              value={proj.startDate}
                              onChange={(e) => updateProject(proj.id, { startDate: e.target.value })}
                            />
                            <Input
                              label="End Date"
                              placeholder="Present"
                              value={proj.endDate}
                              onChange={(e) => updateProject(proj.id, { endDate: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Key Highlights & Tech Used
                              </label>
                              <p className="text-[11px] text-muted-foreground">
                                Format: Google XYZ (Accomplished [X], measured by [Y], by doing [Z])
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {proj.description && proj.description.length > 140 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCompressorState({
                                    isOpen: true,
                                    bulletText: proj.description,
                                    itemId: proj.id,
                                    itemType: "projects"
                                  })}
                                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                  title="Shorten verbose bullet lines"
                                >
                                  <Scissors className="h-3 w-3" />
                                  <span>Shorten</span>
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleEnhanceBullet(proj.id, proj.description, "projects")}
                                disabled={enhancingId === proj.id || !proj.description}
                                className="h-7 text-xs gap-1.5 border-primary/40 hover:border-primary hover:bg-primary/10 text-primary font-semibold shadow-2xs"
                                title="Rewrites using Google XYZ format with decisive action verbs and preserves your real metrics"
                              >
                                {enhancingId === proj.id ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                                    <span>Polishing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3 w-3 text-primary" />
                                    <span>✨ Perfect Bullets (Google XYZ)</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                          <textarea
                            rows={4}
                            placeholder="• Built a full-stack Next.js app serving 10,000+ monthly active users...&#10;• Integrated Stripe payment checkout with zero transaction drop-offs..."
                            value={proj.description}
                            onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                            className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-all resize-none leading-relaxed"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {data.projects.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                      No projects added yet. Click &quot;Add Project&quot; above to begin.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills Customizer Tab */}
            {activeTab === "skills" && (
              <div className="space-y-6">
                {/* 1-Click Genuine Recommended Skills for Target Role */}
                {(careerProfile?.targetRole || activeJobContext?.jobTitle) && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-primary/25 bg-primary/5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground">
                          Recommended skills for {careerProfile?.targetRole || activeJobContext?.jobTitle}
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Verified against the hiring bar and official industry curricula.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddRecommendedSkills}
                      className="text-xs h-7.5 px-3 font-semibold border-primary/30 text-primary hover:bg-primary/10 shrink-0 self-start sm:self-auto shadow-2xs"
                    >
                      + Add Essential Skills
                    </Button>
                  </div>
                )}

                <form onSubmit={handleAddSkillSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-6">
                    <Input
                      label="Skill Name"
                      placeholder="React, TypeScript, SQL..."
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Input
                      label="Category"
                      placeholder="Languages, Frameworks, Cloud..."
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full h-10 font-semibold">
                      Add
                    </Button>
                  </div>
                </form>

                {/* Listing of skills by categories */}
                <div className="space-y-4 pt-2">
                  {Object.keys(groupedSkills).map((catName) => (
                    <Card key={catName} className="border-border/60">
                      <CardContent className="p-4 space-y-2">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                          {catName}
                        </h4>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {groupedSkills[catName].map((skill) => (
                            <span
                              key={skill.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-medium"
                            >
                              <span>{skill.name}</span>
                              <button
                                type="button"
                                onClick={() => removeSkill(skill.id)}
                                className="hover:text-destructive cursor-pointer opacity-70 hover:opacity-100"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {data.skills.length === 0 && (
                    <div className="w-full text-center py-8 rounded-xl border border-dashed border-border/80 text-muted-foreground text-sm">
                      No skills listed. Fill in details above and click &quot;Add&quot; to begin.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Design, Density & Layout Tab */}
            {activeTab === "design" && (
              <div className="space-y-6">
                {/* 0. Page Height Balance & Trailing White Space Elimination */}
                <div className="space-y-3 p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Page Height Balance
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateDesignSettings({
                          balancePageHeight: !data.design?.balancePageHeight
                        })
                      }
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        data.design?.balancePageHeight
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs"
                          : "bg-muted text-muted-foreground border-border/60 hover:text-foreground"
                      }`}
                    >
                      {data.design?.balancePageHeight ? "✓ 100% Balanced" : "Off (Top-Aligned)"}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Distributes space evenly across all sections so your resume fills 100% of the single page edge-to-edge with no trailing bottom void.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExpandToFillPage}
                    className="w-full text-xs font-bold gap-1.5 h-8 border-primary/40 hover:bg-primary/10 text-primary shadow-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>📐 Auto-Fill Page (100%)</span>
                  </Button>
                </div>

                {/* 1. Resume Layout Style (Top 5 Curated Styles) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Resume Layout Style (Top 5)
                    </h3>
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Classic ATS Recommended
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: "classic",
                        label: "Classic ATS (Recommended)",
                        badge: "100% Safe",
                        desc: "Single column, clean divider rules, right-aligned dates. The gold standard for FAANG & corporate ATS."
                      },
                      {
                        id: "split-sidebar",
                        label: "Modern Split / 2-Column",
                        badge: "Modern Polish",
                        desc: "30% left sidebar for contact & skills; 70% right for experience. Balances 1-page resumes beautifully."
                      },
                      {
                        id: "executive",
                        label: "Executive Leader",
                        badge: "Leadership",
                        desc: "Authoritative header with left accent bars and refined typography. Tailored for senior & lead candidates."
                      },
                      {
                        id: "minimal",
                        label: "Minimalist Modern",
                        badge: "High Whitespace",
                        desc: "No heavy divider rules. Relies on clean typographic contrast and generous whitespace for modern roles."
                      },
                      {
                        id: "technical",
                        label: "Technical Grid",
                        badge: "Dev Focused",
                        desc: "Categorized monospace skill badges and project demo tags. Engineered for software & data practitioners."
                      }
                    ].map((styleOpt) => {
                      const isSelected = (data.design?.resumeStyle || "classic") === styleOpt.id;
                      return (
                        <button
                          key={styleOpt.id}
                          type="button"
                          onClick={() => updateDesignSettings({ resumeStyle: styleOpt.id as any })}
                          className={`flex flex-col p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/40"
                              : "border-border/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-foreground">{styleOpt.label}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}>
                              {styleOpt.badge}
                            </span>
                          </div>
                          <span className="text-[10px] opacity-75 mt-1 leading-relaxed">{styleOpt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Resume Density Controller */}
                <DensityController
                  currentDensity={data.design?.density || "normal"}
                  onChangeDensity={(density) => setDensity(density)}
                />

                {/* 2. 5 Curated Typography Styles */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Typography Style (5 Options)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "font-sans", label: "Modern Sans", desc: "Inter / Crisp & Clean" },
                      { id: "font-serif", label: "Classic Serif", desc: "Merriweather / Editorial" },
                      { id: "font-mono", label: "Tech Monospace", desc: "JetBrains / Code" },
                      { id: "font-executive", label: "Executive Serif", desc: "Garamond / Traditional" },
                      { id: "font-geometric", label: "Clean Geometric", desc: "Outfit / Minimalist" }
                    ].map((fontOpt) => (
                      <button
                        key={fontOpt.id}
                        type="button"
                        onClick={() => updateDesignSettings({ fontFamily: fontOpt.id as any })}
                        className={`flex flex-col p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          (data.design?.fontFamily || "font-sans") === fontOpt.id
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                            : "border-border/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-xs font-bold">{fontOpt.label}</span>
                        <span className="text-[10px] opacity-70 mt-1">{fontOpt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. 5 Text Scale Levels */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Base Font Scale (5 Levels)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "xs", label: "Compact (11.5px)", desc: "Ultra-high density" },
                      { id: "sm", label: "Small (12.5px)", desc: "High density" },
                      { id: "md", label: "Standard (14px)", desc: "Balanced default" },
                      { id: "lg", label: "Medium (15px)", desc: "Open & spacious" },
                      { id: "xl", label: "Spacious (16.5px)", desc: "Max readability" }
                    ].map((sizeOpt) => (
                      <button
                        key={sizeOpt.id}
                        type="button"
                        onClick={() => updateDesignSettings({ fontSize: sizeOpt.id as any })}
                        className={`flex flex-col p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          (data.design?.fontSize || "md") === sizeOpt.id
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                            : "border-border/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-xs font-bold">{sizeOpt.label}</span>
                        <span className="text-[10px] opacity-70 mt-1">{sizeOpt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Section Order controller */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Section Ordering</h3>
                  <div className="space-y-2">
                    {(data.design?.sectionOrder || ["summary", "experience", "projects", "education", "skills"]).map((secId, index, arr) => (
                      <div
                        key={secId}
                        className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 text-xs font-semibold capitalize"
                      >
                        <span>{secId === "summary" ? "Professional Summary" : secId}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveUp(index)}
                            className="p-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === arr.length - 1}
                            onClick={() => handleMoveDown(index)}
                            className="p-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Clean A4 Page Preview Panel */}
        <div className={`w-full md:w-1/2 flex-col bg-muted/30 overflow-y-auto h-full p-4 md:p-6 space-y-4 ${mobileViewMode === "preview" ? "flex" : "hidden md:flex"}`}>
          {/* Fit Indicator Bar & Auto-Fit Controller */}
          <div className="no-print space-y-2">
            <FitIndicatorBar
              fitAnalysis={fitAnalysis}
              onFixToOnePage={handleMultiStageAutoFit}
              onFillPage={handleExpandToFillPage}
              onPrint={handleExecutePrintPDF}
              isFixing={isAutoFitting}
              isAnalysisOpen={isFitDrawerOpen}
              onToggleAnalysis={() => setIsFitDrawerOpen(!isFitDrawerOpen)}
            />

            {/* Change Indicator Notification Banner */}
            <AnimatePresence>
              {autoFitNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 rounded-xl border border-primary/30 bg-primary/10 text-xs text-foreground flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">{autoFitNotification}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        undo();
                        setAutoFitNotification(null);
                      }}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      Undo
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoFitNotification(null)}
                      className="text-muted-foreground hover:text-foreground text-xs cursor-pointer ml-1"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fit Analysis Detailed Diagnostic Drawer */}
            <FitAnalysisDrawer
              isOpen={isFitDrawerOpen}
              fitAnalysis={fitAnalysis}
              resumeData={data}
              onOpenCompressor={(bulletText, itemId, itemType) => {
                setCompressorState({
                  isOpen: true,
                  bulletText,
                  itemId,
                  itemType
                });
              }}
            />
          </div>

          {/* A4 Canvas Container with Scaled Visuals */}
          <div className="flex items-start justify-center pb-12">
            <div className="relative">
              {/* Exact A4 Document Sheet (210mm width, 297mm min-height) */}
              <div
                id="resume-print-area"
                className={`relative w-[210mm] min-h-[297mm] p-[12mm_15mm] bg-white text-zinc-900 shadow-xl border border-zinc-200 rounded-xs flex flex-col transition-all resume-a4-page ${
                  fontClassMap[data.design?.fontFamily || "font-sans"]
                } ${
                  fontSizeMap[data.design?.fontSize || "md"]
                }`}
                style={{
                  lineHeight: lineHeightMultiplier
                }}
              >
                {/* Inner Content Container */}
                <div className="flex flex-col w-full flex-1">
                  {/* Personal Details Header */}
                  {(() => {
                    const activeStyle = data.design?.resumeStyle || "classic";
                    const isExecutive = activeStyle === "executive";
                    const isMinimal = activeStyle === "minimal";
                    const isTechnical = activeStyle === "technical";
                    const isSplit = activeStyle === "split-sidebar";

                    return (
                      <div
                        className={`shrink-0 ${
                          isMinimal || isSplit ? "text-left" : "text-center"
                        } ${
                          isMinimal
                            ? "pb-2 mb-3"
                            : isExecutive
                            ? "border-b-2 border-zinc-900"
                            : "border-b border-zinc-200"
                        }`}
                        style={{
                          paddingBottom: isMinimal ? "6px" : `${10 * sectionSpacingMultiplier}px`,
                          marginBottom: `${12 * sectionSpacingMultiplier}px`
                        }}
                      >
                        {isExecutive && <div className="h-1 bg-zinc-900 w-full mb-2.5 shrink-0" />}

                        <h2
                          className={`text-2xl tracking-tight text-zinc-950 ${
                            isExecutive
                              ? "font-serif font-black tracking-wider uppercase"
                              : isMinimal
                              ? "font-black tracking-tight"
                              : "font-extrabold tracking-tight uppercase"
                          }`}
                        >
                          {data.personalInfo.fullName || "Your Full Name"}
                        </h2>

                        {/* Contact destinations */}
                        <div
                          className={`flex flex-wrap items-center gap-3 text-[0.85em] mt-1.5 ${
                            isMinimal || isSplit ? "justify-start text-zinc-600 font-medium" : "justify-center text-zinc-700 font-medium"
                          }`}
                        >
                          {data.personalInfo.email && (
                            <a
                              href={`mailto:${data.personalInfo.email}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary hover:underline transition-colors"
                              title={data.personalInfo.email}
                            >
                              {data.personalInfo.email}
                            </a>
                          )}
                          {data.personalInfo.phone && (
                            <a
                              href={`tel:${data.personalInfo.phone.replace(/[^0-9+]/g, "")}`}
                              className="hover:text-primary hover:underline transition-colors"
                              title={data.personalInfo.phone}
                            >
                              {data.personalInfo.phone}
                            </a>
                          )}
                          {data.personalInfo.location && (
                            <span className="text-zinc-600 font-normal">
                              {data.personalInfo.location}
                            </span>
                          )}
                          {data.personalInfo.website && (
                            <a
                              href={data.personalInfo.website.startsWith("http") ? data.personalInfo.website : `https://${data.personalInfo.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary hover:underline transition-colors"
                              title={data.personalInfo.website}
                            >
                              Portfolio
                            </a>
                          )}
                          {data.personalInfo.linkedin && (
                            <a
                              href={data.personalInfo.linkedin.startsWith("http") ? data.personalInfo.linkedin : `https://${data.personalInfo.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary hover:underline transition-colors"
                              title={data.personalInfo.linkedin}
                            >
                              LinkedIn
                            </a>
                          )}
                          {data.personalInfo.github && (
                            <a
                              href={data.personalInfo.github.startsWith("http") ? data.personalInfo.github : `https://${data.personalInfo.github}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary hover:underline transition-colors"
                              title={data.personalInfo.github}
                            >
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Body Content */}
                  {(() => {
                    const activeStyle = data.design?.resumeStyle || "classic";
                    const isExecutive = activeStyle === "executive";
                    const isMinimal = activeStyle === "minimal";
                    const isTechnical = activeStyle === "technical";
                    const isSplit = activeStyle === "split-sidebar";

                    // Section Heading Styler
                    const getHeadingClass = (title: string) => {
                      if (isExecutive) {
                        return "text-[1.05em] font-serif font-bold uppercase tracking-wider text-zinc-950 border-l-3 border-zinc-900 pl-2 pb-0.5 mb-1";
                      }
                      if (isMinimal) {
                        return "text-[0.88em] font-bold uppercase tracking-widest text-zinc-500 pb-0.5";
                      }
                      return "text-[1.05em] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5";
                    };

                    // Reusable Renderers for each section
                    const renderSummary = () =>
                      data.summary ? (
                        <div key="summary" className="space-y-1 section-item break-inside-avoid">
                          <h3 className={getHeadingClass("Professional Summary")}>
                            Professional Summary
                          </h3>
                          <p className="text-[0.95em] text-zinc-700 text-justify whitespace-pre-line leading-relaxed">
                            {data.summary}
                          </p>
                        </div>
                      ) : null;

                    const renderExperience = () =>
                      data.experience.length > 0 ? (
                        <div key="experience" className="space-y-1.5 section-item break-inside-avoid">
                          <h3 className={getHeadingClass("Work Experience")}>
                            Work Experience
                          </h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: `${10 * itemSpacingMultiplier}px` }}>
                            {data.experience.map((exp) => {
                              const titleAndCompany = renderTitleWithSubtitle(exp.position, exp.company);
                              const dateRange = formatSafeDateRange(exp.startDate, exp.endDate, exp.current);

                              return (
                                <div key={exp.id} className="space-y-0.5">
                                  <div className="flex items-center justify-between text-[1em]">
                                    <span className="font-bold text-zinc-900">
                                      {titleAndCompany}
                                    </span>
                                    {dateRange && (
                                      <span className="text-zinc-600 font-medium text-[0.9em] shrink-0 ml-2">
                                        {dateRange}
                                      </span>
                                    )}
                                  </div>
                                  {exp.location && (
                                    <p className="text-[0.8em] text-zinc-500 font-medium uppercase tracking-wide">
                                      {exp.location}
                                    </p>
                                  )}
                                  {exp.description && (
                                    <ul className="list-disc list-outside pl-4 space-y-0.5">
                                      {exp.description.split("\n").filter(b => b.trim() !== "").map((bullet, i) => (
                                        <li key={i} className="text-[0.95em] text-zinc-700 leading-relaxed">
                                          {bullet.replace(/^[•\-\s]*/, "")}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null;

                    const renderProjects = () =>
                      data.projects.length > 0 ? (
                        <div key="projects" className="space-y-1.5 section-item break-inside-avoid">
                          <h3 className={getHeadingClass("Personal Projects")}>
                            Personal Projects
                          </h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: `${10 * itemSpacingMultiplier}px` }}>
                            {data.projects.map((proj) => {
                              const projectNameAndRole = renderTitleWithSubtitle(proj.name, proj.role);
                              const projDate = formatSafeDateRange(proj.startDate, proj.endDate);
                              const isGitHub = (proj.link || "").toLowerCase().includes("github");
                              const linkLabel = isGitHub ? "GitHub" : "Live Demo";

                              return (
                                <div key={proj.id} className="space-y-0.5">
                                  <div className="flex items-baseline justify-between text-[1em]">
                                    <div className="flex flex-wrap items-baseline gap-1.5 min-w-0">
                                      <span className="font-bold text-zinc-900">
                                        {projectNameAndRole}
                                      </span>
                                      {proj.link && (
                                        <a
                                          href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[0.82em] font-medium text-primary hover:underline inline-flex items-center"
                                        >
                                          <span className="text-zinc-400 font-normal mr-1.5">|</span>
                                          <span>{linkLabel}</span>
                                        </a>
                                      )}
                                    </div>
                                    {projDate && (
                                      <span className="text-zinc-600 font-medium text-[0.9em] shrink-0 ml-2">
                                        {projDate}
                                      </span>
                                    )}
                                  </div>
                                  {proj.description && (
                                    <ul className="list-disc list-outside pl-4 space-y-0.5">
                                      {proj.description.split("\n").filter(b => b.trim() !== "").map((bullet, i) => (
                                        <li key={i} className="text-[0.95em] text-zinc-700 leading-relaxed">
                                          {bullet.replace(/^[•\-\s]*/, "")}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null;

                    const renderEducation = () =>
                      data.education.length > 0 ? (
                        <div key="education" className="space-y-1.5 section-item break-inside-avoid">
                          <h3 className={getHeadingClass("Education")}>
                            Education
                          </h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: `${8 * itemSpacingMultiplier}px` }}>
                            {data.education.map((edu) => {
                              const gradeText = formatEducationGrade(edu);
                              const degreeAndField = [
                                edu.degree,
                                edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""
                              ].filter(Boolean).join(" ").trim();
                              const dateRange = formatSafeDateRange(edu.startDate, edu.endDate, edu.current);

                              return isSplit ? (
                                <div key={edu.id} className="space-y-0.5 text-[0.9em]">
                                  <div className="font-bold text-[0.95em] text-zinc-950 leading-tight">
                                    {edu.school}
                                  </div>
                                  {degreeAndField && (
                                    <div className="text-zinc-700 font-medium text-[0.9em] leading-tight">
                                      {degreeAndField}
                                    </div>
                                  )}
                                  {gradeText && (
                                    <div className="text-zinc-500 font-normal text-[0.85em]">
                                      {gradeText}
                                    </div>
                                  )}
                                  <div className="text-zinc-500 font-normal text-[0.82em]">
                                    {dateRange}
                                    {edu.location ? (dateRange ? ` · ${edu.location}` : edu.location) : ""}
                                  </div>
                                </div>
                              ) : (
                                <div key={edu.id} className="space-y-0.5 text-[0.95em]">
                                  <div className="flex items-center justify-between text-[1em]">
                                    <span className="text-zinc-950 font-bold">{edu.school}</span>
                                    {dateRange && (
                                      <span className="text-zinc-600 font-medium text-[0.9em] shrink-0 ml-2">{dateRange}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between text-zinc-700 text-[0.95em]">
                                    <span>
                                      {degreeAndField && <span className="font-medium text-zinc-800">{degreeAndField}</span>}
                                      {gradeText && (
                                        <span className={`text-zinc-500 font-normal text-[0.9em] ${degreeAndField ? "ml-2" : ""}`}>
                                          {degreeAndField ? "· " : ""}{gradeText}
                                        </span>
                                      )}
                                    </span>
                                    {edu.location && <span className="text-zinc-500 font-normal text-[0.9em] shrink-0 ml-2">{edu.location}</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null;

                    const renderSkills = () =>
                      data.skills.length > 0 ? (
                        <div key="skills" className="space-y-1 section-item break-inside-avoid">
                          <h3 className={getHeadingClass("Skills & Technologies")}>
                            Skills & Technologies
                          </h3>
                          {isSplit ? (
                            <div className="space-y-2.5 pt-1 text-[0.9em]">
                              {Object.keys(groupedSkills).map((catKey) => {
                                const rowSkills = groupedSkills[catKey].map((s) => s.name).join(", ");
                                return (
                                  <div key={catKey} className="space-y-0.5">
                                    <span className="text-[0.85em] font-bold text-zinc-900 block">
                                      {catKey}
                                    </span>
                                    <p className="text-[0.9em] text-zinc-700 leading-snug">
                                      {rowSkills}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="space-y-1.5 pt-1 text-[0.92em] text-zinc-800 leading-relaxed">
                              {Object.keys(groupedSkills).map((catKey) => {
                                const rowSkills = groupedSkills[catKey].map((s) => s.name).join(", ");
                                return (
                                  <div key={catKey} className="flex flex-wrap items-baseline gap-1.5">
                                    <span className="font-bold text-zinc-950 shrink-0">
                                      {catKey}:
                                    </span>
                                    <span className="text-zinc-700 font-normal">
                                      {rowSkills}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : null;

                    // If 2-Column Split Sidebar Style
                    if (isSplit) {
                      return (
                        <div className="flex flex-1 gap-6 pt-1">
                          {/* Left Column (32% width) */}
                          <div className="w-[32%] shrink-0 pr-4 border-r border-zinc-200 flex flex-col space-y-4">
                            {renderEducation()}
                            {renderSkills()}
                          </div>
                          {/* Right Column (68% width) */}
                          <div className="flex-1 flex flex-col space-y-4 min-w-0">
                            {renderSummary()}
                            {renderExperience()}
                            {renderProjects()}
                          </div>
                        </div>
                      );
                    }

                    // Single Column Layout (Classic, Executive, Minimal, Technical)
                    const sectionMap: Record<string, () => React.ReactNode> = {
                      summary: renderSummary,
                      experience: renderExperience,
                      projects: renderProjects,
                      education: renderEducation,
                      skills: renderSkills
                    };

                    const order = data.design?.sectionOrder || ["summary", "experience", "projects", "education", "skills"];

                    return (
                      <div
                        className={`flex flex-col flex-1 ${data.design?.balancePageHeight ? "justify-between" : ""}`}
                        style={{ gap: `${14 * sectionSpacingMultiplier}px` }}
                      >
                        {order.map((secId) => sectionMap[secId]?.())}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct PDF Download Modal */}
      <AnimatePresence>
        {isDownloadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5 text-foreground"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Download className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Download Resume PDF</h3>
                    <p className="text-xs text-muted-foreground">Save pure A4 document directly to your device</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  PDF Document Name
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={downloadFileName}
                    onChange={(e) => setDownloadFileName(e.target.value)}
                    placeholder="Alex_Johnson_Resume"
                    className="font-mono text-xs"
                    autoFocus
                  />
                  <span className="text-xs font-mono text-muted-foreground font-semibold">.pdf</span>
                </div>
              </div>

              {/* Export Mode Selection Cards */}
              <div className="space-y-3 pt-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Choose Download Method</p>

                {/* Option 1: Direct 1-Click PDF Download (Primary) */}
                <div className="p-4 rounded-xl border-2 border-primary/50 bg-primary/5 space-y-3 hover:bg-primary/10 transition-colors shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                        <Download className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-foreground">Normal PDF File (.pdf)</p>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            RECOMMENDED
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Direct 1-click download of your single-page resume straight to your computer.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleExecutePDFDownload}
                    disabled={isDownloadingPDF || !downloadFileName.trim()}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-9 gap-2 shadow-sm"
                  >
                    {isDownloadingPDF ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Generating & Saving PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Normal PDF (.pdf)</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Option 2: Print Vector PDF */}
                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                        <Printer className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Print Vector PDF</p>
                        <p className="text-[11px] text-muted-foreground">
                          Opens browser print dialog with &quot;Save as PDF&quot; for 100% selectable vector fonts.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExecutePrintPDF}
                    className="w-full text-xs font-semibold h-8 gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Open Print Dialog (Vector)</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                <span>💡 Tip: Select &quot;Save as PDF&quot; in the print dialog.</span>
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="hover:text-foreground font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Bullet Compressor Modal */}
      <SmartBulletCompressorModal
        isOpen={compressorState.isOpen}
        onClose={() => setCompressorState((prev) => ({ ...prev, isOpen: false }))}
        originalBullet={compressorState.bulletText}
        itemId={compressorState.itemId}
        itemType={compressorState.itemType}
        onApplyBullet={(itemId, itemType, oldB, newB) => {
          applyCompressedBullet(itemId, itemType, oldB, newB);
        }}
      />

      {/* Import Resume Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] no-print text-foreground"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-base">Import Resume Details</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Inject credentials from another file or raw text. This overwrites current details.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportError(null);
                  }}
                  className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="px-5 py-2 bg-muted/30 border-b border-border">
                <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setImportTab("text")}
                    className={`py-1.5 rounded-md text-center cursor-pointer transition-colors ${
                      importTab === "text"
                        ? "bg-card shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Paste Text / File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImportTab("portfolio");
                      const fetchPortfolio = async () => {
                        try {
                          const res = await fetch("/api/resume");
                          const result = await res.json();
                          if (result.success && result.data) {
                            setPortfolioResumes(result.data.filter((r: any) => r.id !== id));
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      };
                      fetchPortfolio();
                    }}
                    className={`py-1.5 rounded-md text-center cursor-pointer transition-colors ${
                      importTab === "portfolio"
                        ? "bg-card shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Select from Portfolio
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {importError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}

                {isParsing && (
                  <div className="p-6 rounded-xl border border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-3 text-center animate-in fade-in">
                    <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">
                        {parseStage || "Extracting resume details with AI..."}
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Extracting contact info, summary, work experiences with full bullet points, education, projects, and skills into your builder.
                      </p>
                    </div>
                  </div>
                )}

                {importTab === "text" && !isParsing && (
                  <div className="space-y-4">
                    {/* Instant File Upload Area */}
                    <label className="border-2 border-dashed border-primary/30 hover:border-primary/80 bg-primary/5 hover:bg-primary/10 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group">
                      <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          Upload Resume Document or Image
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          PDF, Word (.docx), Text (.txt), or Screenshot (.png, .jpg)
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                        ⚡ Instant AI auto-extraction into your resume
                      </span>
                      <input
                        type="file"
                        accept=".txt,.pdf,.docx,.png,.jpg,.jpeg,.webp"
                        disabled={isParsing}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                          e.target.value = "";
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Divider */}
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-border"></div>
                      <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Or Paste Raw Resume Text
                      </span>
                      <div className="flex-grow border-t border-border"></div>
                    </div>

                    {/* Text Area */}
                    <div className="space-y-1.5">
                      <textarea
                        rows={7}
                        placeholder="Paste your raw resume text here (experience, bullets, projects, education, skills, contact details)..."
                        value={importRawText}
                        onChange={(e) => setImportRawText(e.target.value)}
                        className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed resize-none font-sans"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        All experiences, projects, and skills will be parsed into editable cards with no manual retyping.
                      </p>
                    </div>
                  </div>
                )}

                {importTab === "portfolio" && !isParsing && (
                  <div className="space-y-2">
                    {portfolioResumes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No other resumes available in your library.
                      </p>
                    ) : (
                      portfolioResumes.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-sm">{p.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Updated {new Date(p.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                setIsParsing(true);
                                setParseStage("Loading portfolio draft...");
                                const res = await fetch(`/api/resume/${p.id}`);
                                const single = await res.json();
                                if (single.success && single.data) {
                                  importResumeData(single.data.content);
                                  setIsImportModalOpen(false);
                                  setAutoFitNotification(`✓ Loaded resume draft: ${p.title}`);
                                }
                              } catch {
                                setImportError("Failed to load portfolio draft.");
                              } finally {
                                setIsParsing(false);
                                setParseStage("");
                              }
                            }}
                          >
                            Import
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {importTab === "text" && (
                <div className="p-4 border-t border-border flex items-center justify-between gap-2 bg-card">
                  <span className="text-[11px] text-muted-foreground">
                    {importRawText.trim() ? `${importRawText.trim().split(/\s+/).length} words detected` : ""}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsImportModalOpen(false);
                        setImportError(null);
                      }}
                      disabled={isParsing}
                    >
                      Cancel
                    </Button>
                    <Button
                      isLoading={isParsing}
                      disabled={!importRawText.trim() || isParsing}
                      onClick={() => executeAIParsing(importRawText)}
                      className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 shadow-md cursor-pointer hover:bg-primary/90"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Extract & Put into Resume</span>
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Starter Templates Modal */}
      <StarterTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={(tmpl) => {
          importResumeData(tmpl.data);
          setTitle(`${tmpl.role} Resume`);
        }}
        onOpenImport={() => {
          setIsTemplatesModalOpen(false);
          setIsImportModalOpen(true);
        }}
      />
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-sm font-semibold">Loading Resume Builder...</span>
        </div>
      }
    >
      <ResumeBuilderContent />
    </React.Suspense>
  );
}
