import { useState } from 'react';

export function useTema() {
  // La clase "dark" ya fue puesta por el script de index.html
  const [oscuro, setOscuro] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  function alternar() {
    const siguiente = !oscuro;
    document.documentElement.classList.toggle('dark', siguiente);
    try {
      localStorage.setItem('tema', siguiente ? 'oscuro' : 'claro');
    } catch {
      // si el navegador bloquea localStorage, el tema solo dura la sesión
    }
    setOscuro(siguiente);
  }

  return { oscuro, alternar };
}