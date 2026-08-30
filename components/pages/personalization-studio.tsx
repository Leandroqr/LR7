"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { WhatsAppLink } from "@/components/commerce/whatsapp-link";
import { JerseySVG } from "@/components/graphics/jersey-svg";
import { useStore } from "@/components/providers/store-provider";
import { CUSTOM_PRICE, formatCurrency } from "@/lib/products";
import { SITE_CONFIG } from "@/lib/site";
import { getProductWhatsAppMessage } from "@/lib/whatsapp";
import type { CustomizationSettings, Product, ProductId } from "@/types/ecommerce";

const DEFAULT_SETTINGS: CustomizationSettings = {
  enabled: true,
  price: CUSTOM_PRICE,
  nameMaxLength: 12,
  numberMin: 0,
  numberMax: 99,
  placement: "back",
};

function getNumberError(number: string, settings: CustomizationSettings) {
  if (!number) return "Escribe un número para la camiseta.";
  const numericNumber = Number(number);
  if (numericNumber < settings.numberMin || numericNumber > settings.numberMax) {
    return `El número debe estar entre ${settings.numberMin} y ${settings.numberMax}.`;
  }
  return "";
}

function getCtaLabel(added: boolean, size: string, canAdd: boolean) {
  if (added) return "AÑADIDA AL CARRITO";
  if (!size) return "ELIGE UNA TALLA";
  if (!canAdd) return "COMPLETA TU DISEÑO";
  return "AÑADIR AL CARRITO";
}

type PersonalizationStudioProps = {
  products: Product[];
  initialProductSlug?: string;
};

export function PersonalizationStudio({ products, initialProductSlug }: Readonly<PersonalizationStudioProps>) {
  const initialProduct = products.find((product) => product.slug === initialProductSlug) ?? products[0];
  const [selectedProductId, setSelectedProductId] = useState<ProductId>(initialProduct.id);
  const [size, setSize] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [view, setView] = useState<"front" | "back">("back");
  const [touched, setTouched] = useState({ size: false, name: false, number: false });
  const [added, setAdded] = useState(false);
  const { addToCart } = useStore();
  const nameId = useId();
  const numberId = useId();

  useEffect(() => {
    document.body.classList.add("personalizer-route");
    return () => document.body.classList.remove("personalizer-route");
  }, []);

  const product = products.find((item) => item.id === selectedProductId) ?? products[0];
  const settings = product.customization ?? DEFAULT_SETTINGS;
  const sizes = [...new Set(product.variants.map((variant) => variant.size))];
  const variant = product.variants.find((item) => item.size === size);
  const cleanName = name.trim();
  const nameError = cleanName.length === 0 ? "Escribe el nombre que irá en la camiseta." : "";
  const numberError = getNumberError(number, settings);
  const canAdd = Boolean(variant && !nameError && !numberError);
  const total = product.price.amount + settings.price;

  useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [added]);

  const selectProduct = (productId: ProductId) => {
    setSelectedProductId(productId);
    setSize("");
    setTouched((current) => ({ ...current, size: false }));
    setAdded(false);
  };

  const updateName = (value: string) => {
    const sanitized = value
      .toUpperCase()
      .replace(/[^A-ZÁÉÍÓÚÜÑ ]/g, "")
      .replace(/\s{2,}/g, " ")
      .slice(0, settings.nameMaxLength);
    setName(sanitized);
    setTouched((current) => ({ ...current, name: true }));
    setAdded(false);
  };

  const updateNumber = (value: string) => {
    setNumber(value.replace(/\D/g, "").slice(0, String(settings.numberMax).length));
    setTouched((current) => ({ ...current, number: true }));
    setAdded(false);
  };

  const handleAdd = () => {
    setTouched({ size: true, name: true, number: true });
    if (!canAdd || !variant) return;

    addToCart({
      product,
      variant,
      size: variant.size,
      customName: cleanName,
      customNumber: number,
      customization: {
        enabled: true,
        name: cleanName,
        number,
        placement: settings.placement,
        price: settings.price,
      },
      unitPrice: total,
      quantity: 1,
    });
    setAdded(true);
  };

  const whatsappMessage = getProductWhatsAppMessage({
    product,
    productUrl: `${SITE_CONFIG.baseUrl.replace(/\/$/, "")}/productos/${product.slug}`,
    size: size || "Por elegir",
    quantity: 1,
    customName: cleanName || undefined,
    customNumber: number || undefined,
  });

  const ctaLabel = getCtaLabel(added, size, canAdd);

  return (
    <main className="personalizer-page">
      <header className="personalizer-header">
        <p>LR7 CUSTOM STUDIO</p>
        <h1 className="font-display">TU NOMBRE.<br /><span>TU NÚMERO.</span></h1>
        <div>
          <span>PERSONALIZACIÓN PROFESIONAL</span>
          <p>Configura cada detalle y revisa el resultado antes de añadirlo al carrito.</p>
        </div>
      </header>

      <div className="personalizer-shell">
        <PreviewStage product={product} name={cleanName} number={number} view={view} setView={setView} />

        <section className="personalizer-controls" aria-labelledby="customizer-title">
          <div className="personalizer-controls-heading">
            <p>CONFIGURA TU CAMISETA</p>
            <h2 id="customizer-title" className="font-display">PERSONALIZA</h2>
          </div>

          <ProductPicker products={products} product={product} onSelect={selectProduct} />

          <CustomizationStep number="01" title="ELIGE TU TALLA" meta={size ? `SELECCIONADA: ${size}` : "REQUERIDA"}>
            <fieldset className="personalizer-sizes">
              <legend className="personalizer-visually-hidden">Talla</legend>
              {sizes.map((currentSize) => (
                <button
                  type="button"
                  key={currentSize}
                  onClick={() => { setSize(currentSize); setTouched((current) => ({ ...current, size: true })); setAdded(false); }}
                  className={size === currentSize ? "is-selected" : ""}
                  aria-pressed={size === currentSize}
                >
                  {currentSize}<span aria-hidden="true">{size === currentSize ? "✓" : ""}</span>
                </button>
              ))}
            </fieldset>
            {touched.size && !size ? <p className="personalizer-field-error" role="alert">Selecciona una talla disponible.</p> : null}
          </CustomizationStep>

          <CustomizationStep number="02" title="NOMBRE" meta={`${name.length} / ${settings.nameMaxLength}`}>
            <label htmlFor={nameId} className="personalizer-label">NOMBRE EN LA CAMISETA</label>
            <input
              id={nameId}
              value={name}
              onChange={(event) => updateName(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, name: true }))}
              placeholder="ESCRIBE TU NOMBRE"
              autoComplete="off"
              aria-invalid={touched.name && Boolean(nameError)}
              aria-describedby={`${nameId}-hint`}
            />
            <div className="personalizer-field-footer" id={`${nameId}-hint`}>
              <span>Solo letras y espacios</span>
              {touched.name && nameError ? <strong role="alert">{nameError}</strong> : null}
            </div>
          </CustomizationStep>

          <CustomizationStep number="03" title="NÚMERO" meta={`${settings.numberMin}–${settings.numberMax}`}>
            <label htmlFor={numberId} className="personalizer-label">NÚMERO EN LA CAMISETA</label>
            <div className="personalizer-number-field">
              <input
                id={numberId}
                inputMode="numeric"
                value={number}
                onChange={(event) => updateNumber(event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, number: true }))}
                placeholder="7"
                aria-invalid={touched.number && Boolean(numberError)}
                aria-describedby={`${numberId}-hint`}
              />
              <span>MÁX. {String(settings.numberMax).length} DÍGITOS</span>
            </div>
            <div className="personalizer-field-footer" id={`${numberId}-hint`}>
              <span>Se aplicará en la espalda</span>
              {touched.number && numberError ? <strong role="alert">{numberError}</strong> : null}
            </div>
          </CustomizationStep>

          <CustomizationStep number="04" title="REVISA TU DISEÑO" meta="VISTA PREVIA">
            <CustomizationSummary product={product} size={size} name={cleanName} number={number} settings={settings} total={total} />
          </CustomizationStep>

          <div className="personalizer-pricing" aria-label="Desglose de precio">
            <div><span>Precio base</span><strong>${formatCurrency(product.price.amount)}</strong></div>
            <div><span>Personalización</span><strong>+ ${formatCurrency(settings.price)}</strong></div>
            <div className="personalizer-total"><span>TOTAL</span><strong>${formatCurrency(total)}</strong></div>
          </div>

          <div className="personalizer-purchase">
            <button type="button" onClick={handleAdd} className={added ? "is-added" : ""} aria-disabled={!canAdd}>
              <span>{ctaLabel}</span><b aria-hidden="true">{added ? "✓" : "→"}</b>
            </button>
            <p aria-live="polite">{added ? `${product.name}, talla ${size}, fue añadida al carrito.` : "Revisa tu diseño antes de comprar."}</p>
          </div>

          <div className="personalizer-help">
            <span>¿NECESITAS AYUDA?</span>
            <WhatsAppLink
              message={whatsappMessage}
              eventName="product_whatsapp_click"
              eventData={{ product_id: product.id, product_name: product.name, size, placement: "personalizer" }}
              aria-label={`Consultar personalización de ${product.name} por WhatsApp`}
            >
              HABLA CON LR7 POR WHATSAPP <b aria-hidden="true">→</b>
            </WhatsAppLink>
          </div>
        </section>
      </div>

      <div className="personalizer-mobile-dock">
        <div><span>TOTAL</span><strong>${formatCurrency(total)}</strong></div>
        <button type="button" onClick={handleAdd} className={added ? "is-added" : ""} aria-disabled={!canAdd}>{added ? "AÑADIDA ✓" : ctaLabel}</button>
      </div>
    </main>
  );
}

function PreviewStage({ product, name, number, view, setView }: Readonly<{
  product: Product;
  name: string;
  number: string;
  view: "front" | "back";
  setView: (view: "front" | "back") => void;
}>) {
  return (
    <section className="personalizer-preview" aria-label="Vista previa de la camiseta">
      <div className="personalizer-preview-topline"><span>VISTA PREVIA</span><span>ACTUALIZACIÓN EN VIVO</span></div>
      <fieldset className="personalizer-view-switch">
        <legend className="personalizer-visually-hidden">Vista de camiseta</legend>
        {(["front", "back"] as const).map((currentView) => (
          <button type="button" key={currentView} onClick={() => setView(currentView)} className={view === currentView ? "is-selected" : ""} aria-pressed={view === currentView}>
            {currentView === "front" ? "FRENTE" : "ESPALDA"}
          </button>
        ))}
      </fieldset>
      <div className="personalizer-jersey" key={`${product.id}-${view}-${name}-${number}`}>
        <JerseySVG name={name} number={number} view={view} personType="both" />
      </div>
      <div className="personalizer-preview-caption">
        <div><span>CAMISETA</span><strong>{product.name}</strong></div>
        <p>Visualización de diseño. El tono y la ubicación final pueden variar ligeramente según la prenda.</p>
      </div>
    </section>
  );
}

function ProductPicker({ products, product, onSelect }: Readonly<{
  products: Product[];
  product: Product;
  onSelect: (productId: ProductId) => void;
}>) {
  if (products.length <= 1) return null;

  return (
    <fieldset className="personalizer-product-picker">
      <legend className="personalizer-visually-hidden">Camiseta a personalizar</legend>
      {products.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={item.id === product.id ? "is-selected" : ""}
          aria-pressed={item.id === product.id}
        >
          <Image src={item.images[0].src} alt="" width={48} height={58} />
          <span><strong>{item.name}</strong><small>${formatCurrency(item.price.amount)}</small></span>
          <b aria-hidden="true">{item.id === product.id ? "✓" : ""}</b>
        </button>
      ))}
    </fieldset>
  );
}

function CustomizationStep({ number, title, meta, children }: Readonly<{ number: string; title: string; meta: string; children: React.ReactNode }>) {
  return (
    <section className="personalizer-step">
      <header><span>{number}</span><h3 className="font-display">{title}</h3><small>{meta}</small></header>
      <div className="personalizer-step-body">{children}</div>
    </section>
  );
}

function CustomizationSummary({ product, size, name, number, settings, total }: Readonly<{
  product: Product;
  size: string;
  name: string;
  number: string;
  settings: CustomizationSettings;
  total: number;
}>) {
  return (
    <dl className="personalizer-summary">
      <div><dt>Camiseta</dt><dd>{product.name}</dd></div>
      <div><dt>Talla</dt><dd>{size || "Por elegir"}</dd></div>
      <div><dt>Nombre</dt><dd>{name || "Por definir"}</dd></div>
      <div><dt>Número</dt><dd>{number || "Por definir"}</dd></div>
      <div><dt>Posición</dt><dd>{settings.placement === "back" ? "Espalda" : settings.placement}</dd></div>
      <div><dt>Total</dt><dd>${formatCurrency(total)}</dd></div>
    </dl>
  );
}
