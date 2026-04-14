export async function POST(
  request: Request,
  { params }: { params: Promise<{ representant_id: string }> }
) {
  await params;
  const body = await request.json();

  const apiKey = process.env.ENRICHLAYER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ENRICHLAYER_API_KEY not configured" }, { status: 500 });
  }

  const linkedinUrl: string = body.linkedin_url ?? "";
  if (!linkedinUrl) {
    return Response.json({ error: "No LinkedIn URL provided" }, { status: 400 });
  }

  try {
    const profileParams = new URLSearchParams({
      profile_url: linkedinUrl,
      use_cache: "if-present",
    });
    const url = `https://enrichlayer.com/api/v2/profile?${profileParams}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: `EnrichLayer error ${res.status}: ${errText}` }, { status: 502 });
    }

    const profile = await res.json();

    const headline = profile.headline || profile.occupation || "";
    const experiences = profile.experiences || [];
    const education = profile.education || [];

    let currentPosition = "";
    if (experiences.length > 0) {
      const first = experiences[0];
      const title = first.title || "";
      const company = first.company || "";
      currentPosition = title && company ? `${title} at ${company}` : title || company;
    }

    return Response.json({
      headline,
      current_position: currentPosition,
      education,
      experience: experiences,
    });
  } catch (err) {
    return Response.json(
      { error: `Enrichment failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
