import { formatCurrency } from "@/lib/products";

// Precio en COP con precio anterior opcional; el anterior solo se muestra si es mayor (DESIGN.md / ROADMAP M4).
export function Price({ amount, compareAt, className }: Readonly<{ amount: number; compareAt?: number | null; className?: string }>) {
  const showCompare = typeof compareAt === "number" && compareAt > amount;
  return (
    <span className={["ui-price", className ?? ""].filter(Boolean).join(" ")}>
      <span className="ui-price-current">${formatCurrency(amount)}</span>
      {showCompare ? (
        <s className="ui-price-compare">
          <span className="ui-visually-hidden">Antes </span>${formatCurrency(compareAt)}
        </s>
      ) : null}
    </span>
  );
}
