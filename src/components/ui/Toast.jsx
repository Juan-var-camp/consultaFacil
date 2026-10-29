import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);

  const quitar = useCallback((id) => {
    setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id));
  }, []);

  const mostrar = useCallback(
    (mensaje, tipo) => {
      const id = crypto.randomUUID();
      setAvisos((actuales) => [...actuales, { id, mensaje, tipo }]);
      // Los éxitos se van solos; los errores se quedan hasta que la persona los cierre
      if (tipo === 'exito') setTimeout(() => quitar(id), 5000);
    },
    [quitar]
  );

  const valor = useMemo(
    () => ({
      exito: (mensaje) => mostrar(mensaje, 'exito'),
      error: (mensaje) => mostrar(mensaje, 'error'),
    }),
    [mostrar]
  );

  return (
    <ToastContext.Provider value={valor}>
      {children}

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 mx-auto flex w-full max-w-sm flex-col gap-2 px-4"
      >
        {avisos.map(({ id, mensaje, tipo }) => (
          <div
            key={id}
            className="pointer-events-auto flex items-start gap-3 rounded-superficie border border-borde bg-superficie p-3 shadow-menu"
          >
            {tipo === 'exito' ? (
              <CircleCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primario" />
            ) : (
              <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-peligro" />
            )}
            <p className="flex-1">{mensaje}</p>
            <button
              type="button"
              onClick={() => quitar(id)}
              aria-label="Cerrar aviso"
              className="rounded-control p-1 text-tinta-suave hover:bg-borde/40 hover:text-tinta"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error('useToast debe usarse dentro de ToastProvider');
  return contexto;
}