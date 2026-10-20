import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";

function isTechnicalRole(role: string): boolean {
  const r = (role || "").toLowerCase();
  const techKeywords = [
    "software", "engineer", "developer", "frontend", "backend", "fullstack", "full stack",
    "devops", "cloud", "sre", "data engineer", "data scientist", "machine learning", "ml ", "ai ",
    "security engineer", "qa", "qa engineer", "systems engineer",
    "ios", "android", "mobile engineer", "embedded", "firmware", "architect", "database administrator", "dba"
  ];
  return techKeywords.some((kw) => r.includes(kw));
}

export async function POST(request: Request) {
  try {
    const {
      role = "Software Engineer",
      company = "",
      skill = "",
      jobDescription = "",
      resumeText = "",
      roundType = "full_loop",
      customFocus = "",
      scratchpadCode = "",
      scratchpadLanguage = "python",
      persona = "alex",
      messages = [],
      turnCount = 1,
      currentRound = 1,
      rounds = [],
      mode = "voice"
    } = await request.json().catch(() => ({}));

    const cleanRole = String(role).slice(0, 100).trim() || "Software Engineer";
    const cleanCompany = String(company || "").slice(0, 100).trim();
    const cleanSkill = String(skill).slice(0, 100).trim();
    const cleanJd = String(jobDescription).slice(0, 4000).trim();
    const cleanResume = String(resumeText).slice(0, 2500).trim();
    const cleanRoundType = String(roundType || "full_loop").trim();
    const cleanCustomFocus = String(customFocus || "").slice(0, 2000).trim();
    const cleanScratchpad = String(scratchpadCode || "").slice(0, 3000).trim();
    const cleanLanguage = String(scratchpadLanguage || "python").slice(0, 30).trim();
    const isTech = isTechnicalRole(cleanRole);

    // Pure voice tone profiles (speech/conversational delivery style, NO fake roles or titles)
    const voiceProfiles: Record<string, { name: string; tone: string }> = {
      alex: {
        name: "Alex",
        tone: "Professional, direct, clear, and focused."
      },
      sarah: {
        name: "Sarah",
        tone: "Articulate, executive, confident, and balanced."
      },
      david: {
        name: "David",
        tone: "Analytical, methodical, structured, and composed."
      },
      maya: {
        name: "Maya",
        tone: "Engaging, conversational, natural, and approachable."
      }
    };

    const activeVoice = voiceProfiles[persona] || voiceProfiles.alex;
    const activeRoundInfo = Array.isArray(rounds) && rounds[currentRound - 1] ? rounds[currentRound - 1] : null;

    const { openai, modelMini, isConfigured } = getAIClient();

    // Fallback response for offline / demo mode
    if (!isConfigured) {
      const topic = cleanSkill || cleanRole;
      const fallbackReplies = isTech
        ? [
            `Thank you for sharing that breakdown. When implementing that with ${topic}, how did you ensure your architecture balanced delivery velocity with system reliability?`,
            `That gives great insight into your decision-making. Could you dive deeper into a specific technical constraint, concurrency challenge, or bottleneck you encountered and how you resolved it?`,
            `Excellent explanation. To wrap up this discussion: if you had to design this system completely from scratch today with 10x scale, what architectural trade-off would you reconsider?`
          ]
        : [
            `Thank you for walking me through that approach. In that initiative for ${topic}, what specific quantitative metrics did you track to validate business impact?`,
            `That provides great context on your execution. Can you share how you handled resistance or misalignment from key cross-functional stakeholders during that project?`,
            `Very well articulated. Looking back, if you were to tackle this challenge again with tighter resource constraints, what would you prioritize differently?`
          ];
      const reply = fallbackReplies[(turnCount - 1) % fallbackReplies.length];
      return NextResponse.json({
        success: true,
        reply,
        isClosing: turnCount >= 4,
        followUpType: turnCount >= 4 ? "wrapup" : "probe"
      });
    }

    const maxWords = mode === "voice" ? "under 60-70 words" : "under 90-100 words";

    const companyContext = cleanCompany ? ` at ${cleanCompany}` : "";
    const topicLabel = cleanSkill ? `Skill Sparring on "${cleanSkill}"` : `${cleanRole} Interview${companyContext}`;
    
    let roundFocusDirective = "";
    if (cleanRoundType === "technical") {
      roundFocusDirective = isTech
        ? "ROUND FOCUS: Purely TECHNICAL Coding, Data Structures, Concurrency & Algorithms. Probe time/space complexity, edge cases, and code design. DO NOT ask HR, managerial, or generic behavioral questions."
        : "ROUND FOCUS: REAL-WORLD DOMAIN CASE STUDY & QUANTITATIVE EXECUTION. Probe domain frameworks (e.g. CAC/LTV, funnel drop-offs for marketing; discovery, objections, enterprise sales cycles for sales; DCF/3-statement models, margins for finance; SLAs, bottlenecks, capacity planning for operations). DO NOT ask coding or software engineering questions.";
    } else if (cleanRoundType === "system_design") {
      roundFocusDirective = isTech
        ? "ROUND FOCUS: SYSTEM DESIGN & ARCHITECTURE. Probe high-level component diagrams, database partitioning, caching layers, API gateways, latency, and single points of failure."
        : "ROUND FOCUS: STRATEGY, OPERATING FRAMEWORKS & SCALING. Probe Go-To-Market execution, operating models, resource allocation, KPI benchmarks, and business scaling.";
    } else if (cleanRoundType === "managerial") {
      roundFocusDirective = isTech
        ? "ROUND FOCUS: MANAGERIAL & LEADERSHIP. Probe how the candidate manages deadlines, resolves technical or strategic deadlocks, handles underperformance, and navigates cross-functional trade-offs."
        : "ROUND FOCUS: STAKEHOLDER MANAGEMENT & TEAM LEADERSHIP. Probe cross-functional alignment, managing underperforming team members, negotiating conflicting priorities, and executive influence.";
    } else if (cleanRoundType === "behavioral") {
      roundFocusDirective = `ROUND FOCUS: BEHAVIORAL & CULTURE ALIGNMENT (STAR METHOD). Probe Situation, Task, Action, and Result. Evaluate communication, conflict resolution${cleanCompany ? `, and ${cleanCompany} core values` : ""}.`;
    }

    const interviewerRoleDescription = cleanCompany
      ? `an interviewer and hiring evaluator at ${cleanCompany} for the ${cleanRole} position`
      : `an interviewer and hiring evaluator for the ${cleanRole} position`;

    const systemPrompt = `You are ${activeVoice.name}, ${interviewerRoleDescription}.
Conversational Tone: ${activeVoice.tone}
Mode: ${mode === "text" ? "Text-Based Studio" : "Live Voice Simulation"}
${roundFocusDirective}

Active Interview Round: ${activeRoundInfo ? `Round ${activeRoundInfo.roundNumber}: ${activeRoundInfo.title} (Objective: ${activeRoundInfo.objective})` : `Round ${currentRound}`}

YOUR OBJECTIVE:
- Act like an authentic, highly experienced hiring manager for ${cleanRole}${cleanCompany ? ` at ${cleanCompany}` : ""}.
- All questions, evaluations, and discussion must be strictly tailored to the ${cleanRole} role and the target job description requirements below.
- Do NOT assume arbitrary domain specializations outside of what this role and job description call for.
- Respond conversationally to what the candidate just shared:
  1. Briefly validate and acknowledge what they said (1 natural sentence).
  2. Ask an insightful, contextual follow-up probing question or smoothly advance to the next dimension (1-2 sentences).
  ${cleanCustomFocus ? `3. FOCUS HEAVILY on the candidate's requested topics / past questions:\n${cleanCustomFocus}` : ""}
  ${cleanScratchpad ? `4. CRITIQUE WRITTEN SOLUTION: The candidate wrote code/notes on the live scratchpad (${cleanLanguage}):\n\`\`\`${cleanLanguage}\n${cleanScratchpad}\n\`\`\`\nActively inspect their syntax, algorithmic complexity, variable names, logic, or edge cases in your response.` : ""}
  ${cleanResume ? "5. When relevant, reference their mentioned background to probe specific claims." : ""}
  ${cleanJd ? "6. GROUNDING IN TARGET JOB: Probe scenarios and domain challenges directly related to the tools and requirements mentioned in the Target Job Requirements." : ""}
- Keep your total response CONCISE (${maxWords}) so the conversation stays snappy and focused.
- Do NOT output bullet points, markdown headers, or emojis. Output natural conversational prose only.
- If turnCount >= 4, begin wrapping up the interview round by asking a final reflection or wrap-up question.

${cleanJd ? `Target Job Requirements Context:\n${cleanJd}\n` : ""}
${cleanResume ? `Candidate Experience Context:\n${cleanResume}\n` : ""}`;

    // Format conversation history for LLM
    const formattedHistory = (messages || []).slice(-6).map((m: any) => ({
      role: m.role === "interviewer" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 1000)
    }));

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...formattedHistory
    ];

    if (apiMessages.length === 1) {
      apiMessages.push({
        role: "user",
        content: `Hi, I am ready for the interview for the ${cleanRole} position.`
      });
    }

    const response = await openai.chat.completions.create({
      model: modelMini,
      messages: apiMessages as any,
      temperature: 0.5,
      max_tokens: 250
    });

    const reply = response.choices[0]?.message?.content?.trim() || 
      `That's a very solid breakdown. How did you handle measuring the actual production impact of that change?`;

    return NextResponse.json({
      success: true,
      reply,
      isClosing: turnCount >= 4,
      followUpType: turnCount >= 4 ? "wrapup" : "probe"
    });
  } catch (err: any) {
    console.error("Interview conversation turn error:", err);
    return NextResponse.json({
      success: true,
      reply: "Thank you for explaining that. Moving to the next dimension: how do you typically approach automated testing and deployment safety for critical systems?",
      isClosing: false,
      followUpType: "transition"
    });
  }
}
