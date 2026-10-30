import { peticion } from './cliente';

export const agendarCita = (datos) => peticion('/citas', { method: 'POST', body: datos });