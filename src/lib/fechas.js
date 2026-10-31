const ZONA = 'America/Bogota';

// Fecha de hoy en Colombia como 'AAAA-MM-DD' (el formato en-CA ya sale así)
export function hoyColombia() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date());
}

export function esFechaISO(texto) {
  return /^\d{4}-\d{2}-\d{2}$/.test(texto ?? '');
}

export function sumarDias(fecha, dias) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia + dias)).toISOString().slice(0, 10);
}

// 'AAAA-MM-DD' -> 'viernes 20 de noviembre'
export function formatearDia(fecha) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: ZONA,
  })
    .format(new Date(`${fecha}T12:00:00-05:00`))
    .replace(',', '');
}

// ISO en UTC -> '9:00 a. m.' en hora de Colombia
export function formatearHora(iso) {
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: ZONA,
  }).format(new Date(iso));
}

// Hora del día en Colombia como número 0-23 (para separar mañana y tarde)
export function horaDelDia(iso) {
  return Number(
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      hourCycle: 'h23',
      timeZone: ZONA,
    }).format(new Date(iso))
  );
}

export function formatearFechaHora(iso) {
  const dia = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date(iso));
  return `${formatearDia(dia)}, ${formatearHora(iso)}`;
}

// ISO en UTC -> 'AAAA-MM-DD' del día en Colombia
export function diaDe(iso) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date(iso));
}