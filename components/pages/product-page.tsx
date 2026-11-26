"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/ecommerce";
import type { PurchaseInfoItem, SizeGuideRow } from "@/lib/purchase-info";
import { CUSTOM_PRICE, formatCurrency, getBadgeDisplayName, getCategoryDisplayName } from "@/lib/products";
import { sanitizeDorsalName, sanitizeDorsalNumber } from "@/lib/dorsal";
import { jerseyNumberFor, jerseyPaletteFor } from "@/lib/product-visual";
import { isWhatsAppConfigured, SITE_CONFIG } from "@/lib/site";
import { getProductWhatsAppMessage } from "@/lib/whatsapp";
import { toAnalyticsItem, trackEcommerce } from "@/lib/analytics";
import { WhatsAppLink } from "@/components/commerce/whatsapp-link";
import { useStore } from "@/components/providers/store-provider";
import { DorsalJersey, JERSEY_PALETTES } from "@/components/graphics/dorsal-jersey";
import { FavoriteButton } from "@/components/product/favorite-button";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";

const CLOSE_ICON = <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12" /></svg>;

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

export function ProductPage({ product, relatedProducts, purchaseInfo = [], sizeGuide = [] }: ProductPageProps) {
  const router = useRouter();
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
  const [added, setAdded] = useState(false);
  const { addToCart } = useStore();

  useEffect(() => {
    trackEcommerce("view_item", [toAnalyticsItem(product)]);
  }, [product]);

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
    // El footer cuenta como visible cuando entra en el 60 % superior de la pantalla: si solo asoma
    // por abajo (fichas cortas en móvil), la barra sigue disponible.
    const footerObserver = new IntersectionObserver(([entry]) => {
      footerVisible = entry.isIntersecting;
      update();
    }, { rootMargin: "0px 0px -40% 0px" });
    if (footer) footerObserver.observe(footer);
    return () => {
      panelObserver.disconnect();
      footerObserver.disconnect();
    };
  }, []);

  const customizationPrice = product.customization?.price ?? CUSTOM_PRICE;
  const customTotal = product.price.amount + (wantCustom ? customizationPrice : 0);
  const sizeVariants = product.variants.filter((variant) => variant.size === size);
  const selectedVariant = sizeVariants.find((variant) => (variant.color ?? "") === color) ?? sizeVariants[0];
  const colorOptions = Array.from(new Set(sizeVariants.map((variant) => variant.color).filter((value): value is string => Boolean(value))));
  const sizeOptions = Array.from(new Set(product.variants.map((variant) => variant.size)));
  const nameMaxLength = product.customization?.nameMaxLength ?? 12;
  const numberMax = product.customization?.numberMax ?? 99;

  // Galería: las fotos del producto (de stock hasta que haya propias). El render solo aparece si no hay
  // ninguna; el dorsal en vivo se ve dentro del bloque de personalización.
  const galleryImages = product.images.filter((image) => Boolean(image.src));
  const showRender = galleryImages.length === 0;
  const galleryOverlay = (
    <>
      {product.badge ? <Badge className="product-badge">{getBadgeDisplayName(product.badge)}</Badge> : null}
      <FavoriteButton productId={product.id} productName={product.name} className="product-favorite" />
    </>
  );
  const jerseyPalette = JERSEY_PALETTES[jerseyPaletteFor(product)];
  const renderName = wantCustom ? customName.trim() || "TU NOMBRE" : "";
  const renderNumber = wantCustom ? customNumber || "10" : jerseyNumberFor(product);

  const productUrl = `${SITE_CONFIG.baseUrl.replace(/\/$/, "")}/productos/${product.slug}`;
  const whatsappMessage = getProductWhatsAppMessage({
    product,
    productUrl,
    size,
    quantity: 1,
    customName: wantCustom ? customName.trim() : undefined,
    customNumber: wantCustom ? customNumber : undefined,
  });

  const selectedCartItem = {
    product,
    variant: selectedVariant,
    size,
    customName: wantCustom ? customName.trim() : "",
    customNumber: wantCustom ? customNumber : "",
    customization: wantCustom
      ? {
          enabled: true,
          name: customName.trim(),
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
    addToCart(selectedCartItem, { notify: true });
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
    <div className="product-page">
        <nav className="product-breadcrumbs" aria-label="Migas de pan">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link href="/tienda">Tienda</Link>
          <span className="product-breadcrumb-current" aria-hidden="true">/</span>
          <span className="product-breadcrumb-current" aria-current="page">{product.name}</span>
        </nav>

        <div className="product-layout">
          <section className="product-gallery-column" aria-label={`Galería de ${product.name}`}>
            {showRender ? (
              <div className="product-main-image is-render">
                <DorsalJersey
                  className="product-main-render"
                  name=""
                  number={jerseyNumberFor(product)}
                  palette={jerseyPalette}
                  label={`Ilustración de ${product.name}`}
                />
                {galleryOverlay}
              </div>
            ) : (
              <ProductGallery images={galleryImages} productName={product.name} overlay={galleryOverlay} />
            )}
          </section>

          <section className="product-details-column" aria-labelledby="product-title">
            <header className="product-header">
              <h1 id="product-title" className="font-display">{product.name}</h1>
              <p className="product-meta">{getCategoryDisplayName(product.category)}</p>
              <Price amount={product.price.amount} className="product-price" />
              <p className="product-price-note">Precio en pesos colombianos, IVA incluido.</p>
            </header>

            <fieldset ref={sizeSelectorRef} className={`product-size-selector${sizeError ? " has-error" : ""}`} aria-describedby={sizeError ? "product-size-error" : undefined}>
              <legend>
                {size ? `Talla ${size}` : "Elige tu talla"}
              </legend>
              {hasSizeGuide ? (
                <button type="button" className="product-size-guide-trigger" onClick={openSizeGuide}>Guía de tallas</button>
              ) : (
                <Link href="/guia-de-tallas" className="product-size-guide-trigger">Guía de tallas</Link>
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
                <legend>{color ? `Color ${color}` : "Elige el color"}</legend>
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
              <section className={`product-customization${wantCustom ? " is-active" : ""}`} aria-labelledby="product-customization-title">
                <div className="product-customization-header">
                  <div>
                    <h2 id="product-customization-title" className="font-display">Ponle tu nombre y número</h2>
                    <p>En la espalda, por ${formatCurrency(customizationPrice)} más.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={wantCustom}
                    aria-labelledby="product-customization-title"
                    onClick={() => setWantCustom(!wantCustom)}
                    className="product-customization-toggle"
                  >
                    <span />
                  </button>
                </div>

                {wantCustom ? (
                  <div className="product-customization-content">
                    <div className="product-customization-field">
                      <label htmlFor="custom-name">Nombre</label>
                      <input
                        id="custom-name"
                        type="text"
                        maxLength={nameMaxLength}
                        value={customName}
                        onChange={(event) => setCustomName(sanitizeDorsalName(event.target.value, nameMaxLength))}
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        placeholder="APELLIDO"
                      />
                    </div>
                    <div className="product-customization-field product-customization-number">
                      <label htmlFor="custom-number">Número</label>
                      <input
                        id="custom-number"
                        type="text"
                        inputMode="numeric"
                        maxLength={String(numberMax).length}
                        value={customNumber}
                        onChange={(event) => setCustomNumber(sanitizeDorsalNumber(event.target.value, numberMax))}
                        autoComplete="off"
                        placeholder="10"
                      />
                    </div>
                    {/* La espalda en vivo junto a los campos: se ve mientras se escribe (la galería sigue siendo de fotos). */}
                    <div className="product-customization-preview">
                      <DorsalJersey name={renderName} number={renderNumber} palette={jerseyPalette} label={`Vista previa: espalda con ${customName.trim() ? `el nombre ${customName.trim()}` : "tu nombre"} y el número ${customNumber || "10"}`} />
                    </div>
                    <p className="product-customization-note">Las camisetas personalizadas no tienen cambio, salvo defecto de fábrica.</p>
                  </div>
                ) : null}
              </section>
            ) : null}

            <section ref={purchasePanelRef} className="product-purchase-panel" aria-label="Resumen de compra">
              <div className="product-total">
                <span>Total</span>
                <strong className="font-display">${formatCurrency(customTotal)}</strong>
              </div>
              <button type="button" onClick={handleBuyNow} className="btn-primary product-buy-button" disabled={purchaseBlocked}>
                COMPRAR AHORA
              </button>
              <button type="button" onClick={handleAddToCart} className={`btn-outline product-cart-button${added ? " is-added" : ""}`} aria-live="polite" disabled={purchaseBlocked}>
                {added ? (
                  <>
                    <svg className="product-cart-check" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    AGREGADO AL CARRITO
                  </>
                ) : "AGREGAR AL CARRITO"}
              </button>
              {added ? (
                <Link href="/carrito" className="product-view-cart">
                  VER CARRITO
                </Link>
              ) : null}
              {isWhatsAppConfigured() ? (
                <div className="product-whatsapp-support">
                  <p>¿Tienes dudas?</p>
                  <WhatsAppLink
                    message={whatsappMessage}
                    eventName="product_whatsapp_click"
                    eventData={{ product_id: product.id, product_name: product.name, size }}
                    aria-label={`Consultar ${product.name} por WhatsApp`}
                  >
                    CONSULTAR POR WHATSAPP
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
                {hasSizeGuide ? <button type="button" onClick={openSizeGuide}>Guía de tallas</button> : <Link href="/guia-de-tallas">Guía de tallas</Link>}
                <Link href="/envios">Envíos</Link>
                <Link href="/cambios-y-devoluciones">Cambios</Link>
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
                <h2 id="product-size-dialog-title" className="font-display">Guía de tallas</h2>
                <button type="button" onClick={() => sizeGuideRef.current?.close()} aria-label="Cerrar guía de tallas">{CLOSE_ICON}</button>
              </header>
              <p>Medidas en centímetros. Mídete sin ropa para mayor precisión.</p>
              <table className="size-guide-table">
                <thead><tr><th scope="col">Talla</th><th scope="col">Pecho</th><th scope="col">Largo</th><th scope="col">Hombro</th></tr></thead>
                <tbody>{sizeGuide.map((row) => <tr key={row.size}><td>{row.size}</td><td>{row.chest}</td><td>{row.length}</td><td>{row.shoulder}</td></tr>)}</tbody>
              </table>
              <Link href="/guia-de-tallas" className="product-size-dialog-link">Ver la guía completa</Link>
            </div>
          </dialog>
        ) : null}

        {relatedProducts.length > 0 ? (
          <section className="product-related" aria-labelledby="product-related-title">
            <h2 id="product-related-title" className="font-display">También te puede gustar</h2>
            <div className="product-grid">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        ) : null}
    </div>
  );
}
