"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Square,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Volume2,
  VolumeX,
  Check,
  Send,
  RefreshCw,
  Award,
  User,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Headphones,
  Zap,
  RotateCcw,
  Copy,
  ChevronRight,
  Sliders,
  FileText,
  ListOrdered,
  Layers,
  ArrowRight,
  HelpCircle,
  Keyboard,
  Target,
  Building2,
  Briefcase,
  Code
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useResumeStore } from "@/store/useResumeStore";
import { POPULAR_ROLES } from "@/data/learningCurricula";
import { recordDetectedInterviewGap, STORAGE_KEYS } from "@/lib/hicejoState";
import {
  detectRoleCategory,
  getInterviewRoundsForRoleAndCompany,
  isTechnicalRole
} from "@/lib/interviewRoundCatalog";

interface PersonaConfig {
  id: "alex" | "sarah" | "david" | "maya";
  name: string;
  gender: "male" | "female";
  accent: string;
  avatarBg: string;
  voiceStyle: string;
  pitch: number;
  rate: number;
  testPhrase: string;
}

const PERSONAS: PersonaConfig[] = [
  {
    id: "alex",
    name: "Alex",
    gender: "male",
    accent: "US English",
    avatarBg: "bg-secondary text-foreground border border-border/80",
    voiceStyle: "Professional Baritone",
    pitch: 0.82,
    rate: 0.95,
    testPhrase: "Hello, I am Alex. You can test my voice and audio pacing here."
  },
  {
    id: "sarah",
    name: "Sarah",
    gender: "female",
    accent: "US English",
    avatarBg: "bg-secondary text-foreground border border-border/80",
    voiceStyle: "Executive Alto",
    pitch: 1.25,
    rate: 1.02,
    testPhrase: "Hello, I am Sarah. You can test my voice and audio pacing here."
  },
  {
    id: "david",
    name: "David",
    gender: "male",
    accent: "British English",
    avatarBg: "bg-secondary text-foreground border border-border/80",
    voiceStyle: "Analytical & Composed",
    pitch: 0.90,
    rate: 0.92,
    testPhrase: "Good day, I am David. You can test my voice and audio pacing here."
  },
  {
    id: "maya",
    name: "Maya",
    gender: "female",
    accent: "US English",
    avatarBg: "bg-secondary text-foreground border border-border/80",
    voiceStyle: "Natural & Engaging",
    pitch: 1.10,
    rate: 1.10,
    testPhrase: "Hi there, I am Maya. You can test my voice and audio pacing here."
  }
];

interface FormulatedRound {
  roundNumber: number;
  title: string;
  objective: string;
  openingQuestion: string;
}

interface FormulatedPlan {
  title: string;
  overview: string;
  targetCompetencies: string[];
  rounds: FormulatedRound[];
  preparationTips: string[];
}

interface ChatMessage {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  timestamp: string;
}

interface EvaluationResult {
  score: number;
  hiringRecommendation: string;
  feedback: string;
  starScores: {
    situation: number;
    task: number;
    action: number;
    result: number;
  };
  starAnalysis: {
    s: string;
    t: string;
    a: string;
    r: string;
  };
  communicationMetrics: {
    clarity: string;
    pacing: string;
    fillerWords: string;
    confidence: string;
  };
  keyStrengths: string[];
  areasForImprovement: string[];
  detectedEvidenceGap?: string;
  nextBestAction?: string;
}

function InterviewStudioInner() {
  const searchParams = useSearchParams();
  const urlSkill = searchParams.get("skill") || "";
  const urlMode = searchParams.get("mode") || "";
  const fromJob = searchParams.get("from") === "job";

  const { careerProfile, activeJobContext, setPendingImprovement, data: currentResumeData } = useResumeStore();

  // Studio Mode: 'interview' (Full Mock Interview) vs 'practice' (Skill Sparring)
  const [studioMode, setStudioMode] = React.useState<"interview" | "practice">(() => {
    return urlMode === "practice" || Boolean(urlSkill) ? "practice" : "interview";
  });

  // Studio Flow Stage: 'setup' -> 'plan-preview' -> 'active'
  const [studioStage, setStudioStage] = React.useState<"setup" | "plan-preview" | "active">("setup");

  // Setup Form State
  const [roleInput, setRoleInput] = React.useState(activeJobContext?.jobTitle || careerProfile?.targetRole || "Software Engineer");
  const [isCompanyTargeted, setIsCompanyTargeted] = React.useState<boolean>(Boolean(activeJobContext?.company));
  const [companyInput, setCompanyInput] = React.useState(activeJobContext?.company || "");
  const [roundType, setRoundType] = React.useState<string>("full_loop");

  // Dynamically compute authentic interview rounds tailored to role and company
  const availableRoundOptions = React.useMemo(() => {
    return getInterviewRoundsForRoleAndCompany(
      roleInput,
      isCompanyTargeted ? companyInput : ""
    );
  }, [roleInput, companyInput, isCompanyTargeted]);

  // Keep roundType aligned whenever role or company changes
  React.useEffect(() => {
    const validIds = availableRoundOptions.map((r) => r.id);
    if (!validIds.includes(roundType)) {
      setRoundType(validIds[0] || "full_loop");
    }
  }, [availableRoundOptions, roundType]);
  const [customFocusTopics, setCustomFocusTopics] = React.useState("");
  const [practiceSkillInput, setPracticeSkillInput] = React.useState(urlSkill || "");
  const [experienceLevel, setExperienceLevel] = React.useState(careerProfile?.experienceLevel || "Mid-Level");
  const [jdInput, setJdInput] = React.useState(activeJobContext?.jobDescription || "");
  const [resumeTextInput, setResumeTextInput] = React.useState(careerProfile?.resumeText || "");
  const [savedResumesList, setSavedResumesList] = React.useState<Array<{ id: string; title: string }>>([]);
  const [selectedResumeDraftId, setSelectedResumeDraftId] = React.useState("");
  const [prepMode, setPrepMode] = React.useState<"voice" | "text">("voice");
  const [focusArea, setFocusArea] = React.useState<"full" | "technical" | "system-design" | "behavioral" | "job-specific">("full");
  const [selectedPersonaId, setSelectedPersonaId] = React.useState<PersonaConfig["id"]>("alex");

  // Formulation State
  const [isFormulating, setIsFormulating] = React.useState(false);
  const [formulatedPlan, setFormulatedPlan] = React.useState<FormulatedPlan | null>(null);

  // Sync with active job context when navigated from target jobs
  React.useEffect(() => {
    if (activeJobContext) {
      if (activeJobContext.jobTitle) {
        setRoleInput(activeJobContext.jobTitle);
      }
      if (activeJobContext.company) {
        setCompanyInput(activeJobContext.company);
        setIsCompanyTargeted(true);
      }
      if (activeJobContext.jobDescription) {
        setJdInput(activeJobContext.jobDescription);
      }
      if (activeJobContext.jobTitle || activeJobContext.jobDescription) {
        setStudioMode("interview");
      }
    }
  }, [activeJobContext]);

  // Sync with career profile or builder resume text
  React.useEffect(() => {
    if (!resumeTextInput) {
      if (careerProfile?.resumeText) {
        setResumeTextInput(careerProfile.resumeText);
      } else if (currentResumeData) {
        const parts: string[] = [];
        if (currentResumeData.personalInfo?.fullName) parts.push(`Candidate: ${currentResumeData.personalInfo.fullName}`);
        if (currentResumeData.summary) parts.push(currentResumeData.summary);
        if (Array.isArray(currentResumeData.experience) && currentResumeData.experience.length > 0) {
          parts.push(
            currentResumeData.experience
              .map((e) => `${e.position} at ${e.company}:\n${e.description}`)
              .join("\n\n")
          );
        }
        if (Array.isArray(currentResumeData.skills) && currentResumeData.skills.length > 0) {
          parts.push(`Skills: ${currentResumeData.skills.map((s) => s.name).join(", ")}`);
        }
        const combined = parts.join("\n\n").trim();
        if (combined) setResumeTextInput(combined);
      }
    }
    if (careerProfile?.experienceLevel && !experienceLevel) {
      setExperienceLevel(careerProfile.experienceLevel);
    }
  }, [careerProfile, currentResumeData, resumeTextInput, experienceLevel]);

  // Auto-formulate tailored interview sections when navigated from target jobs (Prep Interview button)
  const hasAutoFormulatedRef = React.useRef(false);
  React.useEffect(() => {
    const targetRole = activeJobContext?.jobTitle || roleInput;
    const targetJd = activeJobContext?.jobDescription || jdInput;
    const targetCompany = activeJobContext?.company || companyInput;

    if (fromJob && !hasAutoFormulatedRef.current && (targetRole || targetJd)) {
      hasAutoFormulatedRef.current = true;
      const autoFormulate = async () => {
        setIsFormulating(true);
        try {
          const res = await fetch("/api/ai/formulate-interview-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: "interview",
              role: targetRole || "Software Engineer",
              company: targetCompany || "",
              roundType: "full_loop",
              customFocus: "",
              skill: "",
              experienceLevel: experienceLevel || "Mid-Level",
              jobDescription: targetJd || "",
              resumeText: resumeTextInput || careerProfile?.resumeText || "",
              focusArea: "full",
              persona: selectedPersonaId
            })
          });
          const json = await res.json();
          if (json.success && json.plan) {
            setFormulatedPlan(json.plan);
            setStudioStage("plan-preview");
          }
        } catch (err) {
          console.error("Auto-formulation error:", err);
        } finally {
          setIsFormulating(false);
        }
      };
      autoFormulate();
    }
  }, [fromJob, activeJobContext, roleInput, jdInput, companyInput, experienceLevel, resumeTextInput, careerProfile, selectedPersonaId]);

  // Voice synthesis states & voice bank
  const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [isAudioMuted, setIsAudioMuted] = React.useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = React.useState<string | null>(null);

  // Active Session State
  const [currentRoundIndex, setCurrentRoundIndex] = React.useState(0);
  const [sessionSeconds, setSessionSeconds] = React.useState(0);
  const [interviewerStatus, setInterviewerStatus] = React.useState<"idle" | "speaking" | "listening" | "thinking">("idle");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [candidateInputText, setCandidateInputText] = React.useState("");
  const [turnCount, setTurnCount] = React.useState(1);
  const [isSubmittingTurn, setIsSubmittingTurn] = React.useState(false);

  // Live Solution Scratchpad State (CoderPad / Case Notes)
  const [activeLeftTab, setActiveLeftTab] = React.useState<"video" | "scratchpad">("video");
  const [scratchpadCode, setScratchpadCode] = React.useState<string>(
    "# Write your solution, pseudocode, or case notes here\ndef solve():\n    pass"
  );
  const [scratchpadLang, setScratchpadLang] = React.useState<string>("python");
  const [copiedCode, setCopiedCode] = React.useState<boolean>(false);

  // Media streams
  const [isCameraActive, setIsCameraActive] = React.useState(false);
  const [isMicActive, setIsMicActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [micError, setMicError] = React.useState<string | null>(null);
  const [audioInputLevel, setAudioInputLevel] = React.useState(0);

  // Debrief
  const [isEvaluatingSession, setIsEvaluatingSession] = React.useState(false);
  const [evaluationResult, setEvaluationResult] = React.useState<EvaluationResult | null>(null);
  const [isDebriefModalOpen, setIsDebriefModalOpen] = React.useState(false);
  const [copiedReport, setCopiedReport] = React.useState(false);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const recognitionRef = React.useRef<any>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const animFrameRef = React.useRef<number | null>(null);
  const chatBottomRef = React.useRef<HTMLDivElement | null>(null);

  const currentPersona = PERSONAS.find((p) => p.id === selectedPersonaId) || PERSONAS[0];

  // Load saved resumes for selection
  React.useEffect(() => {
    fetch("/api/resume")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setSavedResumesList(data.data.map((r: any) => ({ id: r.id, title: r.title || "Untitled Resume" })));
        }
      })
      .catch(() => {});
  }, []);

  // Sync when resume draft is selected
  React.useEffect(() => {
    if (!selectedResumeDraftId) return;
    fetch(`/api/resume/${selectedResumeDraftId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.content) {
          const c = data.data.content;
          const bullets = (c.experience || [])
            .map((e: any) => `${e.position} at ${e.company}:\n${e.description}`)
            .join("\n\n");
          const skills = (c.skills || []).map((s: any) => s.name).join(", ");
          setResumeTextInput(`${c.summary || ""}\n\nExperience:\n${bullets}\n\nSkills:\n${skills}`);
        }
      })
      .catch(() => {});
  }, [selectedResumeDraftId]);

  // Load browser voices & attach event listener
  React.useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Auto-scroll transcript
  React.useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, candidateInputText]);

  // Session timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (studioStage === "active") {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [studioStage]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Find distinct voice for persona
  const resolvePersonaVoice = React.useCallback(
    (persona: PersonaConfig): SpeechSynthesisVoice | null => {
      if (availableVoices.length === 0) return null;

      const englishVoices = availableVoices.filter((v) => v.lang.startsWith("en"));
      const voicePool = englishVoices.length > 0 ? englishVoices : availableVoices;

      if (persona.id === "david") {
        // Look for British / UK voice
        const ukVoice = voicePool.find(
          (v) =>
            v.lang.toLowerCase().includes("gb") ||
            v.name.includes("UK") ||
            v.name.includes("Oliver") ||
            v.name.includes("Ryan") ||
            v.name.includes("George") ||
            v.name.includes("Sonia")
        );
        if (ukVoice) return ukVoice;
      }

      if (persona.gender === "female") {
        // Look for Female Voice
        const femaleVoice = voicePool.find((v) => {
          const n = v.name.toLowerCase();
          return (
            n.includes("zira") ||
            n.includes("jenny") ||
            n.includes("aria") ||
            n.includes("samantha") ||
            n.includes("victoria") ||
            n.includes("female") ||
            (persona.id === "maya" && n.includes("natural"))
          );
        });
        if (femaleVoice) return femaleVoice;
      } else {
        // Look for Male Voice
        const maleVoice = voicePool.find((v) => {
          const n = v.name.toLowerCase();
          return (
            n.includes("david") ||
            n.includes("guy") ||
            n.includes("christopher") ||
            n.includes("mark") ||
            n.includes("male") ||
            n.includes("daniel")
          );
        });
        if (maleVoice) return maleVoice;
      }

      // Distribute across pool if specific names not found
      const personaIndex = PERSONAS.findIndex((p) => p.id === persona.id);
      return voicePool[personaIndex % voicePool.length] || voicePool[0];
    },
    [availableVoices]
  );

  // Speak aloud via TTS
  const speakText = React.useCallback(
    (text: string, onEndCallback?: () => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        if (onEndCallback) onEndCallback();
        return;
      }
      if (isAudioMuted || prepMode === "text") {
        if (onEndCallback) onEndCallback();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = currentPersona.rate;
        utterance.pitch = currentPersona.pitch;

        const matchedVoice = resolvePersonaVoice(currentPersona);
        if (matchedVoice) {
          utterance.voice = matchedVoice;
          utterance.lang = matchedVoice.lang;
        } else {
          utterance.lang = currentPersona.id === "david" ? "en-GB" : "en-US";
        }

        utterance.onstart = () => {
          setInterviewerStatus("speaking");
        };

        utterance.onend = () => {
          setInterviewerStatus("listening");
          if (onEndCallback) onEndCallback();
        };

        utterance.onerror = () => {
          setInterviewerStatus("listening");
          if (onEndCallback) onEndCallback();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
        setInterviewerStatus("listening");
        if (onEndCallback) onEndCallback();
      }
    },
    [currentPersona, isAudioMuted, prepMode, resolvePersonaVoice]
  );

  const stopSpeaking = React.useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setInterviewerStatus("listening");
    }
  }, []);

  // Preview Persona Voice in Setup
  const handlePreviewVoice = (persona: PersonaConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    setIsPlayingPreview(persona.id);

    const utterance = new SpeechSynthesisUtterance(persona.testPhrase);
    utterance.rate = persona.rate;
    utterance.pitch = persona.pitch;

    const matchedVoice = resolvePersonaVoice(persona);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = persona.id === "david" ? "en-GB" : "en-US";
    }

    utterance.onend = () => setIsPlayingPreview(null);
    utterance.onerror = () => setIsPlayingPreview(null);

    window.speechSynthesis.speak(utterance);
  };

  // Video callback ref to reliably attach stream as soon as video element mounts in DOM
  const setVideoRef = React.useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && mediaStreamRef.current) {
      if (node.srcObject !== mediaStreamRef.current) {
        node.srcObject = mediaStreamRef.current;
      }
      node.muted = true;
      node.play().catch((err) => {
        console.warn("Video play error in callback ref:", err);
      });
    }
  }, []);

  // Camera Management
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });
      mediaStreamRef.current = stream;
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch (err) {
          console.warn("Video play error:", err);
        }
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera unavailable or permission denied. Studio will continue in voice mode.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const toggleCamera = () => {
    if (isCameraActive) stopCamera();
    else startCamera();
  };

  // Audio Meter for real-time visual feedback
  const startAudioMeter = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(micStream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioInputLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();
    } catch {
      // Audio meter optional
    }
  };

  const stopAudioMeter = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioInputLevel(0);
  };

  // Speech Recognition (Candidate Speech-to-Text)
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Speech recognition is not supported in this browser. You can type answers below.");
      return;
    }

    try {
      setMicError(null);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        if (event.error !== "no-speech") {
          setIsMicActive(false);
        }
      };

      recognition.onend = () => {
        setIsMicActive(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsMicActive(true);
      startAudioMeter();
    } catch (err) {
      console.error("Failed to start mic:", err);
      setMicError("Microphone access denied or unavailable.");
      setIsMicActive(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsMicActive(false);
    stopAudioMeter();
  };

  const toggleMic = () => {
    if (isMicActive) stopListening();
    else startListening();
  };

  // Step 1 -> Step 2: Trigger AI Formulation
  const handleFormulateProcess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (studioMode === "practice") {
      if (!practiceSkillInput.trim()) return;
    } else {
      if (!roleInput.trim()) return;
    }

    const activeRound =
      availableRoundOptions.find((r) => r.id === roundType) ||
      availableRoundOptions[0];

    setIsFormulating(true);
    try {
      const res = await fetch("/api/ai/formulate-interview-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: studioMode,
          role: roleInput.trim(),
          company: isCompanyTargeted ? companyInput.trim() : "",
          roundType,
          roundTitle: activeRound?.label,
          roundDescription: activeRound?.desc,
          roundCategory: activeRound?.category,
          roundDirective: activeRound?.focusDirective,
          customFocus: customFocusTopics.trim(),
          skill: practiceSkillInput.trim(),
          experienceLevel,
          jobDescription: jdInput.trim(),
          resumeText: resumeTextInput.trim(),
          focusArea,
          persona: selectedPersonaId
        })
      });

      const json = await res.json();
      if (json.success && json.plan) {
        setFormulatedPlan(json.plan);
        setStudioStage("plan-preview");
      }
    } catch (err) {
      console.error("Failed to formulate interview plan:", err);
      alert("Could not formulate plan right now. Please verify your connection.");
    } finally {
      setIsFormulating(false);
    }
  };

  // Step 2 -> Step 3: Launch Live Practice Studio
  const handleStartSession = () => {
    setStudioStage("active");
    setCurrentRoundIndex(0);
    setSessionSeconds(0);
    setTurnCount(1);

    const firstQuestion =
      formulatedPlan?.rounds[0]?.openingQuestion ||
      (studioMode === "practice"
        ? `Let's drill into ${practiceSkillInput || "this core skill"}. Walk me through how you approach designing a production-grade implementation, and what the single most critical trade-off is.`
        : `Thank you for taking the time to meet today. To kick off our discussion for the ${roleInput || "target"} role${companyInput ? ` at ${companyInput}` : ""}, could you give me a brief overview of your background and walk me through a high-impact project relevant to this position?`);

    const initialMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "interviewer",
      content: firstQuestion,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages([initialMsg]);

    if (prepMode === "voice") {
      startCamera();
      speakText(firstQuestion, () => {
        startListening();
      });
    }
  };

  // Handle Candidate Submitting Turn
  const handleSendTurn = async () => {
    const textToSend = candidateInputText.trim();
    if (!textToSend || isSubmittingTurn) return;

    stopListening();

    const candidateMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "candidate",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...messages, candidateMsg];
    setMessages(updatedMessages);
    setCandidateInputText("");
    setIsSubmittingTurn(true);
    setInterviewerStatus("thinking");

    // Advance round if needed (3 rounds total over ~6 turns in full interview)
    const nextTurn = turnCount + 1;
    let nextRoundIdx = currentRoundIndex;
    if (studioMode === "interview") {
      if (nextTurn === 3 && (formulatedPlan?.rounds.length || 0) > 1) {
        nextRoundIdx = 1;
        setCurrentRoundIndex(1);
      } else if (nextTurn === 5 && (formulatedPlan?.rounds.length || 0) > 2) {
        nextRoundIdx = 2;
        setCurrentRoundIndex(2);
      }
    }

    const activeRound =
      availableRoundOptions.find((r) => r.id === roundType) ||
      availableRoundOptions[0];

    try {
      const res = await fetch("/api/ai/interview-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleInput,
          company: isCompanyTargeted ? companyInput.trim() : "",
          roundType,
          roundTitle: activeRound?.label,
          roundDescription: activeRound?.desc,
          roundCategory: activeRound?.category,
          roundDirective: activeRound?.focusDirective,
          customFocus: customFocusTopics.trim(),
          scratchpadCode: scratchpadCode.trim(),
          scratchpadLanguage: scratchpadLang,
          skill: practiceSkillInput,
          jobDescription: jdInput,
          resumeText: resumeTextInput,
          persona: selectedPersonaId,
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          turnCount: nextTurn,
          currentRound: nextRoundIdx + 1,
          rounds: formulatedPlan?.rounds || [],
          mode: prepMode
        })
      });

      const json = await res.json();
      const replyText =
        json.reply ||
        "That is a very structured explanation. Could you walk me through the specific metrics you achieved?";

      const aiReplyMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "interviewer",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiReplyMsg]);
      setTurnCount(nextTurn);

      if (prepMode === "voice") {
        speakText(replyText, () => {
          startListening();
        });
      } else {
        setInterviewerStatus("idle");
      }
    } catch (err) {
      console.error("Conversation error:", err);
      setInterviewerStatus("idle");
    } finally {
      setIsSubmittingTurn(false);
    }
  };

  // Conclude & Generate Debrief Report
  const handleConcludeSession = async () => {
    stopSpeaking();
    stopListening();
    stopCamera();

    if (messages.length < 2) {
      setStudioStage("setup");
      return;
    }

    setIsEvaluatingSession(true);
    try {
      const res = await fetch("/api/ai/evaluate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: studioMode === "practice" ? `${practiceSkillInput} Mastery` : roleInput,
          messages: messages.map((m) => ({ role: m.role, content: m.content }))
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setEvaluationResult(json.data);
        setIsDebriefModalOpen(true);

        const detectedGap =
          json.data.detectedEvidenceGap ||
          json.data.areasForImprovement?.[0] ||
          "Could not provide concrete technical trade-offs or production metrics.";
        const primaryWeakness =
          json.data.areasForImprovement?.[0]?.replace(/^Weakness in\s*/i, "") ||
          (studioMode === "practice" ? practiceSkillInput : "System Architecture");

        recordDetectedInterviewGap({
          id: `eval-${Date.now()}`,
          role: studioMode === "practice" ? `${practiceSkillInput} Mastery` : roleInput,
          skillName: primaryWeakness,
          detectedProblem: detectedGap,
          feedback: json.data.feedback || "Evidence gap detected during interview debrief.",
          recommendedAction: json.data.nextBestAction || `Practice ${primaryWeakness}`,
          timestamp: new Date().toISOString()
        });

        try {
          localStorage.setItem(
            STORAGE_KEYS.LAST_INTERVIEW_EVAL,
            JSON.stringify({
              score: json.data.score,
              date: new Date().toISOString(),
              role: studioMode === "practice" ? `${practiceSkillInput} Mastery` : roleInput,
              strong: json.data.keyStrengths || [],
              weak: json.data.areasForImprovement || [],
              detectedEvidenceGap: detectedGap,
              nextBestAction: json.data.nextBestAction || `Practice ${primaryWeakness}`
            })
          );
        } catch {}

        if (setPendingImprovement) {
          setPendingImprovement({
            type: "uplift",
            title: `Address interview feedback: ${primaryWeakness}`,
            description: detectedGap,
            details: `Evidence gap detected during interview debrief. Strengthen your project evidence and update your resume before applying.`,
            targetSection: "experience"
          });
        }
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
      alert("Failed to compile diagnostic debrief. Please check your connection.");
    } finally {
      setIsEvaluatingSession(false);
      setStudioStage("setup");
    }
  };

  // Copy Full Debrief Report
  const handleCopyReport = () => {
    if (!evaluationResult) return;
    const reportText = `HICEJO PERFORMANCE DEBRIEF
Topic: ${studioMode === "practice" ? `Skill Sparring on ${practiceSkillInput}` : roleInput}
Interviewer: ${currentPersona.name} (${studioMode === "practice" ? "Skill Practice Evaluator" : `${roleInput || "Role"} Interviewer`})
Date: ${new Date().toLocaleDateString()}
Duration: ${formatTimer(sessionSeconds)}

OVERALL SCORE: ${evaluationResult.score}/100 — ${evaluationResult.hiringRecommendation.toUpperCase()}
Executive Summary: ${evaluationResult.feedback}

STAR METHOD BREAKDOWN:
- Situation (${evaluationResult.starScores.situation}%): ${evaluationResult.starAnalysis.s}
- Task (${evaluationResult.starScores.task}%): ${evaluationResult.starAnalysis.t}
- Action (${evaluationResult.starScores.action}%): ${evaluationResult.starAnalysis.a}
- Result (${evaluationResult.starScores.result}%): ${evaluationResult.starAnalysis.r}

COMMUNICATION METRICS:
- Clarity: ${evaluationResult.communicationMetrics.clarity}
- Pacing: ${evaluationResult.communicationMetrics.pacing}
- Filler Words: ${evaluationResult.communicationMetrics.fillerWords}
- Confidence: ${evaluationResult.communicationMetrics.confidence}

KEY STRENGTHS:
${evaluationResult.keyStrengths.map((s) => `• ${s}`).join("\n")}

AREAS FOR IMPROVEMENT:
${evaluationResult.areasForImprovement.map((a) => `• ${a}`).join("\n")}
`;
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
      stopCamera();
    };
  }, [stopSpeaking]);

  return (
    <DashboardShell title="Interview & Skill Practice Studio">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* ========================================================================= */}
        {/* STAGE 1: SETUP & CONFIGURATION SCREEN                                     */}
        {/* ========================================================================= */}
        {studioStage === "setup" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {studioMode === "practice" ? "Targeted Skill Sparring" : "Full Mock Interview Studio"}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {studioMode === "practice"
                    ? "Interactive, conversational sparring focused solely on mastering a specific technical skill."
                    : "Formulates a tailored 3-round interview loop based on your target role, resume, and optional JD."}
                </p>
              </div>

              {/* Prep Mode Pill (Voice vs Text) */}
              <div className="flex items-center p-0.5 rounded-lg bg-secondary border border-border/70 shrink-0 self-start sm:self-auto text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setPrepMode("voice")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    prepMode === "voice"
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>Voice Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrepMode("text")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    prepMode === "text"
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Keyboard className="h-3.5 w-3.5" />
                  <span>Text Mode</span>
                </button>
              </div>
            </div>

            {/* Active Target Job Context Indicator */}
            {activeJobContext && (activeJobContext.company || activeJobContext.jobTitle) && (
              <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 flex items-center justify-between text-xs text-primary font-medium shadow-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <Target className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    Interview Studio Grounded in Target Job: <strong>{roleInput || activeJobContext.jobTitle}</strong> {(companyInput || activeJobContext.company) ? `@ ${companyInput || activeJobContext.company}` : ""}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/20 px-2 py-0.5 rounded">
                  JD Connected
                </span>
              </div>
            )}

            {/* Loading Indicator during formulation */}
            {isFormulating && (
              <Card className="p-8 border-primary/30 bg-primary/5 flex flex-col items-center justify-center space-y-3 text-center">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">
                    Formulating Tailored Interview Sections for {roleInput}{companyInput ? ` @ ${companyInput}` : ""}...
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Analyzing Job Description requirements, extracting domain competencies, and constructing customized interview rounds.
                  </p>
                </div>
              </Card>
            )}

            {/* Currently Formulated Plan Card in Setup */}
            {formulatedPlan && !isFormulating && (
              <Card className="p-5 border-primary/30 bg-primary/5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-primary/20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <div>
                      <h3 className="text-xs font-bold text-foreground">
                        Tailored Interview Plan Formulated ({formulatedPlan.rounds.length} Rounds)
                      </h3>
                      <p className="text-[11px] text-muted-foreground">{formulatedPlan.title}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setStudioStage("plan-preview")}
                    className="text-xs h-8 px-3 font-semibold bg-primary text-primary-foreground cursor-pointer shadow-xs"
                  >
                    <span>View Plan Preview &rarr;</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {formulatedPlan.rounds.map((r) => (
                    <div key={r.roundNumber} className="p-3 rounded-lg border border-border/80 bg-card space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          Round {r.roundNumber}
                        </span>
                        <span className="text-xs font-semibold text-foreground truncate">{r.title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{r.objective}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Studio Mode Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-secondary/60 rounded-lg border border-border/70 w-fit text-xs font-medium">
              <button
                type="button"
                onClick={() => setStudioMode("interview")}
                className={`px-3.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
                  studioMode === "interview"
                    ? "bg-card text-foreground font-bold shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Target className="h-3.5 w-3.5" />
                <span>Full Mock Interview</span>
              </button>
              <button
                type="button"
                onClick={() => setStudioMode("practice")}
                className={`px-3.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
                  studioMode === "practice"
                    ? "bg-card text-foreground font-bold shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Skill Sparring Practice</span>
              </button>
            </div>

            {/* MODE A: SKILL SPARRING FORM */}
            {studioMode === "practice" && (
              <form onSubmit={handleFormulateProcess} className="space-y-6">
                <Card className="p-6 border-border/70 bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>Skill to Practice</span>
                    </h2>
                    {careerProfile?.targetRole && (
                      <span className="text-[11px] text-muted-foreground">
                        Role: <strong className="text-foreground">{careerProfile.targetRole}</strong>
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">Skill / Topic Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. System Design & Sharding, React Server Components, Dynamic Programming, Kafka Event Streams"
                      value={practiceSkillInput}
                      onChange={(e) => setPracticeSkillInput(e.target.value)}
                      className="w-full h-10 rounded-xl border border-border bg-transparent px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />

                    {/* Quick Suggestions from matching role */}
                    {(() => {
                      const matchedRole = POPULAR_ROLES.find(
                        (r) =>
                          careerProfile?.targetRole &&
                          r.title.toLowerCase().includes(careerProfile.targetRole.toLowerCase().slice(0, 5))
                      ) || POPULAR_ROLES[0];
                      return (
                        <div className="pt-1.5 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Suggested skills:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {matchedRole.commonSkills.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setPracticeSkillInput(s)}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors cursor-pointer border border-border/60"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Experience Level & Focus Track */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Target Seniority Level</label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full h-9.5 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                      >
                        <option value="Entry-Level (0-2 yrs)">Entry-Level (0-2 yrs)</option>
                        <option value="Mid-Level (2-5 yrs)">Mid-Level (2-5 yrs)</option>
                        <option value="Senior (5-8 yrs)">Senior (5-8 yrs)</option>
                        <option value="Lead / Staff (8+ yrs)">Lead / Staff (8+ yrs)</option>
                        <option value="Executive / Principal">Executive / Principal</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Sparring Depth</label>
                      <select
                        value={focusArea}
                        onChange={(e) => setFocusArea(e.target.value as any)}
                        className="w-full h-9.5 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                      >
                        <option value="comprehensive">Comprehensive Mastery & Architecture</option>
                        <option value="technical">Hands-on Implementation & Code Reasoning</option>
                        <option value="architecture">Scalability, Trade-Offs & Edge Cases</option>
                        <option value="behavioral">Production Incident & Trade-Off Delivery</option>
                      </select>
                    </div>
                  </div>
                </Card>

                {/* Voice Selection */}
                <Card className="p-6 border-border/70 bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-primary" />
                        <span>Select Voice Option</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Choose your preferred AI speaking voice and audio pacing. Click &ldquo;Preview Voice&rdquo; to test.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {PERSONAS.map((persona) => {
                      const isSelected = selectedPersonaId === persona.id;
                      const isPreviewing = isPlayingPreview === persona.id;

                      return (
                        <div
                          key={persona.id}
                          onClick={() => setSelectedPersonaId(persona.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                            isSelected
                              ? "bg-primary/5 border-primary ring-1 ring-primary/30 shadow-xs"
                              : "bg-muted/20 border-border/70 hover:bg-muted/40 hover:border-border"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`h-8 w-8 rounded-lg ${persona.avatarBg} font-black text-xs flex items-center justify-center shrink-0`}>
                                {persona.name[0]}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-xs font-bold text-foreground truncate">{persona.name}</h3>
                                <p className="text-[10px] text-muted-foreground truncate">{persona.accent}</p>
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                          </div>

                          <div className="text-[11px] text-muted-foreground space-y-1">
                            <p className="font-semibold text-foreground">{persona.voiceStyle}</p>
                            <p className="text-[10px] text-muted-foreground">{persona.gender === "male" ? "Male Voice" : "Female Voice"}</p>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t border-border/40">
                            <button
                              type="button"
                              onClick={(e) => handlePreviewVoice(persona, e)}
                              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Volume2 className={`h-3 w-3 ${isPreviewing ? "animate-bounce text-primary" : ""}`} />
                              <span>{isPreviewing ? "Speaking..." : "Preview Voice"}</span>
                            </button>
                            <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">
                              {isSelected ? "Selected" : "Select"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isFormulating || !practiceSkillInput.trim()}
                    className="h-11 px-6 font-bold text-xs bg-primary text-primary-foreground shadow-md shadow-primary/20 gap-2 cursor-pointer"
                  >
                    {isFormulating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Formulating Sparring Session...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Launch Skill Sparring Session</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* MODE B: FULL MOCK INTERVIEW FORM */}
            {studioMode === "interview" && (
              <form onSubmit={handleFormulateProcess} className="space-y-6">
                {/* 1. Target Role & Company Context */}
                <Card className="p-6 border-border/70 bg-card space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span>1. Target Position & Company</span>
                    </h2>

                    {/* Company Mode Toggle */}
                    <div className="flex items-center p-0.5 rounded-lg bg-secondary border border-border/70 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsCompanyTargeted(false)}
                        className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                          !isCompanyTargeted
                            ? "bg-card text-foreground font-bold shadow-xs border border-border/50"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        General Role Interview
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCompanyTargeted(true)}
                        className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                          isCompanyTargeted
                            ? "bg-primary text-primary-foreground font-bold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Building2 className="h-3 w-3" />
                        <span>Specific Company Loop</span>
                      </button>
                    </div>
                  </div>

                  {/* Company Input if Targeted */}
                  {isCompanyTargeted && (
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-primary" />
                            <span>Target Company Name *</span>
                          </label>
                          <span className="text-[10px] text-muted-foreground">Simulates their exact hiring loop & bar</span>
                        </div>
                        <input
                          type="text"
                          required={isCompanyTargeted}
                          placeholder="e.g. Google, Amazon, Meta, Stripe, Netflix, Apple, Uber, or any startup"
                          value={companyInput}
                          onChange={(e) => setCompanyInput(e.target.value)}
                          className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>

                      {/* Quick Company Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] text-muted-foreground font-medium mr-1">Popular hiring loops:</span>
                        {["Google", "Amazon", "Meta", "Microsoft", "Stripe", "Netflix", "Apple", "Uber", "YC Startup"].map((comp) => (
                          <button
                            key={comp}
                            type="button"
                            onClick={() => setCompanyInput(comp)}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                              companyInput.toLowerCase() === comp.toLowerCase()
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/40"
                            }`}
                          >
                            {comp}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Target Role Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior Software Engineer, Full Stack Lead"
                        value={roleInput}
                        onChange={(e) => setRoleInput(e.target.value)}
                        className="w-full h-9.5 rounded-xl border border-border bg-transparent px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      {/* Quick Suggestions */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {["SDE", "Software Engineer", "Full Stack Developer", "Product Manager", "Data Analyst", "Data Scientist"].map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setRoleInput(role)}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Experience Level</label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full h-9.5 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                      >
                        <option value="Entry-Level (0-2 yrs)">Entry-Level (0-2 yrs)</option>
                        <option value="Mid-Level (2-5 yrs)">Mid-Level (2-5 yrs)</option>
                        <option value="Senior (5-8 yrs)">Senior (5-8 yrs)</option>
                        <option value="Lead / Staff (8+ yrs)">Lead / Staff (8+ yrs)</option>
                        <option value="Executive / Principal">Executive / Principal</option>
                      </select>
                    </div>
                  </div>

                  {/* Round Isolation Selector */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <ListOrdered className="h-3.5 w-3.5 text-primary" />
                        <span>Select Interview Round Type</span>
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        {isCompanyTargeted && companyInput.trim() ? `${companyInput.trim()} Specific • ` : ""}
                        Tailored for {roleInput.trim() || "Target Role"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
                      {availableRoundOptions.map((item) => {
                        const isSelected = roundType === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setRoundType(item.id);
                              // Sync focusArea for backward compatibility
                              if (item.category === "technical") setFocusArea("technical");
                              else if (item.category === "system_design") setFocusArea("system-design");
                              else if (item.category === "behavioral" || item.category === "managerial") setFocusArea("behavioral");
                              else setFocusArea("full");
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                              isSelected
                                ? "bg-primary/5 border-primary ring-1 ring-primary/30 shadow-xs"
                                : "bg-muted/20 border-border/70 hover:bg-muted/40 hover:border-border text-foreground"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-bold text-foreground leading-snug">{item.label}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}>
                                {item.tag}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">
                              {item.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {/* Pre-Interview Focus & Known Questions (Optional) */}
                <Card className="p-6 border-border/70 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>2. Custom Focus & Past Questions (Optional)</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tell the interviewer what to drill into, or paste frequently asked questions from LeetCode, Glassdoor, or your recruiter prep email.
                      </p>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Optional
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="e.g. 'Focus heavily on Kafka, distributed locks, and database indexing', or paste known questions: 'Design a thread-safe LRU cache', 'Explain how you handled a production outage with data loss'..."
                    value={customFocusTopics}
                    onChange={(e) => setCustomFocusTopics(e.target.value)}
                    className="w-full rounded-xl border border-border bg-transparent p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed font-sans resize-none"
                  />
                </Card>

                {/* Candidate Resume & Optional JD */}
                <Card className="p-6 border-border/70 bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>3. Resume & Job Description Grounding</span>
                    </h2>
                    <span className="text-[11px] text-muted-foreground">Tailors questions to your exact background</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Candidate Resume */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">Candidate Resume / Background</label>
                        {savedResumesList.length > 0 && (
                          <select
                            value={selectedResumeDraftId}
                            onChange={(e) => setSelectedResumeDraftId(e.target.value)}
                            className="text-[10px] font-semibold bg-muted px-2 py-0.5 rounded border border-border text-foreground cursor-pointer"
                          >
                            <option value="">Load from saved draft...</option>
                            {savedResumesList.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.title}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <textarea
                        rows={5}
                        placeholder="Paste your resume summary, bullets, or achievements here (or select draft above)..."
                        value={resumeTextInput}
                        onChange={(e) => setResumeTextInput(e.target.value)}
                        className="w-full rounded-xl border border-border bg-transparent p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed font-sans resize-none"
                      />
                    </div>

                    {/* Job Description (Optional) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">Job Description (JD)</label>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {jdInput.length > 0 ? `${jdInput.length.toLocaleString()} characters` : "Optional"}
                        </span>
                      </div>
                      <textarea
                        rows={6}
                        placeholder="Paste the job description or role requirements here to tailor questions..."
                        value={jdInput}
                        onChange={(e) => setJdInput(e.target.value)}
                        className="w-full rounded-xl border border-border bg-transparent p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed font-sans resize-y min-h-[110px]"
                      />
                    </div>
                  </div>
                </Card>

                {/* Voice Selection */}
                <Card className="p-6 border-border/70 bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-primary" />
                        <span>4. Choose Voice Option</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Select your preferred AI speaking voice and audio pacing. Click &ldquo;Preview Voice&rdquo; to test.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {PERSONAS.map((persona) => {
                      const isSelected = selectedPersonaId === persona.id;
                      const isPreviewing = isPlayingPreview === persona.id;

                      return (
                        <div
                          key={persona.id}
                          onClick={() => setSelectedPersonaId(persona.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                            isSelected
                              ? "bg-primary/5 border-primary ring-1 ring-primary/30 shadow-xs"
                              : "bg-muted/20 border-border/70 hover:bg-muted/40 hover:border-border"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`h-8 w-8 rounded-lg ${persona.avatarBg} font-black text-xs flex items-center justify-center shrink-0`}>
                                {persona.name[0]}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-xs font-bold text-foreground truncate">{persona.name}</h3>
                                <p className="text-[10px] text-muted-foreground truncate">{persona.accent}</p>
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                          </div>

                          <div className="text-[11px] text-muted-foreground space-y-1">
                            <p className="font-semibold text-foreground">{persona.voiceStyle}</p>
                            <p className="text-[10px] text-muted-foreground">{persona.gender === "male" ? "Male Voice" : "Female Voice"}</p>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t border-border/40">
                            <button
                              type="button"
                              onClick={(e) => handlePreviewVoice(persona, e)}
                              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Volume2 className={`h-3 w-3 ${isPreviewing ? "animate-bounce text-primary" : ""}`} />
                              <span>{isPreviewing ? "Speaking..." : "Preview Voice"}</span>
                            </button>
                            <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">
                              {isSelected ? "Selected" : "Select"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Formulate Action Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isFormulating || !roleInput.trim()}
                    className="h-11 px-6 font-bold text-xs bg-primary text-primary-foreground shadow-md shadow-primary/20 gap-2 cursor-pointer"
                  >
                    {isFormulating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Formulating Custom Interview Plan...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Formulate Interview Plan</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: FORMULATED PLAN PREVIEW & START BUTTON                           */}
        {/* ========================================================================= */}
        {studioStage === "plan-preview" && formulatedPlan && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStudioStage("setup")}
                  className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Plan Formulated Successfully
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
                    {formulatedPlan.title}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleStartSession}
                  className="h-11 px-6 font-bold text-xs bg-primary text-primary-foreground shadow-md shadow-primary/20 gap-2 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Start Session Now</span>
                </Button>
              </div>
            </div>

            <Card className="p-6 border-border/70 bg-card space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span>Executive Strategy & Target Competencies</span>
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {formulatedPlan.overview}
              </p>

              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Core Competencies Tested in this Loop:
                </span>
                <div className="flex flex-wrap gap-2">
                  {formulatedPlan.targetCompetencies.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Rounds Outline */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-primary" />
                <span>Session Structure ({formulatedPlan.rounds.length} Round{formulatedPlan.rounds.length > 1 ? "s" : ""})</span>
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {formulatedPlan.rounds.map((round) => (
                  <Card key={round.roundNumber} className="p-5 border-border/70 bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-black text-xs">
                          {round.roundNumber}
                        </span>
                        <h3 className="text-xs font-bold text-foreground">{round.title}</h3>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ~{round.roundNumber === 1 ? "4-5" : "5-6"} min
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-8">
                      <strong>Focus:</strong> {round.objective}
                    </p>
                    <div className="pl-8 pt-1">
                      <p className="text-[11px] text-muted-foreground italic bg-muted/30 p-2.5 rounded-lg border border-border/60">
                        &quot;{round.openingQuestion}&quot;
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Tactical Tips */}
            <Card className="p-5 border-border/70 bg-card space-y-2.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Tactical Preparation Guidelines</span>
              </span>
              <ul className="text-xs text-muted-foreground space-y-1.5 pl-6 list-disc">
                {formulatedPlan.preparationTips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">{tip}</li>
                ))}
              </ul>
            </Card>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setStudioStage("setup")}
                className="text-xs font-semibold cursor-pointer"
              >
                Back to Configuration
              </Button>
              <Button
                onClick={handleStartSession}
                className="h-11 px-8 font-bold text-xs bg-primary text-primary-foreground shadow-md shadow-primary/20 gap-2 cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Launch Active Studio</span>
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: ACTIVE LIVE SESSION                                              */}
        {/* ========================================================================= */}
        {studioStage === "active" && (
          <div className="space-y-4">
            {/* Top Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl ${currentPersona.avatarBg} font-black text-xs flex items-center justify-center shrink-0`}>
                  {currentPersona.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{currentPersona.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      ({studioMode === "practice" ? "Practice Evaluator" : `${roleInput || "Role"} Interviewer`}) • {currentPersona.voiceStyle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                      {interviewerStatus === "speaking" ? "Interviewer Speaking..." : interviewerStatus === "thinking" ? "Analyzing your answer..." : "Listening to Candidate"}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {studioMode === "practice" ? `Sparring: ${practiceSkillInput || "Skill"}` : `Round ${currentRoundIndex + 1} of ${formulatedPlan?.rounds.length || 3}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted font-mono text-xs font-bold text-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>{formatTimer(sessionSeconds)}</span>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleConcludeSession}
                  disabled={isEvaluatingSession}
                  className="h-8 text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>{isEvaluatingSession ? "Evaluating..." : "Finish & Debrief"}</span>
                </Button>
              </div>
            </div>

            {/* Split Screen Studio: Left Mirror / Right Transcript */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Video Mirror or Live Solution Pad (5 cols) */}
              <div className="lg:col-span-5 space-y-2.5">
                {/* Mode Selector: Camera Mirror vs Live Solution Pad */}
                <div className="flex items-center justify-between p-1 bg-muted/60 rounded-xl border border-border/80 text-xs">
                  <div className="flex items-center gap-1 w-full">
                    <button
                      type="button"
                      onClick={() => setActiveLeftTab("video")}
                      className={`flex-1 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeLeftTab === "video"
                          ? "bg-card text-foreground shadow-xs border border-border/60"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Video className="h-3.5 w-3.5 text-primary" />
                      <span>Camera Mirror</span>
                      {isCameraActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLeftTab("scratchpad")}
                      className={`flex-1 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeLeftTab === "scratchpad"
                          ? "bg-card text-foreground shadow-xs border border-border/60"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Code className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Live Solution Pad</span>
                      {scratchpadCode.trim().length > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tab 1: Video Mirror */}
                {activeLeftTab === "video" && (
                  <div className="relative aspect-4/3 rounded-2xl bg-zinc-950 border border-border/80 overflow-hidden flex items-center justify-center shadow-inner">
                    {/* Native Video Mirror */}
                    <video
                      ref={setVideoRef}
                      playsInline
                      autoPlay
                      muted
                      className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                        isCameraActive ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                      onLoadedMetadata={(e) => {
                        (e.target as HTMLVideoElement).play().catch(() => {});
                      }}
                    />

                    {/* Fallback Placeholder when Camera Off */}
                    {!isCameraActive && (
                      <div className="text-center p-6 space-y-2 text-zinc-400">
                        <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                          <User className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-semibold text-zinc-300">Camera is Inactive</p>
                        <p className="text-[11px] text-zinc-500 max-w-[200px] mx-auto">
                          Turn on your camera to verify posture, eye contact, and executive presence.
                        </p>
                      </div>
                    )}

                    {/* Audio Volume Wave Overlay */}
                    {isMicActive && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-xs border border-white/10 text-white text-[11px]">
                        <Mic className="h-3 w-3 text-emerald-400 animate-pulse shrink-0" />
                        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 transition-all duration-75"
                            style={{ width: `${audioInputLevel}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-zinc-300">Speaking</span>
                      </div>
                    )}

                    {/* Camera Error Message */}
                    {cameraError && (
                      <div className="absolute top-3 left-3 right-3 p-2 rounded-lg bg-destructive/80 text-white text-[10px] font-medium backdrop-blur-xs flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-2">{cameraError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Live Solution Pad (CoderPad / Case Notes) */}
                {activeLeftTab === "scratchpad" && (
                  <div className="rounded-2xl bg-zinc-950 border border-border/80 overflow-hidden flex flex-col shadow-inner h-[370px]">
                    {/* Scratchpad Header Toolbar */}
                    <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Code className="h-3.5 w-3.5 text-indigo-400" />
                        <select
                          value={scratchpadLang}
                          onChange={(e) => setScratchpadLang(e.target.value)}
                          className="bg-zinc-800 text-zinc-200 text-[11px] font-mono rounded px-2 py-0.5 border border-zinc-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="python">Python</option>
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                          <option value="sql">SQL</option>
                          <option value="go">Go</option>
                          <option value="text">Notes / Case Outline</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (!scratchpadCode.trim()) return;
                            const snippet = `\`\`\`${scratchpadLang}\n${scratchpadCode.trim()}\n\`\`\`\n`;
                            setCandidateInputText((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 font-medium transition cursor-pointer"
                          title="Paste this code block directly into your response text box"
                        >
                          Insert in Answer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(scratchpadCode);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 1500);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white font-medium transition cursor-pointer flex items-center gap-1"
                        >
                          {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedCode ? "Copied" : "Copy"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setScratchpadCode("")}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                          title="Clear code editor"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Textarea Code Editor */}
                    <div className="relative flex-1 p-2 bg-zinc-950">
                      <textarea
                        value={scratchpadCode}
                        onChange={(e) => setScratchpadCode(e.target.value)}
                        placeholder={
                          scratchpadLang === "text"
                            ? "// Write your framework, assumptions, or unit economics here..."
                            : `// Write your ${scratchpadLang} algorithm or query here...\n// The AI interviewer automatically inspects this scratchpad upon your reply.`
                        }
                        spellCheck={false}
                        autoCapitalize="off"
                        autoCorrect="off"
                        className="w-full h-full bg-transparent resize-none font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden leading-relaxed p-1"
                      />
                    </div>

                    {/* Footer Tip */}
                    <div className="px-3 py-1.5 bg-zinc-900/70 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1 text-emerald-400/90 font-medium">
                        <Sparkles className="h-3 w-3" />
                        Interviewer analyzes this live during each turn
                      </span>
                      <span className="font-mono text-zinc-500">{scratchpadCode.length} chars</span>
                    </div>
                  </div>
                )}

                {/* Media Control Toolbar (Always visible below both tabs) */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-card border border-border/80">
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={toggleCamera}
                      className={`h-8 px-2.5 text-xs font-semibold gap-1.5 cursor-pointer ${
                        isCameraActive ? "border-primary/50 text-primary bg-primary/5" : "text-muted-foreground"
                      }`}
                    >
                      {isCameraActive ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{isCameraActive ? "Camera On" : "Camera Off"}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={toggleMic}
                      className={`h-8 px-2.5 text-xs font-semibold gap-1.5 cursor-pointer ${
                        isMicActive ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/5" : "text-muted-foreground"
                      }`}
                    >
                      {isMicActive ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{isMicActive ? "Mic On" : "Mic Off"}</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAudioMuted(!isAudioMuted)}
                      className="h-8 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                      title={isAudioMuted ? "Unmute AI voice" : "Mute AI voice"}
                    >
                      {isAudioMuted ? <VolumeX className="h-4 w-4 text-destructive" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right: Live Transcript & Interaction Console (7 cols) */}
              <div className="lg:col-span-7 flex flex-col h-[520px] rounded-2xl bg-card border border-border/80 shadow-xs overflow-hidden">
                {/* Transcript Header */}
                <div className="px-4 py-2.5 border-b border-border/60 bg-muted/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <span className="font-bold text-foreground">Interactive Session Transcript</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Turn {turnCount}
                  </span>
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                  {messages.map((msg) => {
                    const isAi = msg.role === "interviewer";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="font-bold text-[11px] text-foreground">
                            {isAi ? currentPersona.name : "You (Candidate)"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">{msg.timestamp}</span>
                        </div>
                        <div
                          className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                            isAi
                              ? "bg-muted/40 border border-border/60 text-foreground"
                              : "bg-primary text-primary-foreground font-medium shadow-xs"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}

                  {/* Thinking Indicator */}
                  {interviewerStatus === "thinking" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-xl bg-muted/20 border border-border/40 w-fit">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span>{currentPersona.name} is evaluating your answer and formulating a follow-up...</span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Candidate Answer Input Console */}
                <div className="p-3 border-t border-border/60 bg-muted/10 space-y-2">
                  {micError && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{micError}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <textarea
                      rows={2}
                      placeholder={
                        isMicActive
                          ? "Listening to your voice... (you can also edit or type here)"
                          : "Type your answer or click the microphone to speak..."
                      }
                      value={candidateInputText}
                      onChange={(e) => setCandidateInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendTurn();
                        }
                      }}
                      className="flex-1 rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-sans"
                    />

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button
                        type="button"
                        onClick={handleSendTurn}
                        disabled={!candidateInputText.trim() || isSubmittingTurn}
                        className="h-9 px-3.5 font-bold text-xs bg-primary text-primary-foreground gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send</span>
                      </Button>

                      <button
                        type="button"
                        onClick={toggleMic}
                        className={`h-7 px-2 rounded-lg text-[10px] font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          isMicActive
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-card text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        <Mic className="h-3 w-3" />
                        <span>{isMicActive ? "Mute" : "Speak"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DEBRIEF MODAL                                                             */}
        {/* ========================================================================= */}
        {isDebriefModalOpen && evaluationResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 text-foreground space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Hicejo Interview Studio
                  </span>
                  <h2 className="text-lg font-black text-foreground uppercase tracking-tight">
                    INTERVIEW REPORT
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-foreground">
                    Overall: <span className="text-primary">{evaluationResult.score}/100</span>
                  </div>
                  <span className="inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    {evaluationResult.hiringRecommendation}
                  </span>
                </div>
              </div>

              {/* Strong vs Weak Competencies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    Strong:
                  </span>
                  <ul className="space-y-1.5 text-foreground text-xs">
                    {evaluationResult.keyStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                    Weak:
                  </span>
                  <ul className="space-y-1.5 text-foreground text-xs">
                    {evaluationResult.areasForImprovement.map((a, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detected Evidence Gap */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block font-mono">
                  Detected Evidence Gap:
                </span>
                <p className="text-xs font-medium text-foreground italic leading-relaxed">
                  &ldquo;{evaluationResult.detectedEvidenceGap || evaluationResult.areasForImprovement?.[0] || "Could not explain the architecture of the project listed on your resume in sufficient depth."}&rdquo;
                </p>
              </div>

              {/* NEXT BEST ACTION Card */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    NEXT BEST ACTION
                  </span>
                  <span className="text-[10px] text-muted-foreground">Highest-leverage fix</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {evaluationResult.nextBestAction || `Practice ${evaluationResult.areasForImprovement?.[0]?.replace(/^Weakness in\s*/i, "") || "System Architecture"}`}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Directly drill into this weak area to build verifiable conceptual and implementation proof.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      const skillToPractice =
                        evaluationResult.areasForImprovement?.[0]?.replace(/^Weakness in\s*/i, "") ||
                        (studioMode === "practice" ? practiceSkillInput : "System Architecture");
                      setStudioMode("practice");
                      setPracticeSkillInput(skillToPractice);
                      setIsDebriefModalOpen(false);
                      setStudioStage("setup");
                    }}
                    className="h-8.5 px-3.5 text-xs font-bold bg-primary text-primary-foreground gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    <span>Practice Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* STAR Breakdown */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block font-mono">
                  STAR Method Competency Breakdown
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-muted/20 border border-border/60">
                    <span className="text-base font-black text-foreground block">{evaluationResult.starScores.situation}%</span>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">Situation</span>
                  </div>
                  <div className="p-2 rounded-xl bg-muted/20 border border-border/60">
                    <span className="text-base font-black text-foreground block">{evaluationResult.starScores.task}%</span>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">Task</span>
                  </div>
                  <div className="p-2 rounded-xl bg-muted/20 border border-border/60">
                    <span className="text-base font-black text-foreground block">{evaluationResult.starScores.action}%</span>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">Action</span>
                  </div>
                  <div className="p-2 rounded-xl bg-muted/20 border border-border/60">
                    <span className="text-base font-black text-foreground block">{evaluationResult.starScores.result}%</span>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">Result</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyReport}
                  className="text-xs h-8.5 gap-1.5 font-semibold cursor-pointer"
                >
                  {copiedReport ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedReport ? "Report Copied!" : "Copy Full Report"}</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDebriefModalOpen(false)}
                    className="text-xs h-8.5 font-semibold cursor-pointer"
                  >
                    Close
                  </Button>
                  <Link href="/dashboard/builder">
                    <Button
                      size="sm"
                      className="text-xs h-8.5 font-bold bg-primary text-primary-foreground gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>Update Resume</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function InterviewStudioPage() {
  return (
    <React.Suspense
      fallback={
        <DashboardShell title="Interview Studio">
          <div className="p-12 text-center text-xs text-muted-foreground">
            Loading Interview Studio...
          </div>
        </DashboardShell>
      }
    >
      <InterviewStudioInner />
    </React.Suspense>
  );
}
