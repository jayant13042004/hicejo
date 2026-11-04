import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";

interface Contact {
  name: string;
  linkedinUrl?: string;
  jobTitle?: string;
  company?: string;
  department?: string;
  relationship?: string;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const {
      contacts,
      candidateName,
      candidateBackground,
      jobTitle,
      company,
      jobUrl,
      jobId,
      resumeHighlights,
      jdSummary
    } = await request.json();

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide at least one contact." },
        { status: 400 }
      );
    }

    if (!jobTitle || !company) {
      return NextResponse.json(
        { success: false, error: "Job title and company are required." },
        { status: 400 }
      );
    }

    const { openai, modelPro } = getAIClient();

    const systemPrompt = `You are helping a fresher job seeker (${candidateName || "the candidate"}) craft personalized, genuine outreach messages for referrals.

STRICT RULES:
- Never pretend they know the contact when they don't
- Never fabricate shared connections or experiences
- Never use manipulative, desperate, or excessively flattering language
- Never send generic copy-paste messages — each must be personalized to the individual
- Keep LinkedIn connection requests under 280 characters (strict limit)
- Referral messages should be short (under 200 words), warm, and to the point
- Forwardable blurb: 2-3 sentences the contact can forward to a recruiter

You must return ONLY a valid JSON array where each element has:
{
  "contactName": "string",
  "connectionRequest": "string (≤280 chars, personalized)",
  "referralMessage": "string (short, warm, personalized message to send after connecting)",
  "forwardableBlurb": "string (2-3 sentences a contact can forward to recruiter/portal)"
}`;

    const candidateContext = `Candidate: ${candidateName || "Jayant Jagtap"}
Background: ${candidateBackground || "B.Tech (Chemical Engineering + Entrepreneurship) from IIT Hyderabad, fresher, targeting Data Analytics / AI / Software roles"}
Resume Highlights: ${resumeHighlights || "Strong analytical background, ML projects, data internships"}
Target Role: ${jobTitle} at ${company}
Job URL/ID: ${jobUrl || jobId || "not provided"}
Role Summary: ${jdSummary || ""}`;

    const contactList = contacts.map((c: Contact, i: number) =>
      `Contact ${i + 1}:
  Name: ${c.name}
  Title: ${c.jobTitle || "Unknown"}
  Company: ${c.company || company}
  Department: ${c.department || "Unknown"}
  LinkedIn: ${c.linkedinUrl || "Not provided"}
  Relationship: ${c.relationship || "No prior relationship"}
  Notes: ${c.notes || "None"}`
    ).join("\n\n");

    const userPrompt = `${candidateContext}

Contacts to message:
${contactList}

Generate personalized outreach for each contact. Return a JSON array with ${contacts.length} elements.`;

    const response = await openai.chat.completions.create({
      model: modelPro,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 4096
    });

    const rawContent = response.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ success: false, error: "AI failed to generate messages." }, { status: 500 });
    }

    let cleanJson = rawContent;
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    }

    const parsed = JSON.parse(cleanJson);
    // Handle both array response and {messages: [...]} wrapped response
    const messages = Array.isArray(parsed) ? parsed : (parsed.messages || parsed.contacts || [parsed]);

    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    console.error("Outreach generation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate outreach messages." },
      { status: 500 }
    );
  }
}
