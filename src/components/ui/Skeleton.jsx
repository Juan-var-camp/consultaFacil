export function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-control bg-borde motion-reduce:animate-none ${className}`}
    />
  );
}

// Envuelve un grupo de skeletons y le avisa al lector de pantalla qué se está cargando
export function Cargando({ etiqueta, children }) {
  return (
    <div role="status">
      <span className="sr-only">{etiqueta}</span>
      {children}
    </div>
  );
}