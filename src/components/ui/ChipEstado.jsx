import { Check, CircleCheck, CircleX, Clock } from 'lucide-react';

const ESTADOS = {
  PENDIENTE: { texto: 'Pendiente', Icono: Clock, clases: 'bg-acento-suave text-tinta' },
  CONFIRMADA: { texto: 'Confirmada', Icono: CircleCheck, clases: 'bg-primario-suave text-primario' },
  CANCELADA: { texto: 'Cancelada', Icono: CircleX, clases: 'bg-borde text-tinta-suave' },
  COMPLETADA: {
    texto: 'Completada',
    Icono: Check,
    clases: 'border border-borde-fuerte text-tinta-suave',
  },
};

export default function ChipEstado({ estado }) {
  const { texto, Icono, clases } = ESTADOS[estado] ?? ESTADOS.PENDIENTE;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium ${clases}`}
    >
      <Icono aria-hidden="true" className="h-4 w-4" />
      {texto}
    </span>
  );
}