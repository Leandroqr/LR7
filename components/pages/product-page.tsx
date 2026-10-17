"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/ecommerce";
import { CUSTOM_PRICE, formatCurrency } from "@/lib/products";
import { isWhatsAppConfigured, SITE_CONFIG } from "@/lib/site";
import { getProductWhatsAppMessage } from "@/lib/whatsapp";
import { WhatsAppLink } from "@/components/commerce/whatsapp-link";
import { useStore } from "@/components/providers/store-provider";
import { JerseySVG } from "@/components/graphics/jersey-svg";
import { ProductCard } from "@/components/product/product-card";

type ProductPageProps = Readonly<{
  product: Product;
  relatedProducts: Product[];
}>;

function getPreviewPersonType(name: string, number: string): "both" | "number" | "none" {
  if (name) return "both";
  if (number) return "number";
  return "none";
}

export function ProductPage({ product, relatedProducts }: ProductPageProps) {
  const router = useRouter();
  const [mainImg, setMainImg] = useState(0);
  const [size, setSize] = useState(product.variants[0]?.size ?? "");
  const [color, setColor] = useState(product.variants[0]?.color ?? "");
  const [wantCustom, setWantCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [view, setView] = useState<"front" | "back">("back");
  const [added, setAdded] = useState(false);
  const { addToCart, favorites, toggleFavorite } = useStore();

  useEffect(() => {
    document.body.classList.add("product-detail-route");
    return () => document.body.classList.remove("product-detail-route");
  }, []);

  useEffect(() => {
    const firstVariant = product.variants[0];
    setSize(firstVariant?.size ?? "");
    setColor(firstVariant?.color ?? "");
  }, [product.slug, product.variants]);

  const isFavorite = favorites.includes(product.id);
  const customizationPrice = product.customization?.price ?? CUSTOM_PRICE;
  const customTotal = product.price.amount + (wantCustom ? customizationPrice : 0);
  const sizeVariants = product.variants.filter((variant) => variant.size === size);
  const selectedVariant = sizeVariants.find((variant) => (variant.color ?? "") === color) ?? sizeVariants[0];
  const colorOptions = Array.from(new Set(sizeVariants.map((variant) => variant.color).filter((value): value is string => Boolean(value))));
  const sizeOptions = Array.from(new Set(product.variants.map((variant) => variant.size)));
  const previewPersonType = getPreviewPersonType(customName, customNumber);

  const productUrl = `${SITE_CONFIG.baseUrl.replace(/\/$/, "")}/productos/${product.slug}`;
  const whatsappMessage = getProductWhatsAppMessage({
    product,
    productUrl,
    size,
    quantity: 1,
    customName: wantCustom ? customName : undefined,
    customNumber: wantCustom ? customNumber : undefined,
  });

  const selectedCartItem = {
    product,
    variant: selectedVariant,
    size,
    customName: wantCustom ? customName : "",
    customNumber: wantCustom ? customNumber : "",
    customization: wantCustom
      ? {
          enabled: true,
          name: customName,
          number: customNumber,
          placement: product.customization?.placement ?? "back",
          price: customizationPrice,
        }
      : undefined,
    quantity: 1,
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(selectedCartItem);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    addToCart(selectedCartItem);
    router.push("/carrito");
  };

  return (
    <main className="product-page">
        <nav className="product-breadcrumbs" aria-label="Migas de pan">
          <Link href="/">
            INICIO
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/tienda">
            CATALOGO
          </Link>
          <span className="product-breadcrumb-current" aria-hidden="true">/</span>
          <span className="product-breadcrumb-current">
            {product.name.toUpperCase()}
          </span>
        </nav>

        <div className="product-layout">
          <section className="product-gallery-column" aria-label={`Galeria de ${product.name}`}>
            <div className="product-main-image img-zoom">
              <Image src={product.images[mainImg].src} alt={product.images[mainImg].alt} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} loading="eager" />
              {product.badge ? (
                <div className="product-badge">
                  {product.badge}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                aria-label={isFavorite ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
                aria-pressed={isFavorite}
                className={`product-favorite-button${isFavorite ? " is-active" : ""}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
            <div className="product-thumbnails" aria-label="Seleccionar imagen">
              {product.images.map((image, index) => (
                <button type="button" key={image.src} onClick={() => setMainImg(index)} aria-label={`Ver imagen ${index + 1} de ${product.name}`} aria-pressed={mainImg === index} className={mainImg === index ? "is-selected" : ""}>
                  <Image src={image.src} alt="" fill sizes="80px" />
                </button>
              ))}
            </div>
          </section>

          <section className="product-details-column" aria-labelledby="product-title">
            <header className="product-header">
              <p className="product-eyebrow">
                {product.category} · {product.team}
              </p>
              <h1 id="product-title" className="font-display">
                {product.name}
              </h1>
              <p className="product-price font-display">
                ${formatCurrency(product.price.amount)}
              </p>
              <p className="product-price-note">Precio en COP · IVA incluido</p>
            </header>

            <fieldset className="product-size-selector">
              <legend>
                TALLA SELECCIONADA: <span style={{ color: "var(--color-accent)" }}>{size || "—"}</span>
              </legend>
              <div className="product-size-options">
                {sizeOptions.map((optionSize) => {
                  const firstVariant = product.variants.find((variant) => variant.size === optionSize);
                  return (
                  <button type="button" key={optionSize} className={`size-btn ${size === optionSize ? "active" : ""}`} onClick={() => { setSize(optionSize); setColor(firstVariant?.color ?? ""); }} aria-pressed={size === optionSize}>
                    {optionSize}
                  </button>
                  );
                })}
              </div>
            </fieldset>

            {colorOptions.length > 0 ? (
              <fieldset className="product-size-selector">
                <legend>COLOR: <span style={{ color: "var(--color-accent)" }}>{color || "—"}</span></legend>
                <div className="product-size-options">
                  {colorOptions.map((optionColor) => (
                    <button type="button" key={optionColor} className={`size-btn ${color === optionColor ? "active" : ""}`} onClick={() => setColor(optionColor)} aria-pressed={color === optionColor}>
                      {optionColor}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {product.personalizable ? (
              <section className={`product-customization${wantCustom ? " is-active" : ""}`}>
                <div className="product-customization-header">
                  <div>
                    <h2 className="font-display">
                      ¿QUIERES PERSONALIZARLA?
                    </h2>
                    <p>Nombre y numero · +${formatCurrency(customizationPrice)}</p>
                  </div>
                  <button type="button" onClick={() => setWantCustom(!wantCustom)} aria-label="Personalizar camiseta" aria-pressed={wantCustom} className="product-customization-toggle">
                    <span />
                  </button>
                </div>

                {wantCustom ? (
                  <div className="product-customization-content">
                    <div>
                      <label htmlFor="custom-name">
                        NOMBRE
                      </label>
                      <input
                        id="custom-name"
                        type="text"
                        maxLength={product.customization?.nameMaxLength ?? 12}
                        value={customName}
                        onChange={(event) => setCustomName(event.target.value.slice(0, product.customization?.nameMaxLength ?? 12).toUpperCase())}
                        placeholder="EJ. LEANDRO"
                      />
                    </div>
                    <div>
                      <label htmlFor="custom-number">
                        NUMERO
                      </label>
                      <input
                        id="custom-number"
                        type="text"
                        inputMode="numeric"
                        maxLength={String(product.customization?.numberMax ?? 99).length}
                        value={customNumber}
                        onChange={(event) => setCustomNumber(event.target.value.replace(/\D/g, "").slice(0, String(product.customization?.numberMax ?? 99).length))}
                        placeholder="10"
                      />
                    </div>
                    <div className="product-customization-preview">
                      <JerseySVG
                        name={customName}
                        number={customNumber}
                        view={view}
                        personType={previewPersonType}
                      />
                      <div className="product-preview-switch">
                        <button type="button" onClick={() => setView("front")} className={view === "front" ? "is-selected" : ""} aria-pressed={view === "front"}>
                          FRENTE
                        </button>
                        <button type="button" onClick={() => setView("back")} className={view === "back" ? "is-selected" : ""} aria-pressed={view === "back"}>
                          ESPALDA
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            <section className="product-purchase-panel" aria-label="Resumen de compra">
              <div className="product-total">
                <span className="font-display">TOTAL</span>
                <strong className="font-display">${formatCurrency(customTotal)}</strong>
              </div>
              <button type="button" onClick={handleBuyNow} className="btn-primary product-buy-button" disabled={!selectedVariant}>
                COMPRAR AHORA
              </button>
              <button type="button" onClick={handleAddToCart} className="btn-outline product-cart-button" aria-live="polite" disabled={!selectedVariant}>
                {added ? "AGREGADO AL CARRITO" : "AGREGAR AL CARRITO"}
              </button>
              {added ? (
                <Link href="/carrito" className="product-view-cart">
                  VER CARRITO
                </Link>
              ) : null}
              {isWhatsAppConfigured() ? (
                <div className="product-whatsapp-support">
                  <p>¿TIENES DUDAS?</p>
                  <WhatsAppLink
                    message={whatsappMessage}
                    eventName="product_whatsapp_click"
                    eventData={{ product_id: product.id, product_name: product.name, size }}
                    aria-label={`Consultar ${product.name} por WhatsApp`}
                  >
                    CONSULTAR POR WHATSAPP <span aria-hidden="true">→</span>
                  </WhatsAppLink>
                </div>
              ) : null}
              <div className="product-help-links" aria-label="Información para tu compra">
                <Link href="/guia-de-tallas">GUÍA DE TALLAS</Link>
                <Link href="/envios">ENVÍOS</Link>
                <Link href="/cambios-y-devoluciones">CAMBIOS</Link>
              </div>
            </section>

            <p className="product-description">
              {product.description}
            </p>
          </section>
        </div>

        {relatedProducts.length > 0 ? (
          <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "5rem 0" }}>
            <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 2rem" }}>
              <p className="font-display" style={{ fontSize: "0.8rem", letterSpacing: "0.25em", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                — TAMBIEN TE PUEDE GUSTAR
              </p>
              <h2 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, textTransform: "uppercase", marginBottom: "2.5rem" }}>
                MAS EN {product.category}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: "2px" }}>
                {relatedProducts.map((related) => (
                  <ProductCard key={related.id} product={related} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
    </main>
  );
}
