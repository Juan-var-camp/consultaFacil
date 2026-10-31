import { formatearHora } from './fechas';

const NOMBRES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const ORDEN = [1, 2, 3, 4, 5, 6, 0]; // la semana empieza el lunes

const capitalizar = (texto) => texto[0].toUpperCase() + texto.slice(1);

// '08:00' -> '8:00 a. m.'
const hora = (hhmm) => formatearHora(`2000-01-03T${hhmm}:00-05:00`);

function etiquetaDias(dias) {
  const nombres = dias.map((d) => NOMBRES[d]);
  if (nombres.length === 1) return capitalizar(nombres[0]);
  if (nombres.length === 2) return `${capitalizar(nombres[0])} y ${nombres[1]}`;
  return `${capitalizar(nombres[0])} a ${nombres[nombres.length - 1]}`;
}

// Devuelve [{ dias: 'Lunes a viernes', texto: '8:00 a. m. a 12:00 p. m. y ...' }]
export function resumirAtencion(franjas) {
  const porDia = ORDEN.map((dia) => ({
    dia,
    texto: franjas
      .filter((f) => f.diaSemana === dia)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
      .map((f) => `${hora(f.horaInicio)} a ${hora(f.horaFin)}`)
      .join(' y '),
  })).filter((d) => d.texto);

  // Junta días seguidos que tienen exactamente el mismo horario
  const grupos = [];
  for (const d of porDia) {
    const ultimo = grupos[grupos.length - 1];
    const seguido =
      ultimo && ORDEN.indexOf(ultimo.dias[ultimo.dias.length - 1]) + 1 === ORDEN.indexOf(d.dia);
    if (ultimo && ultimo.texto === d.texto && seguido) {
      ultimo.dias.push(d.dia);
    } else {
      grupos.push({ dias: [d.dia], texto: d.texto });
    }
  }

  return grupos.map(({ dias, texto }) => ({ dias: etiquetaDias(dias), texto }));
}