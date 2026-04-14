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

  const firstName: string = body.first_name ?? "";
  const lastName: string = body.last_name ?? "";
  const company: string = body.company ?? "";

  if (!firstName && !lastName) {
    return Response.json({ error: "No name provided" }, { status: 400 });
  }

  try {
    const lookupParams = new URLSearchParams({
      first_name: firstName,
      last_name: lastName,
      company_domain: company,
      enrich_profile: "enrich",
      similarity_checks: "skip",
    });
    const url = `https://enrichlayer.com/api/v2/profile/resolve?${lookupParams}`;

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

    const data = await res.json();
    const linkedinUrl = data.url || "";

    if (!linkedinUrl) {
      return Response.json({ linkedin_url: "", headline: "", current_position: "", education: [], experience: [] });
    }

    const profile = data.profile || {};
    const headline = profile.headline || profile.occupation || "";
    const experiences = profile.experiences || [];
    const education = profile.education || [];

    let currentPosition = "";
    if (experiences.length > 0) {
      const first = experiences[0];
      const title = first.title || "";
      const comp = first.company || "";
      currentPosition = title && comp ? `${title} at ${comp}` : title || comp;
    }

    return Response.json({
      linkedin_url: linkedinUrl,
      headline,
      current_position: currentPosition,
      education,
      experience: experiences,
    });
  } catch (err) {
    return Response.json(
      { error: `Lookup failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
