export function ScoreBadge({
  score,
  variant = "compact",
}: {
  score: number | null;
  variant?: "compact" | "full";
}) {
  if (score === null || score === undefined) return null;

  const label = variant === "full" ? `Exit: ${score}/10` : `${score}`;
  const size = variant === "full" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";

  if (score >= 8) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-mono font-semibold bg-gold-light text-gold border border-gold/20 score-glow ${size}`}>
        {label}
      </span>
    );
  }
  if (score >= 5) {
    return (
      <span className={`inline-flex items-center rounded-full font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200/60 ${size}`}>
        {label}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-full font-mono text-muted-foreground bg-muted border border-border ${size}`}>
      {label}
    </span>
  );
}
