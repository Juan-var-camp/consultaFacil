import { Check } from 'lucide-react';
import { formatearHora, horaDelDia } from '../lib/fechas';

function Bloque({ titulo, horarios, valor, onChange }) {
  if (horarios.length === 0) return null;

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-tinta-suave">{titulo}</legend>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {horarios.map(({ inicio, libre }) => {
          const elegido = valor === inicio;
          const estilo = !libre
            ? 'cursor-not-allowed border-borde bg-superficie text-tinta-suave line-through opacity-60'
            : elegido
              ? 'cursor-pointer border-tinta bg-acento font-semibold text-sobre-acento'
              : 'cursor-pointer border-borde-fuerte bg-superficie hover:bg-borde/40 active:bg-borde';

          return (
            <label key={inicio} className="relative block">
              <input
                type="radio"
                name="horario"
                value={inicio}
                checked={elegido}
                disabled={!libre}
                onChange={() => onChange(inicio)}
                className="peer sr-only"
              />
              <span
                className={`flex min-h-11 items-center justify-center gap-1 rounded-control border-2 px-2 tabular-nums transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primario ${estilo}`}
              >
                {elegido && <Check aria-hidden="true" className="h-4 w-4" />}
                {formatearHora(inicio)}
                {!libre && <span className="sr-only"> (no disponible)</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function SelectorHorarios({ horarios, valor, onChange }) {
  const manana = horarios.filter((h) => horaDelDia(h.inicio) < 12);
  const tarde = horarios.filter((h) => horaDelDia(h.inicio) >= 12);

  return (
    <div className="space-y-5">
      <Bloque titulo="Mañana" horarios={manana} valor={valor} onChange={onChange} />
      <Bloque titulo="Tarde" horarios={tarde} valor={valor} onChange={onChange} />
    </div>
  );
}