import { peticion } from './cliente';

export const obtenerConsultorios = () => peticion('/consultorios');
export const obtenerConsultorio = (id) => peticion(`/consultorios/${id}`);
export const obtenerDisponibilidad = (id, fecha) =>
  peticion(`/consultorios/${id}/disponibilidad?fecha=${fecha}`);
export const obtenerHorarios = (id) => peticion(`/consultorios/${id}/horarios`);
export const guardarHorarios = (id, datos) =>
  peticion(`/consultorios/${id}/horarios`, { method: 'PUT', body: datos });
export const crearConsultorio = (datos) =>
  peticion('/consultorios', { method: 'POST', body: datos });
export const actualizarConsultorio = (id, datos) =>
  peticion(`/consultorios/${id}`, { method: 'PUT', body: datos });
export const eliminarConsultorio = (id) => peticion(`/consultorios/${id}`, { method: 'DELETE' });