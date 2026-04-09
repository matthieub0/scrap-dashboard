"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Officer, Company, OfficerProfile, Education, Experience } from "@/lib/types";
import { roleLabel } from "@/lib/constants";
import { pappersDirigeantUrl, linkedinSearchUrl } from "@/lib/urls";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3">
      {children}
    </p>
  );
}

function EducationEntry({
  entry,
  onChange,
  onRemove,
}: {
  entry: Education;
  onChange: (e: Education) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="w-1.5 h-1.5 rounded-full bg-gold mt-3 shrink-0" />
      <div className="flex-1 grid grid-cols-[1fr_1fr_auto] gap-2">
        <Input
          placeholder="School"
          value={entry.school}
          onChange={(e) => onChange({ ...entry, school: e.target.value })}
          className="h-8 text-sm bg-card"
        />
        <Input
          placeholder="Degree / Field"
          value={entry.degree ? `${entry.degree}${entry.field ? `, ${entry.field}` : ""}` : entry.field}
          onChange={(e) => {
            const parts = e.target.value.split(",").map((s) => s.trim());
            onChange({ ...entry, degree: parts[0] ?? "", field: parts[1] ?? "" });
          }}
          className="h-8 text-sm bg-card"
        />
        <div className="flex items-center gap-1">
          <Input
            placeholder="From"
            value={entry.start_year}
            onChange={(e) => onChange({ ...entry, start_year: e.target.value })}
            className="h-8 text-sm bg-card w-16 text-center"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <Input
            placeholder="To"
            value={entry.end_year}
            onChange={(e) => onChange({ ...entry, end_year: e.target.value })}
            className="h-8 text-sm bg-card w-16 text-center"
          />
        </div>
      </div>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all mt-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function ExperienceEntry({
  entry,
  onChange,
  onRemove,
}: {
  entry: Experience;
  onChange: (e: Experience) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-3 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="grid grid-cols-[1fr_1fr] gap-2">
          <Input
            placeholder="Company"
            value={entry.company}
            onChange={(e) => onChange({ ...entry, company: e.target.value })}
            className="h-8 text-sm bg-card"
          />
          <Input
            placeholder="Title"
            value={entry.title}
            onChange={(e) => onChange({ ...entry, title: e.target.value })}
            className="h-8 text-sm bg-card"
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Start (e.g. 2020)"
            value={entry.start_date}
            onChange={(e) => onChange({ ...entry, start_date: e.target.value })}
            className="h-8 text-sm bg-card w-36"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <Input
            placeholder="End or Present"
            value={entry.end_date}
            onChange={(e) => onChange({ ...entry, end_date: e.target.value })}
            className="h-8 text-sm bg-card w-36"
          />
        </div>
        <textarea
          placeholder="Description (optional)"
          value={entry.description}
          onChange={(e) => onChange({ ...entry, description: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-input bg-card px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-none"
        />
      </div>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all mt-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function OfficerProfileView({
  officer,
  company,
  initialProfile,
}: {
  officer: Officer;
  company: Company;
  initialProfile: OfficerProfile | null;
}) {
  const isCompany = officer.type_de_personne === "ENTREPRISE";
  const name = isCompany
    ? officer.entreprise_denomination
    : `${officer.prenoms} ${officer.nom}`.trim();

  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile?.linkedin_url ?? officer.linkedin_url ?? "");
  const [headline, setHeadline] = useState(initialProfile?.headline ?? officer.headline ?? "");
  const [currentPosition, setCurrentPosition] = useState(initialProfile?.current_position ?? officer.current_position ?? "");
  const [education, setEducation] = useState<Education[]>(initialProfile?.education ?? []);
  const [experience, setExperience] = useState<Experience[]>(initialProfile?.experience ?? []);
  const [notes, setNotes] = useState(initialProfile?.notes ?? "");
  const [draftMessage, setDraftMessage] = useState(initialProfile?.draft_message ?? officer.draft_message ?? "");
  const [toneNotes, setToneNotes] = useState(initialProfile?.tone_notes ?? officer.tone_notes ?? "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [enriching, setEnriching] = useState(false);

  const saveData = useCallback(async (overrides: Record<string, unknown> = {}) => {
    const payload = {
      siren: officer.siren,
      linkedin_url: linkedinUrl || null,
      headline: headline || null,
      current_position: currentPosition || null,
      education,
      experience,
      notes: notes || null,
      draft_message: draftMessage || null,
      tone_notes: toneNotes || null,
      ...overrides,
    };
    const res = await fetch(`/api/officers/${officer.representant_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  }, [officer.representant_id, officer.siren, linkedinUrl, headline, currentPosition, education, experience, notes, draftMessage, toneNotes]);

  const save = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      if (await saveData()) setSaved(true);
    } finally {
      setSaving(false);
    }
  }, [saveData]);

  const enrichFromLinkedin = useCallback(async () => {
    if (!linkedinUrl) return;
    setEnriching(true);
    try {
      const res = await fetch(`/api/officers/${officer.representant_id}/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedin_url: linkedinUrl,
          name,
          company: company.denomination_sirene,
          role: roleLabel(officer.role_entreprise),
        }),
      });

      const data = await res.json();
      if (!res.ok) return;

      const newHeadline = data.headline || headline;
      const newPosition = data.current_position || currentPosition;
      const newEducation = data.education?.length ? data.education : education;
      const newExperience = data.experience?.length ? data.experience : experience;

      setHeadline(newHeadline);
      setCurrentPosition(newPosition);
      setEducation(newEducation);
      setExperience(newExperience);

      // Auto-save with enriched data
      const ok = await saveData({
        headline: newHeadline || null,
        current_position: newPosition || null,
        education: newEducation,
        experience: newExperience,
      });
      if (ok) setSaved(true);
    } finally {
      setEnriching(false);
    }
  }, [officer.role_entreprise, linkedinUrl, name, company.denomination_sirene, saveData]);

  const generateDraft = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/officers/${officer.representant_id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siren: officer.siren,
          headline,
          current_position: currentPosition,
          education,
          experience,
          tone_notes: toneNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDraftMessage(`Error: ${data.error}`);
        return;
      }

      const newDraft = data.draft_message ?? "";
      const newTone = data.tone_notes || toneNotes;

      setDraftMessage(newDraft);
      if (data.tone_notes) setToneNotes(newTone);

      // Auto-save with generated draft
      const ok = await saveData({
        draft_message: newDraft || null,
        tone_notes: newTone || null,
      });
      if (ok) setSaved(true);
    } finally {
      setGenerating(false);
    }
  }, [officer.representant_id, officer.siren, headline, currentPosition, education, experience, toneNotes, saveData]);

  const pappersUrl = pappersDirigeantUrl(officer);
  const linkedinSearchHref = linkedinSearchUrl(officer, company.denomination_sirene);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${isCompany ? "bg-blue-500" : "bg-gold"}`} />
          <h2 className="text-2xl font-heading text-foreground tracking-tight">{name}</h2>
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${officer.actif === "true" ? "bg-emerald-500" : "bg-border"}`} title={officer.actif === "true" ? "Active" : "Inactive"} />
        </div>
        <p className="text-sm text-muted-foreground mt-1.5 tracking-wide">
          {roleLabel(officer.role_entreprise)} at{" "}
          <a href={`/companies/${company.siren}`} className="text-gold hover:underline">{company.denomination_sirene}</a>
          {officer.date_de_naissance && (
            <span className="font-mono text-xs ml-2">b. {officer.date_de_naissance}</span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-3">
          {pappersUrl && (
            <a
              href={pappersUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Pappers
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          )}
          {linkedinUrl ? (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#0077B5] text-white hover:bg-[#0077B5]/90 transition-colors"
            >
              LinkedIn
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          ) : !isCompany ? (
            <a
              href={linkedinSearchHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-gold/30 transition-colors"
            >
              Search LinkedIn
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </a>
          ) : null}
        </div>
      </div>

      {/* LinkedIn & Profile */}
      <div className="rounded-lg border border-border bg-card p-5">
        <SectionHeader>Profile</SectionHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">LinkedIn URL</label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="https://www.linkedin.com/in/..."
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="h-9 text-sm bg-background flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={enrichFromLinkedin}
                disabled={enriching || !linkedinUrl}
                title="Auto-populate profile from web search"
              >
                {enriching ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enriching...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Enrich
                  </>
                )}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Headline</label>
            <Input
              placeholder="e.g. CEO & Founder at TechCo"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="h-9 text-sm bg-background"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Current Position</label>
            <Input
              placeholder="e.g. Managing Director at InvestCo"
              value={currentPosition}
              onChange={(e) => setCurrentPosition(e.target.value)}
              className="h-9 text-sm bg-background"
            />
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader>Education</SectionHeader>
          <Button
            variant="ghost"
            size="xs"
            onClick={() =>
              setEducation([...education, { school: "", degree: "", field: "", start_year: "", end_year: "" }])
            }
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add
          </Button>
        </div>
        {education.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 italic">No education added yet.</p>
        ) : (
          <div className="space-y-3">
            {education.map((entry, i) => (
              <EducationEntry
                key={i}
                entry={entry}
                onChange={(updated) => {
                  const next = [...education];
                  next[i] = updated;
                  setEducation(next);
                }}
                onRemove={() => setEducation(education.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader>Experience</SectionHeader>
          <Button
            variant="ghost"
            size="xs"
            onClick={() =>
              setExperience([...experience, { company: "", title: "", start_date: "", end_date: "", description: "" }])
            }
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add
          </Button>
        </div>
        {experience.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 italic">No experience added yet.</p>
        ) : (
          <div className="space-y-4">
            {experience.map((entry, i) => (
              <ExperienceEntry
                key={i}
                entry={entry}
                onChange={(updated) => {
                  const next = [...experience];
                  next[i] = updated;
                  setExperience(next);
                }}
                onRemove={() => setExperience(experience.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-lg border border-border bg-card p-5">
        <SectionHeader>Notes</SectionHeader>
        <textarea
          placeholder="Internal notes about this person..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-none"
        />
      </div>

      {/* Outreach Draft */}
      <div className="rounded-lg border border-border bg-card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
        <div className="ml-3">
          <div className="flex items-center justify-between mb-3">
            <SectionHeader>Outreach Draft</SectionHeader>
            <Button
              variant="outline"
              size="sm"
              onClick={generateDraft}
              disabled={generating}
            >
              {generating ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                  Generate Draft
                </>
              )}
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tone notes</label>
              <Input
                placeholder="e.g. Formal, mention shared connection via X..."
                value={toneNotes}
                onChange={(e) => setToneNotes(e.target.value)}
                className="h-8 text-sm bg-background"
              />
            </div>
            <textarea
              placeholder="Click 'Generate Draft' to create an outreach message, or type your own..."
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-y leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center gap-3 sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 -mx-1 px-1 border-t border-border/60">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </Button>
        {saved && (
          <span className="text-xs text-emerald-600 font-medium animate-slide-up">
            Saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
