export default function EstadoVacio({ icono: Icono, titulo, descripcion, accion }) {
  return (
    <div className="rounded-superficie border border-dashed border-borde-fuerte px-6 py-12 text-center">
      {Icono && <Icono aria-hidden="true" className="mx-auto h-8 w-8 text-tinta-suave" />}
      <p className="mt-3 font-titulo text-lg font-semibold">{titulo}</p>
      {descripcion && <p className="mx-auto mt-1 max-w-prose text-tinta-suave">{descripcion}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}