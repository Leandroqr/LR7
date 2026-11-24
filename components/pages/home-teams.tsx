import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/ecommerce";

const NO_TEAM = new Set(["", "generica", "genérica"]);

type TeamEntry = Readonly<{ name: string; count: number; image?: { src: string; alt: string } }>;

/** Equipos reales del catálogo (campo `team`), con cuántas camisetas tiene cada uno y la foto de una. */
export function getCatalogTeams(products: Product[], limit = 8): TeamEntry[] {
  const teams = new Map<string, { name: string; count: number; image?: { src: string; alt: string } }>();
  for (const product of products) {
    if (product.brand !== "FUTBOL") continue;
    const name = product.team?.trim() ?? "";
    if (NO_TEAM.has(name.toLowerCase())) continue;
    const entry = teams.get(name) ?? { name, count: 0 };
    entry.count += 1;
    if (!entry.image && product.images[0]?.src) entry.image = product.images[0];
    teams.set(name, entry);
  }
  return [...teams.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es")).slice(0, limit);
}

/**
 * Busca por equipo, justo debajo del hero. Sin escudos (son marcas de terceros): cada equipo lleva la
 * foto de una de sus camisetas del catálogo y enlaza a la búsqueda, que filtra por equipo.
 */
export function HomeTeams({ products }: Readonly<{ products: Product[] }>) {
  const teams = getCatalogTeams(products);
  if (teams.length === 0) return null;

  return (
    <section className="border-0 border-t border-solid border-white/10 bg-night text-white" aria-labelledby="home-teams-title">
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 lg:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="home-teams-title" className="home-headline font-display m-0 text-white">Busca por equipo</h2>
          <Link href="/futbol" className="inline-flex min-h-11 shrink-0 items-center text-body-sm font-semibold text-action-on-dark underline-offset-4 hover:underline">
            Ver todo el fútbol
          </Link>
        </div>
        <ul className="-mx-4 my-0 flex snap-x snap-mandatory scroll-px-4 list-none gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-6">
          {teams.map((team) => (
            <li key={team.name} className="w-36 shrink-0 snap-start md:w-auto">
              <Link
                href={`/buscar?q=${encodeURIComponent(team.name)}`}
                className="group flex h-full flex-col items-center gap-3 rounded-button border border-solid border-white/12 bg-navy px-3 py-5 text-center text-white no-underline transition-colors duration-(--duration-state) hover:border-white/40 hover:bg-white/8 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-action-on-dark motion-safe:active:scale-[0.98]"
              >
                <span className="relative block size-16 overflow-hidden rounded-full bg-steel ring-2 ring-white/15 transition-transform duration-(--duration-state) ease-out group-hover:scale-105" aria-hidden="true">
                  {team.image ? <Image src={team.image.src} alt="" fill sizes="64px" className="object-cover" /> : null}
                </span>
                <span className="grid gap-0.5">
                  <span className="font-heading text-[1.0625rem] leading-tight font-bold tracking-[0.02em] uppercase">{team.name}</span>
                  <span className="text-caption text-white/70">{team.count} {team.count === 1 ? "camiseta" : "camisetas"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
