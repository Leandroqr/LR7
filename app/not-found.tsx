import Link from "next/link";

// 404 (UX8): antes el texto de apoyo era blanco al 50 % sobre fondo blanco y llevaba una etiqueta sobre el título.
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-[1400px] flex-col justify-center px-4 pt-28 pb-20 md:px-8">
      <h1 className="font-display m-0 text-display leading-[0.9] font-black text-night uppercase">
        Esta jugada
        <br />
        no existe.
      </h1>
      <p className="mt-5 mb-8 max-w-[44ch] text-body text-gray-600">La página que buscas no está. Vuelve al inicio o sigue en la tienda.</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/tienda" className="btn-primary">VER LA TIENDA</Link>
        <Link href="/" className="btn-outline">VOLVER AL INICIO</Link>
      </div>
    </div>
  );
}
