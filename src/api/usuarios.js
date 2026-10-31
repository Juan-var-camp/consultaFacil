import { peticion } from './cliente';

export const obtenerUsuarios = () => peticion('/usuarios');
export const cambiarAcceso = (id, datos) =>
  peticion(`/usuarios/${id}/acceso`, { method: 'PATCH', body: datos });