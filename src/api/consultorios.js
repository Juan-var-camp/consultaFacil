import { peticion } from './cliente';

export const obtenerConsultorios = () => peticion('/consultorios');
export const obtenerConsultorio = (id) => peticion(`/consultorios/${id}`);
export const obtenerDisponibilidad = (id, fecha) =>
  peticion(`/consultorios/${id}/disponibilidad?fecha=${fecha}`);