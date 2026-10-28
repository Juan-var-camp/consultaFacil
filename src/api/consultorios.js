const API_URL = import.meta.env.VITE_API_URL;

export async function obtenerConsultorios() {
  const respuesta = await fetch(`${API_URL}/consultorios`);

  // fetch NO lanza error con 404/500, hay que revisarlo a mano
  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los consultorios');
  }

  return respuesta.json();
}