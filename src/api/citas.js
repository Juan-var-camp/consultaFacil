import { peticion } from './cliente';

export const obtenerCitas = () => peticion('/citas');
export const agendarCita = (datos) => peticion('/citas', { method: 'POST', body: datos });
export const cancelarCita = (id) => peticion(`/citas/${id}/cancelar`, { method: 'PATCH' });
export const cambiarEstadoCita = (id, estado) =>
  peticion(`/citas/${id}`, { method: 'PUT', body: { estado } });

// Solo para el admin: puede filtrar por estado y consultorio en el servidor
export function buscarCitas({ estado, consultorioId } = {}) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  if (consultorioId) params.set('consultorioId', consultorioId);
  const consulta = params.toString();
  return peticion(`/citas${consulta ? `?${consulta}` : ''}`);
}