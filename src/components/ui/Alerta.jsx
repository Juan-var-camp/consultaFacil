import { CircleAlert } from 'lucide-react';

export default function Alerta({ children }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-control border border-peligro/40 bg-peligro-suave p-3 text-sm text-peligro"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}