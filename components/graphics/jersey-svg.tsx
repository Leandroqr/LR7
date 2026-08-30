type PersonType = "both" | "number" | "none";

type JerseySVGProps = {
  name: string;
  number: string;
  view: "front" | "back";
  personType: PersonType;
};

export function JerseySVG({ name, number, view, personType }: JerseySVGProps) {
  const showName = view === "back" && personType === "both" && name.trim();
  const showNumber =
    view === "back" && (personType === "both" || personType === "number") && number.trim();
  const showFrontNumber =
    view === "front" && (personType === "both" || personType === "number") && number.trim();

  return (
    <svg
      viewBox="0 0 340 400"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: "420px", filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.7))" }}
    >
      <defs>
        <linearGradient id="jbody2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1e1e" />
          <stop offset="100%" stopColor="#141414" />
        </linearGradient>
        <linearGradient id="jside2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path d="M 108,68 C 85,65 30,72 8,100 L 0,148 L 36,156 L 50,110 L 108,90 Z" fill="#191919" />
      <path d="M 232,68 C 255,65 310,72 332,100 L 340,148 L 304,156 L 290,110 L 232,90 Z" fill="#191919" />
      <path
        d="M 108,68 L 50,110 L 50,375 L 290,375 L 290,110 L 232,68 Q 200,50 190,52 Q 170,72 170,74 Q 170,72 150,74 Q 130,72 110,52 Q 120,50 108,68 Z"
        fill="url(#jbody2)"
      />
      <path d="M 110,52 Q 125,72 150,74 Q 175,72 190,52" fill="none" stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round" />
      <rect x="50" y="155" width="8" height="220" fill="url(#jside2)" rx="1" />
      <rect x="282" y="155" width="8" height="220" fill="url(#jside2)" rx="1" />
      <line x1="0" y1="148" x2="36" y2="156" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
      <line x1="340" y1="148" x2="304" y2="156" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M 108,68 C 85,65 30,72 8,100 L 0,148 L 36,156 L 50,110 L 50,375 L 290,375 L 290,110 L 304,156 L 340,148 L 332,100 C 310,72 255,65 232,68 Q 200,50 190,52 Q 170,72 150,74 Q 130,72 110,52 Q 120,50 108,68 Z"
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="1"
      />
      {view === "back" && (
        <>
          {showName && (
            <text x="170" y="218" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontWeight="900" fontSize="30" fill="white" letterSpacing="8">
              {name.toUpperCase().slice(0, 12)}
            </text>
          )}
          {showNumber && (
            <text x="170" y="330" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontWeight="900" fontSize="108" fill="white" opacity="0.95">
              {number.slice(0, 2)}
            </text>
          )}
          {!showName && !showNumber && (
            <text x="170" y="280" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontWeight="700" fontSize="13" fill="rgba(255,255,255,0.18)" letterSpacing="4">
              SIN PERSONALIZACION
            </text>
          )}
        </>
      )}
      {view === "front" && (
        <>
          <rect x="138" y="135" width="48" height="52" rx="4" fill="rgba(17,82,232,0.12)" stroke="rgba(17,82,232,0.3)" strokeWidth="1.5" />
          <text x="162" y="166" textAnchor="middle" fontFamily="'Barlow Condensed'" fontWeight="900" fontSize="10" fill="var(--color-accent)" letterSpacing="1">
            ESCUDO
          </text>
          {showFrontNumber && (
            <text x="170" y="310" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontWeight="900" fontSize="60" fill="rgba(255,255,255,0.15)">
              {number.slice(0, 2)}
            </text>
          )}
        </>
      )}
    </svg>
  );
}
