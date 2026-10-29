import { forwardRef, useId } from 'react';
import { CircleAlert } from 'lucide-react';

const base =
  'min-h-11 w-full rounded-control border bg-superficie px-3 py-2 text-base text-tinta placeholder:text-tinta-suave disabled:cursor-not-allowed disabled:opacity-50';

const Campo = forwardRef(function Campo(
  { etiqueta, ayuda, error, opcional = false, como: Elemento = 'input', id, className = '', children, ...props },
  ref
) {
  const idAuto = useId();
  const idCampo = id ?? idAuto;
  const idAyuda = ayuda ? `${idCampo}-ayuda` : undefined;
  const idError = error ? `${idCampo}-error` : undefined;
  const describedBy = [idAyuda, idError].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={idCampo} className="mb-1 block text-sm font-medium">
        {etiqueta}
        {opcional && <span className="font-normal text-tinta-suave"> (opcional)</span>}
      </label>

      <Elemento
        ref={ref}
        id={idCampo}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`${base} ${
          error ? 'border-peligro' : 'border-borde-fuerte hover:border-tinta-suave'
        } ${className}`}
        {...props}
      >
        {children}
      </Elemento>

      {ayuda && (
        <p id={idAyuda} className="mt-1 text-sm text-tinta-suave">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="mt-1 flex items-center gap-1 text-sm text-peligro">
          <CircleAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});

export default Campo;