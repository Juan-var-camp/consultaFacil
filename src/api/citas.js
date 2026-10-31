import { peticion } from './cliente';

export const obtenerCitas = () => peticion('/citas');
export const agendarCita = (datos) => peticion('/citas', { method: 'POST', body: datos });
export const cancelarCita = (id) => peticion(`/citas/${id}/cancelar`, { method: 'PATCH' });
export const cambiarEstadoCita = (id, estado) =>
  peticion(`/citas/${id}`, { method: 'PUT', body: { estado } });