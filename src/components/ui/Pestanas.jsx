import { useRef } from 'react';

export default function Pestanas({ etiqueta, idBase, pestanas, activa, onChange }) {
  const refs = useRef({});

  function alTeclear(evento, indice) {
    const total = pestanas.length;
    let siguiente = null;
    if (evento.key === 'ArrowRight') siguiente = (indice + 1) % total;
    if (evento.key === 'ArrowLeft') siguiente = (indice - 1 + total) % total;
    if (evento.key === 'Home') siguiente = 0;
    if (evento.key === 'End') siguiente = total - 1;
    if (siguiente === null) return;

    evento.preventDefault();
    const { id } = pestanas[siguiente];
    onChange(id);
    refs.current[id]?.focus();
  }

  return (
    <div role="tablist" aria-label={etiqueta} className="flex gap-1 border-b border-borde">
      {pestanas.map(({ id, titulo, conteo }, indice) => {
        const seleccionada = id === activa;
        return (
          <button
            key={id}
            ref={(el) => {
              refs.current[id] = el;
            }}
            role="tab"
            type="button"
            id={`${idBase}-${id}`}
            aria-selected={seleccionada}
            aria-controls={`${idBase}-panel`}
            tabIndex={seleccionada ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={(evento) => alTeclear(evento, indice)}
            className={`-mb-px min-h-11 rounded-t-control border-b-2 px-4 font-medium transition-colors duration-150 ${
              seleccionada
                ? 'border-primario text-primario'
                : 'border-transparent text-tinta-suave hover:bg-borde/40 hover:text-tinta'
            }`}
          >
            {titulo}
            {conteo !== undefined && (
              <span className="ml-2 text-sm font-normal text-tinta-suave">{conteo}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}