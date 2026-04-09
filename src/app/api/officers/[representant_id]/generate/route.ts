import { supabase } from "@/lib/supabase";
import { roleLabel } from "@/lib/constants";

const OUTREACH_PROMPT = `\
You are helping an investor at Elaia Partners, a leading European VC fund focused on \
technology and digital innovation, draft a personalized outreach message.

Context: This person was identified through BODACC (French official gazette) as an \
executive of a tech company that recently went through a sale/transfer. Elaia is \
interested in connecting with operators who recently exited their company in the context \
of a fiscal scheme 150-0 B-ter allowing people to roll over their gains pre tax by investing in new ventures.

Company context:
- Company: {company} (SIREN: {siren})
- Sector: {naf_label}
- AI Assessment: {company_summary}
- Score: {score}/10 — {rationale}
- Sale description: {descriptif}

Person:
- Name: {name}
- Role: {role}
- LinkedIn headline: {headline}
- Current position: {current_position}

Additional context from their profile:
{profile_context}

Write a short, warm, professional outreach message (3-5 sentences) in French that:
1. References their background naturally (don't mention BODACC or the sale directly)
2. Expresses genuine interest in what they've done and learned
3. Mention of Elaia track record in tech investing and desire to connect with experienced operators
4. Sounds human, not templated — avoid generic phrases and make it specific to this person's experience.

Respond in JSON:
{{
  "draft_message": "<the outreach message in French>",
  "tone_notes": "<1-2 sentences of context for the sender on how to approach this person>"
}}`;

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ representant_id: string }> }
) {
  const { representant_id } = await params;
  const body = await request.json();
  const siren: string = body.siren;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  // Fetch officer and company data
  const [officerRes, companyRes] = await Promise.all([
    supabase.from("v_officers").select("*").eq("siren", siren).eq("representant_id", representant_id).single(),
    supabase.from("v_companies").select("*").eq("siren", siren).single(),
  ]);

  if (officerRes.error || !officerRes.data || companyRes.error || !companyRes.data) {
    return Response.json({ error: "Officer or company not found" }, { status: 404 });
  }

  const officer = officerRes.data;
  const company = companyRes.data;

  const name = `${officer.prenoms ?? ""} ${officer.nom ?? ""}`.trim();

  // Build profile context from body (education, experience, etc.)
  const profileParts: string[] = [];
  if (body.education?.length) {
    profileParts.push("Education: " + body.education.map((e: { degree: string; school: string }) => `${e.degree} at ${e.school}`).filter(Boolean).join(", "));
  }
  if (body.experience?.length) {
    profileParts.push("Experience: " + body.experience.map((e: { title: string; company: string }) => `${e.title} at ${e.company}`).filter(Boolean).join(", "));
  }
  if (body.tone_notes) {
    profileParts.push("Tone preference: " + body.tone_notes);
  }

  const prompt = fillTemplate(OUTREACH_PROMPT, {
    company: company.denomination_sirene,
    siren: company.siren,
    naf_label: company.naf_label || "N/A",
    company_summary: company.company_summary || "N/A",
    score: String(company.score ?? "N/A"),
    rationale: company.rationale || "N/A",
    descriptif: company.descriptif || "N/A",
    name,
    role: roleLabel(officer.role_entreprise),
    headline: body.headline || officer.headline || "N/A",
    current_position: body.current_position || officer.current_position || "N/A",
    profile_context: profileParts.length > 0 ? profileParts.join("\n") : "No additional profile info available.",
  });

  try {
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      return Response.json({ error: `Claude API error: ${errText}` }, { status: 502 });
    }

    const claudeData = await claudeRes.json();
    let text: string = claudeData.content[0].text.trim();

    // Strip markdown code fences if present
    if (text.startsWith("```")) {
      text = text.split("\n").slice(1).join("\n");
      text = text.replace(/```\s*$/, "");
    }

    const result = JSON.parse(text);
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: `Generation failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
