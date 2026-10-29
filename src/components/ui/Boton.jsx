const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 py-2 text-base font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50';

const variantes = {
  primario:
    'bg-primario text-sobre-primario hover:bg-primario-hover active:bg-primario-active',
  secundario:
    'border border-borde-fuerte bg-superficie text-tinta hover:bg-borde/40 active:bg-borde',
  fantasma: 'text-tinta hover:bg-borde/40 active:bg-borde',
  peligro: 'bg-peligro text-sobre-peligro hover:opacity-90 active:opacity-80',
};

// Se exporta aparte para que un <Link> pueda verse como botón
export function clasesBoton(variante = 'primario') {
  return `${base} ${variantes[variante]}`;
}

export default function Boton({
  variante = 'primario',
  cargando = false,
  textoCargando,
  type = 'button',
  disabled,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`${clasesBoton(variante)} ${className}`}
      {...props}
    >
      {cargando && textoCargando ? textoCargando : children}
    </button>
  );
}