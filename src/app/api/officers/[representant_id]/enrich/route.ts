import { roleLabel } from "@/lib/constants";

const EXTRACT_PROMPT = `\
I have a LinkedIn profile URL and web search results about this person. Extract their professional profile.

LinkedIn URL: {linkedin_url}

Web search results:
{search_results}

The person I'm looking for:
- Name: {name}
- Company: {company}
- Role: {role}

Extract as much information as possible. Respond in JSON:
{{
  "headline": "<their LinkedIn headline or professional tagline>",
  "current_position": "<current job title and company>",
  "education": [
    {{
      "school": "<school name>",
      "degree": "<degree type, e.g. Master, MBA, Ingénieur>",
      "field": "<field of study>",
      "start_year": "<start year or empty>",
      "end_year": "<end year or empty>"
    }}
  ],
  "experience": [
    {{
      "company": "<company name>",
      "title": "<job title>",
      "start_date": "<start year>",
      "end_date": "<end year or Present>",
      "description": "<brief description if available, else empty>"
    }}
  ]
}}

Return only what you can confidently extract from the search results. If you can't find info for a field, use an empty string. Order experience from most recent to oldest.`;

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

async function webSearch(query: string): Promise<string> {
  const encoded = new URLSearchParams({ q: query }).toString();
  const url = `https://html.duckduckgo.com/html/?${encoded}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    },
  });

  const html = await res.text();

  // Extract titles, URLs, snippets from DuckDuckGo HTML results
  const titleMatches = [...html.matchAll(/class="result__a"[^>]*>([\s\S]*?)<\/a>/g)];
  const snippetMatches = [...html.matchAll(/class="result__snippet">([\s\S]*?)<\/a>/g)];
  const urlMatches = [...html.matchAll(/class="result__url"[^>]*>([\s\S]*?)<\/a>/g)];

  const strip = (s: string) => s.replace(/<[^>]+>/g, "").trim();

  const results: string[] = [];
  for (let i = 0; i < Math.min(titleMatches.length, 8); i++) {
    const title = titleMatches[i] ? strip(titleMatches[i][1]) : "";
    const snippet = snippetMatches[i] ? strip(snippetMatches[i][1]) : "";
    const link = urlMatches[i] ? strip(urlMatches[i][1]) : "";
    results.push(`Title: ${title}\nURL: ${link}\nSnippet: ${snippet}`);
  }

  return results.length > 0 ? results.join("\n\n") : "No results found.";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ representant_id: string }> }
) {
  await params;
  const body = await request.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const linkedinUrl: string = body.linkedin_url ?? "";
  const name: string = body.name ?? "";
  const company: string = body.company ?? "";
  const role: string = body.role ?? "";

  if (!linkedinUrl) {
    return Response.json({ error: "No LinkedIn URL provided" }, { status: 400 });
  }

  try {
    // Run two searches in parallel: one for the LinkedIn URL, one for the person's name
    const [linkedinResults, nameResults] = await Promise.all([
      webSearch(`${linkedinUrl}`),
      webSearch(`${name} ${company} LinkedIn education experience`),
    ]);

    const searchResults = `--- Search by LinkedIn URL ---\n${linkedinResults}\n\n--- Search by name ---\n${nameResults}`;

    const prompt = fillTemplate(EXTRACT_PROMPT, {
      linkedin_url: linkedinUrl,
      search_results: searchResults,
      name,
      company,
      role,
    });

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      return Response.json({ error: `Claude API error: ${errText}` }, { status: 502 });
    }

    const claudeData = await claudeRes.json();
    let text: string = claudeData.content[0].text.trim();

    if (text.startsWith("```")) {
      text = text.split("\n").slice(1).join("\n");
      text = text.replace(/```\s*$/, "");
    }

    const result = JSON.parse(text);
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: `Enrichment failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
