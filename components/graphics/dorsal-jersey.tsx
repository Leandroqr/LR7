// Render plano de la espalda de una camiseta con nombre y número (DESIGN.md → Personalización).
// Sustituye a las fotos de stock mientras no haya fotos reales: diseño propio, sin escudos ni logos.
// Sin hooks ni ids, así que sirve tanto en componentes de servidor como de cliente.

export type JerseyPalette = Readonly<{
  body: string;
  sleeve: string;
  trim: string;
  ink: string;
}>;

export const JERSEY_PALETTES = {
  night: { body: "#071426", sleeve: "#0D1F38", trim: "#5B8CFF", ink: "#FFFFFF" },
  white: { body: "#FFFFFF", sleeve: "#ECEFF2", trim: "#071426", ink: "#071426" },
  action: { body: "#1152E8", sleeve: "#0D3DAE", trim: "#FFFFFF", ink: "#FFFFFF" },
  steel: { body: "#174A7E", sleeve: "#0D1F38", trim: "#DCE1E6", ink: "#FFFFFF" },
  chalk: { body: "#ECEFF2", sleeve: "#DCE1E6", trim: "#174A7E", ink: "#071426" },
} as const satisfies Record<string, JerseyPalette>;

const BODY = "M139 56 92 72 35 111 58 203 110 187 110 443Q210 468 310 443L310 187 362 203 385 111 328 72 281 56Q262 97 210 99 158 97 139 56Z";
const LEFT_SLEEVE = "M139 56 92 72 35 111 58 203 110 187 110 120Z";
const RIGHT_SLEEVE = "M281 56 328 72 385 111 362 203 310 187 310 120Z";

/** Tamaño del nombre según su longitud para que siempre quepa entre los hombros. */
function nameFontSize(name: string) {
  const length = Math.max(name.length, 4);
  return Math.min(34, Math.round(250 / (length * 0.62)));
}

export function DorsalJersey({
  name,
  number,
  palette = JERSEY_PALETTES.night,
  label,
  className,
}: Readonly<{ name: string; number: string; palette?: JerseyPalette; label?: string; className?: string }>) {
  const cleanName = name.trim().slice(0, 12);
  const cleanNumber = number.trim().slice(0, 2);
  const accessibleLabel = label ?? `Espalda de la camiseta${cleanName || cleanNumber ? ` con ${[cleanName && `el nombre ${cleanName}`, cleanNumber && `el número ${cleanNumber}`].filter(Boolean).join(" y ")}` : ""}`;

  return (
    <svg className={className} viewBox="0 0 420 500" role="img" aria-label={accessibleLabel} xmlns="http://www.w3.org/2000/svg">
      <path d={BODY} fill={palette.body} />
      <path d={LEFT_SLEEVE} fill={palette.sleeve} />
      <path d={RIGHT_SLEEVE} fill={palette.sleeve} />
      <path d="M139 56Q158 97 210 99 262 97 281 56" fill="none" stroke={palette.trim} strokeWidth="6" strokeLinecap="round" />
      <path d="M58 203 110 187M362 203 310 187" fill="none" stroke={palette.trim} strokeWidth="4" strokeLinecap="round" />
      <g fill={palette.ink} textAnchor="middle" fontFamily="'Barlow Condensed', var(--font-display), sans-serif" fontWeight="900">
        {cleanName ? (
          <text x="210" y="176" fontSize={nameFontSize(cleanName)} letterSpacing="2">{cleanName}</text>
        ) : null}
        {cleanNumber ? (
          <text x="210" y="352" fontSize="168" letterSpacing="-4">{cleanNumber}</text>
        ) : null}
      </g>
    </svg>
  );
}
