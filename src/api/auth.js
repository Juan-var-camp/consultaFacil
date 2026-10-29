import { peticion } from './cliente';

export const iniciarSesion = (datos) =>
  peticion('/auth/login', { method: 'POST', body: datos });

export const registrarse = (datos) =>
  peticion('/auth/registro', { method: 'POST', body: datos });

export const obtenerPerfil = () => peticion('/auth/me');