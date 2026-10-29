import { CircleAlert } from 'lucide-react';
import Boton from './Boton';

export default function EstadoError({
  titulo = 'No pudimos cargar la información',
  mensaje,
  onReintentar,
}) {
  return (
    <div
      role="alert"
      className="rounded-superficie border border-peligro/40 bg-peligro-suave px-6 py-8 text-center"
    >
      <CircleAlert aria-hidden="true" className="mx-auto h-6 w-6 text-peligro" />
      <p className="mt-3 font-titulo text-lg font-semibold">{titulo}</p>
      {mensaje && <p className="mt-1 text-tinta-suave">{mensaje}</p>}
      {onReintentar && (
        <Boton variante="secundario" className="mt-4" onClick={onReintentar}>
          Reintentar
        </Boton>
      )}
    </div>
  );
}