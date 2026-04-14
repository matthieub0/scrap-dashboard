"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Officer, Company, OfficerProfile, Education, Experience } from "@/lib/types";
import { roleLabel, formatDateRange } from "@/lib/constants";
import { pappersDirigeantUrl, linkedinSearchUrl } from "@/lib/urls";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3">
      {children}
    </p>
  );
}

function LinkedInIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function getEducationLabel(entry: Education): string {
  const degree = entry.degree_name || entry.degree || "";
  const field = entry.field_of_study || entry.field || "";
  if (degree && field) return `${degree}, ${field}`;
  return degree || field || "";
}

function getEducationDates(entry: Education): string {
  return formatDateRange(entry.starts_at, entry.ends_at, entry.start_year, entry.end_year);
}

function getExperienceDates(entry: Experience): string {
  return formatDateRange(entry.starts_at, entry.ends_at, entry.start_date, entry.end_date);
}

/* ─── Read-only timeline views ─── */

function ExperienceTimeline({ items }: { items: Experience[] }) {
  if (!items.length) return null;
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
      <div className="space-y-4">
        {items.map((exp, i) => {
          const dates = getExperienceDates(exp);
          return (
            <div key={i} className="relative pl-7">
              <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-gold bg-card z-10" />
              <div>
                <p className="text-sm font-semibold text-foreground">{exp.title}</p>
                <p className="text-sm text-foreground/70">{exp.company}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {dates && <span className="text-xs text-muted-foreground font-mono">{dates}</span>}
                  {exp.location && <span className="text-xs text-muted-foreground">{exp.location}</span>}
                </div>
                {exp.description && (
                  <p className="text-xs text-muted-foreground/70 mt-1.5 leading-relaxed line-clamp-3">{exp.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EducationTimeline({ items }: { items: Education[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-3">
      {items.map((edu, i) => {
        const label = getEducationLabel(edu);
        const dates = getEducationDates(edu);
        return (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{edu.school}</p>
              {label && <p className="text-xs text-foreground/70 mt-0.5">{label}</p>}
              {dates && <p className="text-xs text-muted-foreground font-mono mt-0.5">{dates}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Editable entries (for manual add) ─── */

function EditableEducation({
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
        <Input placeholder="School" value={entry.school} onChange={(e) => onChange({ ...entry, school: e.target.value })} className="h-8 text-sm bg-card" />
        <Input
          placeholder="Degree / Field"
          value={entry.degree_name ? `${entry.degree_name}${entry.field_of_study ? `, ${entry.field_of_study}` : ""}` : entry.field_of_study || entry.degree ? `${entry.degree}${entry.field ? `, ${entry.field}` : ""}` : ""}
          onChange={(e) => {
            const parts = e.target.value.split(",").map((s) => s.trim());
            onChange({ ...entry, degree_name: parts[0] ?? "", field_of_study: parts[1] ?? "", degree: parts[0] ?? "", field: parts[1] ?? "" });
          }}
          className="h-8 text-sm bg-card"
        />
        <div className="flex items-center gap-1">
          <Input placeholder="From" value={entry.start_year || ""} onChange={(e) => onChange({ ...entry, start_year: e.target.value })} className="h-8 text-sm bg-card w-16 text-center" />
          <span className="text-muted-foreground text-xs">&ndash;</span>
          <Input placeholder="To" value={entry.end_year || ""} onChange={(e) => onChange({ ...entry, end_year: e.target.value })} className="h-8 text-sm bg-card w-16 text-center" />
        </div>
      </div>
      <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all mt-1.5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

function EditableExperience({
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
          <Input placeholder="Company" value={entry.company} onChange={(e) => onChange({ ...entry, company: e.target.value })} className="h-8 text-sm bg-card" />
          <Input placeholder="Title" value={entry.title} onChange={(e) => onChange({ ...entry, title: e.target.value })} className="h-8 text-sm bg-card" />
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Start" value={entry.start_date || ""} onChange={(e) => onChange({ ...entry, start_date: e.target.value })} className="h-8 text-sm bg-card w-36" />
          <span className="text-muted-foreground text-xs">&ndash;</span>
          <Input placeholder="End or Present" value={entry.end_date || ""} onChange={(e) => onChange({ ...entry, end_date: e.target.value })} className="h-8 text-sm bg-card w-36" />
        </div>
      </div>
      <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all mt-1.5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

/* ─── Main component ─── */

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
  const [editing, setEditing] = useState(false);

  const hasEnrichedData = !!(headline || currentPosition || experience.length || education.length);

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
  }, [officer.role_entreprise, linkedinUrl, name, company.denomination_sirene, saveData, headline, currentPosition, education, experience]);

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
      {/* Profile header card */}
      <div className="rounded-lg border border-border bg-card p-6 relative overflow-hidden">
        {linkedinUrl && <div className="absolute top-0 left-0 w-1 h-full bg-[#0077B5]" />}
        <div className="flex items-start gap-4 ml-2">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gold/10 border-2 border-gold/20 flex items-center justify-center text-gold text-lg font-semibold shrink-0">
            {(officer.prenoms?.[0] || "").toUpperCase()}{(officer.nom?.[0] || "").toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-heading text-foreground tracking-tight">{name}</h2>
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${officer.actif === "true" ? "bg-emerald-500" : "bg-border"}`} title={officer.actif === "true" ? "Active" : "Inactive"} />
            </div>

            {headline ? (
              <p className="text-sm text-foreground/70 mt-0.5">{headline}</p>
            ) : currentPosition ? (
              <p className="text-sm text-foreground/70 mt-0.5">{currentPosition}</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-0.5">
                {roleLabel(officer.role_entreprise)} at{" "}
                <a href={`/companies/${company.siren}`} className="text-gold hover:underline">{company.denomination_sirene}</a>
              </p>
            )}

            {headline && currentPosition && currentPosition !== headline && (
              <p className="text-xs text-muted-foreground mt-0.5">{currentPosition}</p>
            )}

            {officer.date_de_naissance && (
              <p className="text-xs text-muted-foreground/50 font-mono mt-1">b. {officer.date_de_naissance}</p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {linkedinUrl ? (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#0077B5] text-white hover:bg-[#005582] transition-colors"
                >
                  <LinkedInIcon className="w-3 h-3" />
                  LinkedIn
                </a>
              ) : !isCompany ? (
                <a
                  href={linkedinSearchHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-gold/30 transition-colors"
                >
                  <LinkedInIcon className="w-3 h-3" />
                  Search LinkedIn
                </a>
              ) : null}
              {pappersUrl && (
                <a
                  href={pappersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Pappers
                </a>
              )}
              <button
                onClick={() => setEditing(!editing)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  editing ? "border-gold text-gold bg-gold/5" : "border-border text-muted-foreground hover:text-foreground hover:border-gold/30"
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
                {editing ? "Editing" : "Edit"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Experience */}
      {(experience.length > 0 || editing) && (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader>Experience</SectionHeader>
            {editing && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setExperience([...experience, { company: "", title: "", start_date: "", end_date: "", description: "" }])}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add
              </Button>
            )}
          </div>
          {editing ? (
            experience.length === 0 ? (
              <p className="text-sm text-muted-foreground/50 italic">No experience added yet.</p>
            ) : (
              <div className="space-y-4">
                {experience.map((entry, i) => (
                  <EditableExperience
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
            )
          ) : (
            <ExperienceTimeline items={experience} />
          )}
        </div>
      )}

      {/* Education */}
      {(education.length > 0 || editing) && (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader>Education</SectionHeader>
            {editing && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setEducation([...education, { school: "", degree: "", field: "", start_year: "", end_year: "" }])}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add
              </Button>
            )}
          </div>
          {editing ? (
            education.length === 0 ? (
              <p className="text-sm text-muted-foreground/50 italic">No education added yet.</p>
            ) : (
              <div className="space-y-3">
                {education.map((entry, i) => (
                  <EditableEducation
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
            )
          ) : (
            <EducationTimeline items={education} />
          )}
        </div>
      )}

      {/* No enrichment data prompt */}
      {!hasEnrichedData && !editing && (
        <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">No profile data yet</p>
          <div className="flex items-center justify-center gap-2">
            {linkedinUrl && (
              <Button variant="outline" size="sm" onClick={enrichFromLinkedin} disabled={enriching}>
                {enriching ? "Enriching..." : "Enrich from LinkedIn"}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Add manually
            </Button>
          </div>
        </div>
      )}

      {/* LinkedIn URL (editing mode) */}
      {editing && (
        <div className="rounded-lg border border-border bg-card p-5">
          <SectionHeader>LinkedIn URL</SectionHeader>
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
          <div className="mt-3 space-y-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Headline</label>
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} className="h-8 text-sm bg-background" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Current Position</label>
              <Input value={currentPosition} onChange={(e) => setCurrentPosition(e.target.value)} className="h-8 text-sm bg-background" />
            </div>
          </div>
        </div>
      )}

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
            <Button variant="outline" size="sm" onClick={generateDraft} disabled={generating}>
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
