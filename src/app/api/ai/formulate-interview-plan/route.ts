import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import {
  detectRoleCategory,
  getInterviewRoundsForRoleAndCompany,
  isTechnicalRole
} from "@/lib/interviewRoundCatalog";

export async function POST(request: Request) {
  let cleanRole = "Software Engineer";
  let cleanCompany = "";
  let cleanJd = "";
  let cleanRoundType = "full_loop";
  let isTech = true;

  try {
    const {
      mode = "interview", // "interview" | "practice"
      role = "Software Engineer",
      company = "",
      skill = "",
      experienceLevel = "Mid-Level",
      jobDescription = "",
      resumeText = "",
      roundType = "full_loop",
      roundTitle = "",
      roundDescription = "",
      roundDirective = "",
      customFocus = "",
      focusArea = "comprehensive"
    } = await request.json().catch(() => ({}));

    cleanRole = String(role).slice(0, 100).trim() || "Software Engineer";
    cleanCompany = String(company).slice(0, 100).trim();
    const cleanSkill = String(skill).slice(0, 100).trim();
    const cleanLevel = String(experienceLevel).slice(0, 50).trim() || "Mid-Level";
    cleanJd = String(jobDescription).slice(0, 4500).trim();
    const cleanResume = String(resumeText).slice(0, 3000).trim();
    cleanRoundType = String(roundType || "full_loop").trim();
    const cleanCustomFocus = String(customFocus || "").slice(0, 2000).trim();
    const roleCategory = detectRoleCategory(cleanRole);
    isTech = isTechnicalRole(cleanRole);

    const { openai, modelMini, isConfigured } = getAIClient();

    // Mode A: Skill Practice Sparring Session (1-round conversational deep dive)
    if (mode === "practice" || (cleanSkill && !role)) {
      const targetSkillName = cleanSkill || "System Design & Architecture";

      if (!isConfigured) {
        return NextResponse.json({
          success: true,
          plan: {
            title: `Skill Sparring: ${targetSkillName} (${cleanLevel})`,
            overview: `An interactive, conversational technical sparring session designed to test your real-world mastery, architectural reasoning, and edge-case handling in ${targetSkillName}.`,
            targetCompetencies: [
              `Core Foundations of ${targetSkillName}`,
              "Performance Trade-Offs & Scaling",
              "Production Edge Cases & Failure Modes",
              "Architectural Articulation"
            ],
            rounds: [
              {
                roundNumber: 1,
                title: `${targetSkillName} Deep-Dive Sparring`,
                objective: `Interactively probe your conceptual depth, practical implementation decisions, and trade-offs using ${targetSkillName}.`,
                openingQuestion: `Let's drill into ${targetSkillName}. Walk me through how you approach designing a production-grade implementation with this, and what the single most critical trade-off or failure mode is.`
              }
            ],
            preparationTips: [
              "Don't just recite textbook definitions; speak in terms of real production constraints.",
              "Address latency, consistency, and failure recovery explicitly.",
              "If you're unsure about an edge case, state your assumptions and explain how you would measure it."
            ]
          }
        });
      }

      const systemPrompt = `You are a Principal Engineer and Elite Technical Interviewer. Formulate a 1-round deep-dive conversational sparring drill focused specifically on the candidate mastering:
Skill: ${targetSkillName}
Experience Level: ${cleanLevel}
Focus: ${focusArea}
${cleanCustomFocus ? `User Focus Areas / Past Questions:\n${cleanCustomFocus}` : ""}

The session must challenge the candidate with practical engineering questions, not generic trivia.

Return STRICT JSON matching this schema:
{
  "title": string,
  "overview": string (2 sentences describing the drill objectives),
  "targetCompetencies": string[] (3-4 competencies tested),
  "rounds": [
    {
      "roundNumber": 1,
      "title": string,
      "objective": string,
      "openingQuestion": string (a sharp, engaging, real-world opening question to start the conversational sparring)
    }
  ],
  "preparationTips": string[] (3 tactical tips)
}
Return only valid JSON.`;

      const response = await openai.chat.completions.create({
        model: modelMini,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please formulate a sparring drill for ${targetSkillName} at ${cleanLevel} level.` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 800
      });

      const raw = response.choices[0]?.message?.content?.trim() || "{}";
      const cleanJson = raw.startsWith("```") ? raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim() : raw;
      return NextResponse.json({ success: true, plan: JSON.parse(cleanJson) });
    }

    // Mode B: Mock Interview with Dynamic Role & Company Round Isolation
    const companyTitle = cleanCompany ? `${cleanCompany} ` : "";
    const availableRounds = getInterviewRoundsForRoleAndCompany(cleanRole, cleanCompany);
    const matchedRound =
      availableRounds.find(
        (r) => r.id === cleanRoundType || r.label.toLowerCase() === String(roundTitle).toLowerCase()
      ) || availableRounds[0];

    const activeRoundTitle = String(roundTitle || matchedRound?.label || `${companyTitle}${cleanRole} Interview`).trim();
    const activeRoundDesc = String(roundDescription || matchedRound?.desc || "Authentic interview simulation").trim();
    const activeDirective = String(roundDirective || matchedRound?.focusDirective || "").trim();

    if (!isConfigured) {
      // Mock plan fallback with isolated rounds
      let mockRounds = [
        {
          roundNumber: 1,
          title: activeRoundTitle,
          objective: activeRoundDesc,
          openingQuestion: `Welcome to the interview for the ${cleanRole} position${cleanCompany ? ` at ${cleanCompany}` : ""}. Let's begin our evaluation for ${activeRoundTitle}: Walk me through a high-impact initiative you led, detailing the key technical or domain trade-offs you made.`
        }
      ];

      if (cleanRoundType === "full_loop") {
        mockRounds = isTech
          ? [
              {
                roundNumber: 1,
                title: "Round 1: Technical & Algorithmic Problem Solving",
                objective: "Verify core technical proficiency, data structures, and clean coding execution.",
                openingQuestion: `Welcome to your interview process for ${cleanCompany ? `${cleanCompany}` : "the role"}. Let's begin Round 1: How do you design an efficient worker pool that limits concurrent API calls while preventing memory leaks?`
              },
              {
                roundNumber: 2,
                title: "Round 2: Architecture & Scalability",
                objective: "Assess systems decomposition, database selection, and handling service bottlenecks.",
                openingQuestion: `Moving to Round 2 on architecture: When scaling this system to handle 10x throughput, what database and caching trade-offs would you make to ensure strong consistency?`
              },
              {
                roundNumber: 3,
                title: "Round 3: Behavioral & Engineering Leadership (STAR)",
                objective: "Evaluate culture fit, conflict resolution, and teamwork under pressure.",
                openingQuestion: `In our final round: Tell me about a time you had a strong technical disagreement with a team member or architect. How did you handle the debate and what was the outcome?`
              }
            ]
          : [
              {
                roundNumber: 1,
                title: "Round 1: Practical Domain Case & Execution",
                objective: `Assess practical problem solving and quantifiable execution in ${cleanRole}.`,
                openingQuestion: `Welcome to your interview process for ${cleanCompany ? `${cleanCompany}` : "the role"}. In Round 1, walk me through how you diagnose an underperforming campaign, pipeline, or operational workflow and turn it around.`
              },
              {
                roundNumber: 2,
                title: "Round 2: Strategic Frameworks & Resource Allocation",
                objective: "Evaluate high-level business strategy, unit economics, and scaling trade-offs.",
                openingQuestion: `Moving to Round 2 on strategy: If your department budget was reduced by 25% while targets remained flat, how would you re-prioritize initiatives and resource allocation?`
              },
              {
                roundNumber: 3,
                title: "Round 3: Executive Presence & Culture Alignment (STAR)",
                objective: "Verify cross-functional influence, handling high-stakes conflict, and values alignment.",
                openingQuestion: `In our final round: Tell me about a time you managed a major disagreement with a key executive or stakeholder. How did you navigate the conversation and what was the outcome?`
              }
            ];
      }

      return NextResponse.json({
        success: true,
        plan: {
          title: activeRoundTitle,
          overview: activeRoundDesc,
          targetCompetencies: isTech
            ? [
                "Technical Problem Solving",
                "Architectural Trade-offs",
                "STAR Behavioral Clarity",
                "Clear Engineering Communication"
              ]
            : [
                "Domain Problem Solving & Execution",
                "Strategic Resource Allocation",
                "Cross-Functional Influence",
                "STAR Behavioral Clarity"
              ],
          rounds: mockRounds,
          preparationTips: isTech
            ? [
                "Structure answers clearly: state the problem, your trade-offs, and your measured outcome.",
                "In technical rounds, explain the time and space complexity upfront.",
                "In behavioral rounds, use the STAR format (Situation, Task, Action, Result) with real metrics."
              ]
            : [
                "Ground answers in real metrics: conversion rates, revenue, efficiency gains, or cost reductions.",
                "Use structured frameworks (e.g. STAR for behavioral, diagnostic funnels for case questions).",
                "Demonstrate executive poise: acknowledge constraints, explain trade-offs, and state assumptions clearly."
              ]
        }
      });
    }

    const systemPrompt = `You are an Executive Bar Raiser and Senior Hiring Director formulating an authentic interview plan.
Target Company: ${cleanCompany ? cleanCompany : "General Industry Best Practice"}
Target Role: ${cleanRole} (${cleanLevel}) [Discipline: ${roleCategory.toUpperCase()}]
Selected Round Type: ${activeRoundTitle}
Round Objective & Scope: ${activeRoundDesc}
${activeDirective ? `Strict Round Directive: ${activeDirective}` : ""}
${cleanCustomFocus ? `Candidate's Custom Focus Topics / Past Questions:\n${cleanCustomFocus}` : ""}

CRITICAL ROLE & ROUND ISOLATION RULES:
1. If Selected Round Type is 'FULL_LOOP' or a multi-round hiring loop:
   - Formulate a 3-round authentic hiring loop representing the actual interview stages of ${cleanCompany || "top employers"} for ${cleanRole}.
2. If an isolated round was selected (e.g. "${activeRoundTitle}"):
   - Generate ONLY 1 single, hyper-focused, rigorous round matching "${activeRoundTitle}".
   - Target strictly: "${activeRoundDesc}".
   - DO NOT mix unrelated dimensions (e.g. in a Technical Coding / DSA round, do NOT ask HR, behavioral, or salary questions; in a System Design round, do NOT ask LeetCode coding or generic HR questions; in a Domain Case round, ask realistic domain case problems; in a Behavioral / STAR round, evaluate STAR past experiences).
${isTech ? `
TECHNICAL ROLE RULES:
1. If Selected Round Type is 'TECHNICAL':
   - Generate 1 to 2 rounds purely dedicated to Technical Coding, Data Structures, Algorithms, Concurrency, and Implementation.
   - DO NOT include HR questions, salary questions, or generic behavioral questions in this round.
2. If Selected Round Type is 'SYSTEM_DESIGN':
   - Generate 1 to 2 rounds purely dedicated to High-Level/Low-Level System Design, Scalability, Storage Trade-offs, and Microservice Boundaries.
` : `
NON-TECHNICAL ROLE RULES:
1. If Selected Round Type is 'TECHNICAL' (Domain Case & Execution):
   - Generate 1 to 2 rounds dedicated to REAL-WORLD BUSINESS CASE STUDIES, quantitative/qualitative problem-solving, domain execution (e.g., campaign attribution & CAC/LTV for marketing; discovery, objections & deal cycles for sales; 3-statement modeling, valuation & margin analysis for finance; SLAs, capacity & supply chain bottlenecks for operations).
   - DO NOT ask coding or software engineering questions. Ask realistic, rigorous business case questions.
2. If Selected Round Type is 'SYSTEM_DESIGN' (Strategy & Operating Frameworks):
   - Generate 1 to 2 rounds dedicated to Strategic Planning, Go-To-Market execution, Operating Models, Resource Allocation, and Organizational Scaling.
`}
3. If Selected Round Type is 'MANAGERIAL':
   - Generate 1 to 2 rounds dedicated to Team Leadership, Cross-functional Stakeholder Management, Conflict Resolution, and Prioritization under ambiguity.
4. If Selected Round Type is 'BEHAVIORAL':
   - Generate 1 to 2 rounds dedicated to STAR Behavioral delivery, Leadership Principles, and Culture Fit.
5. If Selected Round Type is 'FULL_LOOP':
   - Formulate a 3-round authentic hiring loop representing the actual interview stages of ${cleanCompany || "top employers"} for ${cleanRole} (e.g. Round 1: Domain/Case Problem Solving, Round 2: Strategy & Scalability, Round 3: Stakeholder Alignment & Behavioral).
6. IF CUSTOM FOCUS TOPICS / PAST QUESTIONS ARE PROVIDED:
   - Ensure the rounds and opening questions directly test the candidate on those specific topics or questions!
7. CRITICAL REQUIREMENT - GROUNDING IN TARGET JOB DESCRIPTION (JD):
   - When a Target Job Description (JD) is provided, you MUST extract the specific programming languages, tools, frameworks, system architectures, and domain responsibilities from it.
   - Ground all round titles, objectives, target competencies, and opening questions directly in the exact tools and domain challenges mentioned in the JD.
   - For example, if the job is "${cleanRole}" at "${cleanCompany || 'the target employer'}" with specific domain tools (e.g. Financial Analytics, Python, C++, Real-time data streams), the rounds and opening questions must directly test those specific tools and scenarios, NOT generic, unrelated software engineering.

Return STRICT JSON matching this exact schema:
{
  "title": string,
  "overview": string (2-3 sentences summarizing the strategy and focal areas of this interview),
  "targetCompetencies": string[] (4-5 key skills/competencies being evaluated),
  "rounds": [
    {
      "roundNumber": number,
      "title": string,
      "objective": string,
      "openingQuestion": string (an authentic, realistic opening question that an interviewer at this company would actually ask)
    }
  ],
  "preparationTips": string[] (3 actionable tactical tips for the candidate)
}
Return only valid JSON with no markdown formatting.`;

    const userPrompt = `Company: ${cleanCompany || "General Tech Firm"}
Role: ${cleanRole} (${cleanLevel})
Round Type: ${activeRoundTitle}
Round Objective: ${activeRoundDesc}
${cleanCustomFocus ? `Candidate Custom Focus / Past Questions:\n${cleanCustomFocus}\n` : ""}
${cleanJd ? `Target Job Description:\n${cleanJd}\n` : ""}
${cleanResume ? `Candidate Resume / Key Experience:\n${cleanResume}\n` : ""}`;

    const response = await openai.chat.completions.create({
      model: modelMini,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 1200
    });

    const rawContent = response.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      throw new Error("Empty response from AI");
    }

    let cleanJson = rawContent;
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }

    const parsed = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      plan: parsed
    });
  } catch (err: unknown) {
    console.error("Formulate interview plan error:", err);

    // Build dynamic JD-grounded fallback plan
    const companyPrefix = cleanCompany ? `${cleanCompany} ` : "";
    const extractedKeywords: string[] = [];
    if (cleanJd) {
      const candidates = ["Python", "C++", "Java", "TypeScript", "React", "SQL", "Analytics", "Financial", "Market Data", "AWS", "Machine Learning", "DevOps", "Kubernetes", "Distributed Systems", "Trading", "Risk", "Security", "Backend", "Frontend"];
      candidates.forEach((k) => {
        if (new RegExp(`\\b${k}\\b`, "i").test(cleanJd)) {
          extractedKeywords.push(k);
        }
      });
    }
    const domainFocus = extractedKeywords.slice(0, 3).join(", ") || (isTech ? "Core Systems Execution" : "Domain Problem Solving");

    return NextResponse.json({
      success: true,
      plan: {
        title: `${companyPrefix}${cleanRole} Interview Preparation Plan`,
        overview: `A structured 3-stage interview loop tailored for ${cleanRole}${cleanCompany ? ` at ${cleanCompany}` : ""}, focused directly on ${domainFocus} and practical problem solving.`,
        targetCompetencies: [
          `${cleanRole} Technical Execution`,
          `${domainFocus} Mastery`,
          "Architecture & Trade-offs",
          "STAR Methodology"
        ],
        rounds: [
          {
            roundNumber: 1,
            title: `Round 1: ${cleanRole} Core Execution & ${domainFocus}`,
            objective: `Assess practical proficiency with ${domainFocus} and hands-on execution for ${cleanRole}.`,
            openingQuestion: `Welcome to the interview for the ${cleanRole} role${cleanCompany ? ` at ${cleanCompany}` : ""}. To start, walk me through how you apply ${domainFocus} in production, highlighting a project where you solved a difficult technical constraint.`
          },
          {
            roundNumber: 2,
            title: `Round 2: Architecture, Edge Cases & Scalability`,
            objective: `Evaluate systems trade-offs, scaling bottlenecks, and operational reliability for ${cleanRole}.`,
            openingQuestion: `In this second round: When building systems for ${cleanRole}${cleanCompany ? ` at ${cleanCompany}` : ""}, how do you evaluate latency, throughput, and error recovery trade-offs under high volume?`
          },
          {
            roundNumber: 3,
            title: `Round 3: Behavioral, Delivery & STAR Leadership`,
            objective: `Verify cross-functional ownership, navigating technical deadlocks, and culture alignment${cleanCompany ? ` with ${cleanCompany}` : ""}.`,
            openingQuestion: `In our final round: Tell me about a time you had to deliver a critical initiative under tight deadlines and ambiguous requirements. What were your specific actions and measured outcomes?`
          }
        ],
        preparationTips: [
          `Anchor your answers directly in real scenarios involving ${domainFocus}.`,
          "Explain your technical trade-offs upfront (e.g. latency vs consistency, memory vs CPU).",
          "Structure behavioral responses with the STAR method (Situation, Task, Action, Result) with quantified numbers."
        ]
      }
    });
  }
}
