import { PageHero } from "@/components/layout/page-hero";
import { FavoritesList } from "@/components/pages/favorites-list";
import { getPublicProducts } from "@/lib/catalog";

// Mismo catálogo público que /tienda: con Supabase los ids son uuid y deben coincidir con los guardados.
export default async function FavoritesPage() {
  const products = await getPublicProducts();

  return (
    <>
      <PageHero title="Tus favoritas" />
      <section className="shop-catalog">
        <FavoritesList products={products} />
      </section>
    </>
  );
}
