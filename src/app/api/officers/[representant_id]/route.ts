import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ representant_id: string }> }
) {
  const { representant_id } = await params;
  const { searchParams } = new URL(request.url);
  const siren = searchParams.get("siren");

  let query = supabase
    .from("officer_profiles")
    .select("*")
    .eq("representant_id", representant_id);

  if (siren) query = query.eq("siren", siren);

  const { data, error } = await query.maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data ?? { representant_id, education: [], experience: [] });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ representant_id: string }> }
) {
  const { representant_id } = await params;
  const body = await request.json();

  if (!body.siren) {
    return Response.json({ error: "siren is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("officer_profiles")
    .upsert(
      {
        siren: body.siren,
        representant_id,
        linkedin_url: body.linkedin_url ?? null,
        headline: body.headline ?? null,
        current_position: body.current_position ?? null,
        education: body.education ?? [],
        experience: body.experience ?? [],
        notes: body.notes ?? null,
        draft_message: body.draft_message ?? null,
        tone_notes: body.tone_notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "siren,representant_id" }
    );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
