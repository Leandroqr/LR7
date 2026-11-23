"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/ecommerce";
import type { PurchaseInfoItem, SizeGuideRow } from "@/lib/purchase-info";
import { CUSTOM_PRICE, formatCurrency, getBadgeDisplayName, getCategoryDisplayName } from "@/lib/products";
import { isWhatsAppConfigured, SITE_CONFIG } from "@/lib/site";
import { getProductWhatsAppMessage } from "@/lib/whatsapp";
import { WhatsAppLink } from "@/components/commerce/whatsapp-link";
import { useStore } from "@/components/providers/store-provider";
import { JerseySVG } from "@/components/graphics/jersey-svg";
import { ProductCard } from "@/components/product/product-card";

type ProductPageProps = Readonly<{
  product: Product;
  relatedProducts: Product[];
  purchaseInfo?: readonly PurchaseInfoItem[];
  sizeGuide?: readonly SizeGuideRow[];
}>;

/** Solo se preselecciona la talla cuando no hay nada que elegir. */
function getInitialSize(product: Product) {
  const sizes = Array.from(new Set(product.variants.map((variant) => variant.size)));
  return sizes.length === 1 ? sizes[0] : "";
}

function getInitialColor(product: Product, size: string) {
  return size ? product.variants.find((variant) => variant.size === size)?.color ?? "" : "";
}

function getPreviewPersonType(name: string, number: string): "both" | "number" | "none" {
  if (name) return "both";
  if (number) return "number";
  return "none";
}

export function ProductPage({ product, relatedProducts, purchaseInfo = [], sizeGuide = [] }: ProductPageProps) {
  const router = useRouter();
  const [mainImg, setMainImg] = useState(0);
  const [size, setSize] = useState(() => getInitialSize(product));
  const [color, setColor] = useState(() => getInitialColor(product, getInitialSize(product)));
  const [sizeError, setSizeError] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const sizeSelectorRef = useRef<HTMLFieldSetElement>(null);
  const purchasePanelRef = useRef<HTMLElement>(null);
  const sizeGuideRef = useRef<HTMLDialogElement>(null);
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
    const initialSize = getInitialSize(product);
    setSize(initialSize);
    setColor(getInitialColor(product, initialSize));
    setSizeError(false);
  }, [product]);

  // Barra de compra fija (solo visible en móvil por CSS): aparece cuando el bloque de compra
  // ya quedó por encima de la pantalla y se oculta al llegar al footer para no taparlo.
  useEffect(() => {
    const panel = purchasePanelRef.current;
    if (!panel || typeof IntersectionObserver === "undefined") return;
    let panelPassed = false;
    let footerVisible = false;
    const update = () => setShowStickyBar(panelPassed && !footerVisible);
    const panelObserver = new IntersectionObserver(([entry]) => {
      panelPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      update();
    });
    panelObserver.observe(panel);
    const footer = document.querySelector("footer");
    const footerObserver = new IntersectionObserver(([entry]) => {
      footerVisible = entry.isIntersecting;
      update();
    });
    if (footer) footerObserver.observe(footer);
    return () => {
      panelObserver.disconnect();
      footerObserver.disconnect();
    };
  }, []);

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

  const selectSize = (optionSize: string) => {
    setSize(optionSize);
    setColor(product.variants.find((variant) => variant.size === optionSize)?.color ?? "");
    setSizeError(false);
  };

  /** Sin talla no se agrega nada: se avisa y se lleva al selector. */
  const requireSize = () => {
    if (size) return true;
    setSizeError(true);
    const selector = sizeSelectorRef.current;
    selector?.scrollIntoView({ behavior: "smooth", block: "center" });
    selector?.querySelector<HTMLButtonElement>(".size-btn")?.focus({ preventScroll: true });
    return false;
  };

  const handleAddToCart = () => {
    if (!requireSize() || !selectedVariant) return;
    addToCart(selectedCartItem);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!requireSize() || !selectedVariant) return;
    addToCart(selectedCartItem);
    router.push("/carrito");
  };

  const openSizeGuide = () => sizeGuideRef.current?.showModal();
  const hasSizeGuide = sizeGuide.length > 0;
  const purchaseBlocked = Boolean(size) && !selectedVariant;

  return (
    <main className="product-page">
        <nav className="product-breadcrumbs" aria-label="Migas de pan">
          <Link href="/">
            INICIO
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/tienda">
            CATÁLOGO
          </Link>
          <span className="product-breadcrumb-current" aria-hidden="true">/</span>
          <span className="product-breadcrumb-current">
            {product.name.toUpperCase()}
          </span>
        </nav>

        <div className="product-layout">
          <section className="product-gallery-column" aria-label={`Galeria de ${product.name}`}>
            <div className="product-main-image img-zoom">
              <Image src={product.images[mainImg].src} alt={product.images[mainImg].alt} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} loading="eager" fetchPriority="high" />
              {product.badge ? (
                <div className="product-badge">
                  {getBadgeDisplayName(product.badge)}
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
                {getCategoryDisplayName(product.category)}{product.team && product.team !== "Generica" ? ` · ${product.team}` : ""}
              </p>
              <h1 id="product-title" className="font-display">
                {product.name}
              </h1>
              <p className="product-price font-display">
                ${formatCurrency(product.price.amount)}
              </p>
              <p className="product-price-note">Precio en COP · IVA incluido</p>
            </header>

            <fieldset ref={sizeSelectorRef} className={`product-size-selector${sizeError ? " has-error" : ""}`} aria-describedby={sizeError ? "product-size-error" : undefined}>
              <legend>
                {size ? <>TALLA SELECCIONADA: <span style={{ color: "var(--color-accent)" }}>{size}</span></> : "ELIGE TU TALLA"}
              </legend>
              {hasSizeGuide ? (
                <button type="button" className="product-size-guide-trigger" onClick={openSizeGuide}>GUÍA DE TALLAS</button>
              ) : (
                <Link href="/guia-de-tallas" className="product-size-guide-trigger">GUÍA DE TALLAS</Link>
              )}
              <div className="product-size-options">
                {sizeOptions.map((optionSize) => (
                  <button type="button" key={optionSize} className={`size-btn ${size === optionSize ? "active" : ""}`} onClick={() => selectSize(optionSize)} aria-pressed={size === optionSize}>
                    {optionSize}
                  </button>
                ))}
              </div>
              {sizeError ? <p id="product-size-error" className="product-size-error" role="alert">Elige una talla para continuar.</p> : null}
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
                    <p>Nombre y número · +${formatCurrency(customizationPrice)}</p>
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
                        NÚMERO
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

            <section ref={purchasePanelRef} className="product-purchase-panel" aria-label="Resumen de compra">
              <div className="product-total">
                <span className="font-display">TOTAL</span>
                <strong className="font-display">${formatCurrency(customTotal)}</strong>
              </div>
              <button type="button" onClick={handleBuyNow} className="btn-primary product-buy-button" disabled={purchaseBlocked}>
                COMPRAR AHORA
              </button>
              <button type="button" onClick={handleAddToCart} className="btn-outline product-cart-button" aria-live="polite" disabled={purchaseBlocked}>
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
              {purchaseInfo.length > 0 ? (
                <ul className="product-purchase-info" aria-label="Envío y cambios">
                  {purchaseInfo.map((item) => (
                    <li key={item.title}><strong>{item.title}</strong><span>{item.body}</span></li>
                  ))}
                </ul>
              ) : null}
              <div className="product-help-links" aria-label="Información para tu compra">
                {hasSizeGuide ? <button type="button" onClick={openSizeGuide}>GUÍA DE TALLAS</button> : <Link href="/guia-de-tallas">GUÍA DE TALLAS</Link>}
                <Link href="/envios">ENVÍOS</Link>
                <Link href="/cambios-y-devoluciones">CAMBIOS</Link>
              </div>
            </section>

            <p className="product-description">
              {product.description}
            </p>
          </section>
        </div>

        <div className="product-sticky-bar" data-visible={showStickyBar ? "true" : "false"} aria-hidden={!showStickyBar} inert={!showStickyBar}>
          <div className="product-sticky-summary">
            <strong className="font-display">${formatCurrency(customTotal)}</strong>
            <span>{size ? `Talla ${size}` : "Sin talla elegida"}</span>
          </div>
          <button type="button" className="btn-primary" onClick={handleBuyNow} disabled={purchaseBlocked}>
            {size ? "COMPRAR AHORA" : "ELIGE TALLA"}
          </button>
        </div>

        {hasSizeGuide ? (
          <dialog ref={sizeGuideRef} className="product-size-dialog" aria-labelledby="product-size-dialog-title" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
            <div className="product-size-dialog-body">
              <header>
                <h2 id="product-size-dialog-title" className="font-display">GUÍA DE TALLAS</h2>
                <button type="button" onClick={() => sizeGuideRef.current?.close()} aria-label="Cerrar guía de tallas">×</button>
              </header>
              <p>Medidas en centímetros. Mídete sin ropa para mayor precisión.</p>
              <table className="size-guide-table">
                <thead><tr><th scope="col">TALLA</th><th scope="col">PECHO</th><th scope="col">LARGO</th><th scope="col">HOMBRO</th></tr></thead>
                <tbody>{sizeGuide.map((row) => <tr key={row.size}><td>{row.size}</td><td>{row.chest}</td><td>{row.length}</td><td>{row.shoulder}</td></tr>)}</tbody>
              </table>
              <Link href="/guia-de-tallas" className="product-size-dialog-link">VER GUÍA COMPLETA →</Link>
            </div>
          </dialog>
        ) : null}

        {relatedProducts.length > 0 ? (
          <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "5rem 0" }}>
            <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 2rem" }}>
              <p className="font-display" style={{ fontSize: "0.8rem", letterSpacing: "0.25em", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                — TAMBIÉN TE PUEDE GUSTAR
              </p>
              <h2 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, textTransform: "uppercase", marginBottom: "2.5rem" }}>
                MÁS {getCategoryDisplayName(product.category)}
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
