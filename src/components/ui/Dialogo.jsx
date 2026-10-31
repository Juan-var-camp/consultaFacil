import { useEffect, useId, useRef } from 'react';

export default function Dialogo({ abierto, onCerrar, titulo, children }) {
  const ref = useRef(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      onClick={(evento) => {
        // Clic en el fondo oscuro (el propio <dialog>) cierra el diálogo
        if (evento.target === ref.current) onCerrar();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-superficie border border-borde bg-superficie p-0 text-tinta shadow-dialogo backdrop:bg-tinta/50"
    >
      <div className="p-6">
        <h2 id={idTitulo} className="text-xl">
          {titulo}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </dialog>
  );
}