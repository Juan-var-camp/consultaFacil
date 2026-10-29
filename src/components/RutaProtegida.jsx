import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clasesBoton } from './ui/Boton';
import EstadoVacio from './ui/EstadoVacio';
import { Cargando, Skeleton } from './ui/Skeleton';

export default function RutaProtegida({ roles }) {
  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();

  // Al recargar, se está consultando /auth/me: no decidir todavía
  if (cargando) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <Cargando etiqueta="Verificando sesión">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="mt-6 h-24 w-full" />
        </Cargando>
      </main>
    );
  }

  // Sin sesión: a /login, recordando a dónde quería ir
  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }

  // Con sesión pero sin el rol necesario
  if (roles && !roles.includes(usuario.rol)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <EstadoVacio
          icono={Lock}
          titulo="No tienes acceso a esta página"
          descripcion="Tu cuenta no tiene permisos para ver este contenido."
          accion={
            <Link to="/" className={clasesBoton('secundario')}>
              Ir al inicio
            </Link>
          }
        />
      </main>
    );
  }

  return <Outlet />;
}