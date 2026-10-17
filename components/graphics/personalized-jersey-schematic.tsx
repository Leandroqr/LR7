import { useId } from "react";

type PersonalizedJerseySchematicProps = Readonly<{
  name: string;
  number: string;
  view: "front" | "back";
}>;

export function PersonalizedJerseySchematic({ name, number, view }: PersonalizedJerseySchematicProps) {
  const gradientId = useId().replace(/:/g, "");
  const patternId = useId().replace(/:/g, "");
  const isBack = view === "back";

  return (
    <svg
      className="personalized-jersey-schematic"
      viewBox="0 0 420 500"
      role="img"
      aria-label={`Esquema de camiseta por la ${isBack ? "espalda" : "parte frontal"}${isBack && (name || number) ? ` con ${name ? `nombre ${name}` : ""}${name && number ? " y " : ""}${number ? `número ${number}` : ""}` : ""}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.52" stopColor="#e8edf0" />
          <stop offset="1" stopColor="#cbd4db" />
        </linearGradient>
        <pattern id={patternId} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(22)">
          <path d="M0 0v9" stroke="#10243a" strokeOpacity="0.035" strokeWidth="1" />
        </pattern>
        <filter id={`${gradientId}-shadow`} x="-25%" y="-15%" width="150%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter={`url(#${gradientId}-shadow)`}>
        <path d="M139 56 92 72 35 111 58 203 110 187 110 443Q210 468 310 443L310 187 362 203 385 111 328 72 281 56Q262 97 210 99 158 97 139 56Z" fill={`url(#${gradientId})`} />
        <path d="M139 56 92 72 35 111 58 203 110 187 110 443Q210 468 310 443L310 187 362 203 385 111 328 72 281 56Q262 97 210 99 158 97 139 56Z" fill={`url(#${patternId})`} />
        <path d="M139 56Q158 97 210 99 262 97 281 56" fill="none" stroke="#10243a" strokeWidth="7" />
        <path d="M150 61Q166 87 210 89 254 87 270 61" fill="none" stroke="#ff6a00" strokeWidth="2.5" />
        <path d="M49 117 69 190M371 117 351 190" fill="none" stroke="#ff6a00" strokeOpacity="0.8" strokeWidth="3" />
        <path d="M119 204v228M301 204v228" fill="none" stroke="#10243a" strokeOpacity="0.11" strokeWidth="1" />
        <path d="M127 433q83 18 166 0" fill="none" stroke="#10243a" strokeOpacity="0.2" strokeWidth="2" />
        {isBack ? (
          <g fill="#10243a" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontWeight="900">
            {name ? <text x="210" y="185" fontSize="26" letterSpacing="3">{name.slice(0, 12)}</text> : null}
            {number ? <text x="210" y={name ? "326" : "286"} fontSize="132" letterSpacing="-3">{number.slice(0, 2)}</text> : null}
            {!name && !number ? <text x="210" y="282" fontSize="13" letterSpacing="3" fillOpacity="0.48">VISTA TRASERA</text> : null}
          </g>
        ) : (
          <g fill="#10243a" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontWeight="800">
            <text x="210" y="181" fontSize="14" letterSpacing="2" fillOpacity="0.55">LR7 / ESQUEMA</text>
          </g>
        )}
      </g>
    </svg>
  );
}
