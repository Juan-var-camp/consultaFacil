const API_URL = import.meta.env.VITE_API_URL;
export const TOKEN_KEY = 'token';

export async function peticion(ruta, { method = 'GET', body } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (respuesta.status === 204) return null;

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    const error = new Error(datos?.error || 'Error en la petición');
    error.status = respuesta.status; // permite distinguir un 404 de otros fallos
    throw error;
  }
  return datos;
}