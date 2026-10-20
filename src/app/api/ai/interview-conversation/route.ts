import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import {
  getInterviewRoundsForRoleAndCompany,
  isTechnicalRole
} from "@/lib/interviewRoundCatalog";

function generateSmartFallbackReply({
  userMessage,
  role,
  company,
  isTech,
  turnCount
}: {
  userMessage: string;
  role: string;
  company: string;
  isTech: boolean;
  turnCount: number;
}): string {
  const lower = (userMessage || "").toLowerCase().trim();

  // 1. Candidate says "I don't know", asks for the answer, gives up
  if (
    lower.includes("don't know") ||
    lower.includes("dont know") ||
    lower.includes("no idea") ||
    lower.includes("not sure") ||
    lower.includes("you tell me") ||
    lower.includes("tell me this") ||
    lower.includes("skip") ||
    lower.includes("pass")
  ) {
    return isTech
      ? `It's completely fine if you haven't worked with this specific pattern before. In a real engineering scenario, admitting gaps is much better than guessing. Let's break this down: how would you use a basic queue or semaphore to ensure no more than N tasks run concurrently?`
      : `That's alright—in practical business scenarios, encountering unfamiliar frameworks happens. Let's simplify: what core metrics or baseline data would you first look for to understand the problem?`;
  }

  // 2. Candidate asks meta questions about the interview, JD, or company
  if (
    lower.includes("is this interview") ||
    lower.includes("job description") ||
    lower.includes("specific to") ||
    lower.includes("are you an ai") ||
    lower.includes("what company")
  ) {
    return `Yes, absolutely. This interview round is tailored specifically for the ${role} position${company ? ` at ${company}` : ""} based on the target requirements. Let's get back to the problem: how would you structure your approach to this challenge?`;
  }

  // 3. Candidate gives nonsense, joke, random gibberish, or very short text (< 12 chars without substance)
  const isGibberish =
    lower.length < 10 ||
    lower.includes("ac and fan") ||
    lower.includes("weather") ||
    lower.includes("asdasd") ||
    lower.includes("blah") ||
    lower.includes("lol") ||
    lower.includes("idk") ||
    !/[a-zA-Z]{3,}/.test(lower);

  if (isGibberish) {
    return `That doesn't address the interview question. In an authentic evaluation for ${role}${company ? ` at ${company}` : ""}, we need to assess your technical depth and structured problem-solving. Let's refocus: how would you tackle the core requirements of this question?`;
  }

  // 4. Candidate gave a genuine response -> probe realistically without blindly praising
  if (isTech) {
    if (turnCount >= 4) {
      return `To wrap up this technical discussion: if you had to scale this architecture to support 10x traffic with strict sub-millisecond p99 latency, what trade-offs would you make?`;
    }
    if (turnCount === 2) {
      return `Understood. Now looking at edge cases: what happens when your downstream dependencies experience intermittent timeouts or backpressure? How does your design recover gracefully?`;
    }
    return `Looking at that approach, how do you handle concurrency, resource cleanup, and avoiding memory leaks during sudden load spikes?`;
  } else {
    if (turnCount >= 4) {
      return `To conclude this dimension: looking back at this initiative, what primary KPI would you use to prove long-term ROI to senior executives?`;
    }
    return `When executing that strategy, how do you align conflicting stakeholder priorities while keeping project delivery on schedule?`;
  }
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
      roundTitle = "",
      roundDescription = "",
      roundDirective = "",
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

    const lastCandidateMessage = String(
      (messages || [])
        .filter((m: { role: string }) => m.role === "candidate" || m.role === "user")
        .slice(-1)[0]?.content || ""
    ).trim();

    const availableRounds = getInterviewRoundsForRoleAndCompany(cleanRole, cleanCompany);
    const matchedRound =
      availableRounds.find(
        (r) => r.id === cleanRoundType || r.label.toLowerCase() === String(roundTitle).toLowerCase()
      ) || availableRounds[0];

    const activeRoundTitle = String(roundTitle || matchedRound?.label || cleanRoundType).trim();
    const activeRoundDesc = String(roundDescription || matchedRound?.desc || "").trim();
    let roundFocusDirective = String(roundDirective || matchedRound?.focusDirective || "").trim();

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

    // Fallback response for offline / unconfigured mode
    if (!isConfigured) {
      const reply = generateSmartFallbackReply({
        userMessage: lastCandidateMessage,
        role: cleanRole,
        company: cleanCompany,
        isTech,
        turnCount
      });
      return NextResponse.json({
        success: true,
        reply,
        isClosing: turnCount >= 4,
        followUpType: turnCount >= 4 ? "wrapup" : "probe"
      });
    }

    const maxWords = mode === "voice" ? "under 60-70 words" : "under 90-100 words";
    
    if (!roundFocusDirective) {
      if (cleanRoundType === "technical" || cleanRoundType === "coding_2") {
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
    }

    const interviewerRoleDescription = cleanCompany
      ? `an interviewer and hiring evaluator at ${cleanCompany} for the ${cleanRole} position`
      : `an interviewer and hiring evaluator for the ${cleanRole} position`;

    const systemPrompt = `You are ${activeVoice.name}, ${interviewerRoleDescription}.
Conversational Tone: ${activeVoice.tone}
Mode: ${mode === "text" ? "Text-Based Studio" : "Live Voice Simulation"}
${activeRoundTitle ? `Target Dimension / Round: ${activeRoundTitle}` : ""}
${activeRoundDesc ? `Round Dimension Focus: ${activeRoundDesc}` : ""}
${roundFocusDirective}

Active Interview Round: ${activeRoundInfo ? `Round ${activeRoundInfo.roundNumber}: ${activeRoundInfo.title} (Objective: ${activeRoundInfo.objective})` : (activeRoundTitle || `Round ${currentRound}`)}

CRITICAL CANDIDATE EVALUATION & REACTION RULES (DO NOT BLINDLY PRAISE):
- ALWAYS critically evaluate the relevance, depth, and accuracy of the candidate's latest message before responding:
  1. IF THE CANDIDATE GIVES GIBBERISH, JOKES, OR AN IRRELEVANT / OFF-TOPIC ANSWER (e.g. mentions unrelated objects, random words, air conditioning, weather, personal chit-chat):
     - DO NOT validate, flatter, or thank them. NEVER say "Great insight", "Excellent explanation", or "Thank you for sharing that breakdown".
     - Firmly and professionally point out that the response is off-topic: "That doesn't address the interview question. In an interview for ${cleanRole}${cleanCompany ? ` at ${cleanCompany}` : ""}, we need to evaluate your structured problem-solving. Let's refocus on the problem: [Restate or simplify the core question]."
  2. IF THE CANDIDATE SAYS "I DON'T KNOW", "YOU TELL ME", "NO IDEA", OR GIVES UP:
     - DO NOT flatter them. NEVER say "That gives great insight into your decision-making".
     - Candidly acknowledge it and provide an engineering hint or break the problem down: "It's fine if you haven't worked with this exact pattern before. Let's break it down into a simpler piece: [Provide a concrete hint or guided sub-question]."
  3. IF THE CANDIDATE ASKS A META-QUESTION ABOUT THE INTERVIEW OR SETUP (e.g. asking if the interview is specific to the company or job description):
     - Directly answer their question in 1 concise sentence confirming the ${cleanRole} role and ${cleanCompany || "company"} context, then smoothly steer back: "Yes, this round is tailored specifically to the ${cleanRole} position${cleanCompany ? ` at ${cleanCompany}` : ""} and your selected requirements. Let's return to the question: [Restate the problem]."
  4. IF THE CANDIDATE GIVES A SHALLOW, INCOMPLETE, OR TECHNICALLY FLAWED ANSWER:
     - Point out the specific technical flaw or missing edge case: "You mentioned [X], but that leaves [Y, e.g. memory leaks, race conditions, backpressure] unaddressed. How would you handle that specific failure mode?"
  5. IF THE CANDIDATE GIVES A STRONG, RELEVANT ANSWER:
     - Validate the specific technical decision they made, and probe deeper into production failure modes, concurrency, latency, or 10x scale.
  ${cleanCustomFocus ? `6. FOCUS HEAVILY on the candidate's requested topics / past questions:\n${cleanCustomFocus}` : ""}
  ${cleanScratchpad ? `7. CRITIQUE WRITTEN SOLUTION: The candidate wrote code/notes on the live scratchpad (${cleanLanguage}):\n\`\`\`${cleanLanguage}\n${cleanScratchpad}\n\`\`\`\nActively inspect their syntax, algorithmic complexity, variable names, logic, or edge cases in your response.` : ""}
  ${cleanResume ? "8. When relevant, reference their mentioned background to probe specific claims." : ""}
  ${cleanJd ? "9. GROUNDING IN TARGET JOB: Probe scenarios and domain challenges directly related to the tools and requirements mentioned in the Target Job Requirements." : ""}

- Keep your total response CONCISE (${maxWords}) so the conversation stays snappy and focused.
- Do NOT output bullet points, markdown headers, or emojis. Output natural conversational prose only.
- If turnCount >= 4, begin wrapping up the interview round by asking a final reflection or wrap-up question.

${cleanJd ? `Target Job Requirements Context:\n${cleanJd}\n` : ""}
${cleanResume ? `Candidate Experience Context:\n${cleanResume}\n` : ""}`;

    // Format conversation history for LLM
    const formattedHistory = (messages || [])
      .slice(-6)
      .map((m: { role: string; content: string }) => ({
        role: m.role === "interviewer" ? ("assistant" as const) : ("user" as const),
        content: String(m.content || "").slice(0, 1000)
      }));

    const apiMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
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
      messages: apiMessages,
      temperature: 0.4,
      max_tokens: 250
    });

    const reply = response.choices[0]?.message?.content?.trim() || 
      generateSmartFallbackReply({
        userMessage: lastCandidateMessage,
        role: cleanRole,
        company: cleanCompany,
        isTech,
        turnCount
      });

    return NextResponse.json({
      success: true,
      reply,
      isClosing: turnCount >= 4,
      followUpType: turnCount >= 4 ? "wrapup" : "probe"
    });
  } catch (err: unknown) {
    console.error("Interview conversation turn error:", err);
    return NextResponse.json({
      success: true,
      reply: "Let's pause on that point. Could you explain the primary concurrency or data structure choice you'd use here and why?",
      isClosing: false,
      followUpType: "transition"
    });
  }
}
