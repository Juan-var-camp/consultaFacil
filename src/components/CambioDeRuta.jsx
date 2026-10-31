import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const TITULOS = {
  '/': 'Inicio',
  '/buscar': 'Buscar consultorio',
  '/login': 'Iniciar sesión',
  '/registro': 'Crear cuenta',
  '/mis-citas': 'Mis citas',
  '/agenda': 'Agenda',
  '/horarios': 'Horarios de atención',
  '/admin/consultorios': 'Consultorios',
  '/admin/usuarios': 'Usuarios',
  '/admin/citas': 'Citas',
};

function tituloDe(pathname) {
  if (pathname.startsWith('/consultorios/')) return 'Consultorio';
  return TITULOS[pathname] ?? 'Página no encontrada';
}

export default function CambioDeRuta() {
  const { pathname } = useLocation();
  const esLaPrimeraVez = useRef(true);

  useEffect(() => {
    document.title = `${tituloDe(pathname)} | ConsultaFácil`;

    // Al abrir la web por primera vez no se mueve nada
    if (esLaPrimeraVez.current) {
      esLaPrimeraVez.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.getElementById('contenido')?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}