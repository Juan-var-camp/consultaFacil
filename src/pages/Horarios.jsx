import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, CircleAlert, Plus, Trash2 } from 'lucide-react';
import { guardarHorarios, obtenerHorarios } from '../api/consultorios';
import { useAuth } from '../context/AuthContext';
import Alerta from '../components/ui/Alerta';
import Boton from '../components/ui/Boton';
import Campo from '../components/ui/Campo';
import EstadoError from '../components/ui/EstadoError';
import EstadoVacio from '../components/ui/EstadoVacio';
import { Cargando, Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

const DIAS = [
  { dia: 1, nombre: 'Lunes' },
  { dia: 2, nombre: 'Martes' },
  { dia: 3, nombre: 'Miércoles' },
  { dia: 4, nombre: 'Jueves' },
  { dia: 5, nombre: 'Viernes' },
  { dia: 6, nombre: 'Sábado' },
  { dia: 0, nombre: 'Domingo' },
];
const DURACIONES = [15, 20, 30, 45, 60];
const JORNADA_COMPLETA = [
  { horaInicio: '08:00', horaFin: '12:00' },
  { horaInicio: '14:00', horaFin: '18:00' },
];

const aMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// El backend manda una lista plana; en pantalla es más cómodo una lista por día (0 a 6)
function aSemana(franjas) {
  const semana = Array.from({ length: 7 }, () => []);
  for (const { diaSemana, horaInicio, horaFin } of franjas) {
    semana[diaSemana].push({ horaInicio, horaFin });
  }
  return semana;
}

function aFranjas(semana) {
  return semana.flatMap((franjas, diaSemana) => franjas.map((f) => ({ diaSemana, ...f })));
}

// Texto comparable para saber si hay cambios sin guardar
const huella = (semana) =>
  JSON.stringify(
    semana.map((franjas) =>
      [...franjas].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    )
  );

// Mismas reglas que el backend, para avisar antes de enviar. Devuelve un mensaje (o null) por día
function validarSemana(semana, duracion) {
  return semana.map((franjas) => {
    for (const f of franjas) {
      if (!f.horaInicio || !f.horaFin) return 'Completa la hora de inicio y la de fin.';
      if (aMinutos(f.horaInicio) + duracion > aMinutos(f.horaFin)) {
        return `La franja de ${f.horaInicio} a ${f.horaFin} es más corta que una cita de ${duracion} minutos.`;
      }
    }
    const orden = [...franjas].sort((a, b) => aMinutos(a.horaInicio) - aMinutos(b.horaInicio));
    for (let i = 1; i < orden.length; i++) {
      if (aMinutos(orden[i].horaInicio) < aMinutos(orden[i - 1].horaFin)) {
        return 'Hay franjas que se cruzan.';
      }
    }
    return null;
  });
}

function Formulario({ inicial, consultorioId }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [duracion, setDuracion] = useState(String(inicial.duracionCita));
  const [semana, setSemana] = useState(() => aSemana(inicial.franjas));
  const [intentado, setIntentado] = useState(false);

  const guardar = useMutation({
    mutationFn: (datos) => guardarHorarios(consultorioId, datos),
    onSuccess: () => {
      toast.exito('Horarios guardados');
      setIntentado(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios', String(consultorioId)] });
      queryClient.invalidateQueries({ queryKey: ['disponibilidad'] });
    },
  });

  const errores = validarSemana(semana, Number(duracion));
  const hayErrores = errores.some(Boolean);
  const sinCambios =
    duracion === String(inicial.duracionCita) && huella(semana) === huella(aSemana(inicial.franjas));

  function cambiarDia(dia, nuevasFranjas) {
    setSemana((actual) => actual.map((franjas, d) => (d === dia ? nuevasFranjas : franjas)));
  }

  function cambiarHora(dia, indice, campo, valor) {
    cambiarDia(
      dia,
      semana[dia].map((f, i) => (i === indice ? { ...f, [campo]: valor } : f))
    );
  }

  function alternarDia(dia, atiende) {
    cambiarDia(dia, atiende ? JORNADA_COMPLETA.map((f) => ({ ...f })) : []);
  }

  function agregarFranja(dia) {
    const nueva =
      semana[dia].length === 0 ? { horaInicio: '08:00', horaFin: '12:00' } : { horaInicio: '14:00', horaFin: '18:00' };
    cambiarDia(dia, [...semana[dia], nueva]);
  }

  function quitarFranja(dia, indice) {
    cambiarDia(dia, semana[dia].filter((_, i) => i !== indice));
  }

  function copiarLunesAMartesViernes() {
    setSemana((actual) =>
      actual.map((franjas, d) => (d >= 2 && d <= 5 ? actual[1].map((f) => ({ ...f })) : franjas))
    );
  }

  function descartar() {
    setDuracion(String(inicial.duracionCita));
    setSemana(aSemana(inicial.franjas));
    setIntentado(false);
    guardar.reset();
  }

  function enviar(evento) {
    evento.preventDefault();
    setIntentado(true);
    if (hayErrores) return;
    guardar.mutate({ duracionCita: Number(duracion), franjas: aFranjas(semana) });
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      <div className="max-w-xs">
        <Campo
          como="select"
          etiqueta="Duración de cada cita"
          value={duracion}
          onChange={(e) => setDuracion(e.target.value)}
        >
          {DURACIONES.map((minutos) => (
            <option key={minutos} value={minutos}>
              {minutos} minutos
            </option>
          ))}
        </Campo>
      </div>

      <div className="space-y-3">
        {DIAS.map(({ dia, nombre }) => {
          const franjas = semana[dia];
          const atiende = franjas.length > 0;
          const error = intentado ? errores[dia] : null;
          const idTitulo = `dia-${dia}`;

          return (
            <section
              key={dia}
              aria-labelledby={idTitulo}
              className="rounded-superficie border border-borde bg-superficie p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 id={idTitulo} className="text-lg">
                  {nombre}
                </h2>
                <label className="flex min-h-11 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={atiende}
                    onChange={(e) => alternarDia(dia, e.target.checked)}
                    className="h-5 w-5 accent-primario"
                  />
                  Atiende
                  <span className="sr-only"> el {nombre.toLowerCase()}</span>
                </label>
              </div>

              {!atiende && <p className="text-tinta-suave">No atiende este día.</p>}

              {atiende && (
                <>
                  <ul className="mt-2 space-y-3">
                    {franjas.map((franja, indice) => (
                      <li key={indice} className="flex flex-wrap items-end gap-3">
                        <div className="w-36">
                          <Campo
                            etiqueta="Desde"
                            type="time"
                            value={franja.horaInicio}
                            onChange={(e) => cambiarHora(dia, indice, 'horaInicio', e.target.value)}
                          />
                        </div>
                        <div className="w-36">
                          <Campo
                            etiqueta="Hasta"
                            type="time"
                            value={franja.horaFin}
                            onChange={(e) => cambiarHora(dia, indice, 'horaFin', e.target.value)}
                          />
                        </div>
                        <Boton
                          variante="fantasma"
                          aria-label={`Quitar la franja ${indice + 1} del ${nombre.toLowerCase()}`}
                          onClick={() => quitarFranja(dia, indice)}
                        >
                          <Trash2 aria-hidden="true" className="h-5 w-5" />
                        </Boton>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Boton variante="secundario" onClick={() => agregarFranja(dia)}>
                      <Plus aria-hidden="true" className="h-4 w-4" />
                      Agregar franja
                      <span className="sr-only"> del {nombre.toLowerCase()}</span>
                    </Boton>
                    {dia === 1 && (
                      <Boton variante="fantasma" onClick={copiarLunesAMartesViernes}>
                        Copiar a martes–viernes
                      </Boton>
                    )}
                  </div>
                </>
              )}

              {error && (
                <p role="alert" className="mt-3 flex items-start gap-1 text-sm text-peligro">
                  <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}
            </section>
          );
        })}
      </div>

      {intentado && hayErrores && <Alerta>Corrige los días marcados antes de guardar.</Alerta>}
      {guardar.isError && <Alerta>{guardar.error.message}</Alerta>}

      <div className="flex flex-wrap items-center gap-3">
        <Boton
          type="submit"
          cargando={guardar.isPending}
          textoCargando="Guardando..."
          disabled={sinCambios}
        >
          Guardar horarios
        </Boton>
        <Boton variante="fantasma" disabled={sinCambios || guardar.isPending} onClick={descartar}>
          Descartar cambios
        </Boton>
      </div>
    </form>
  );
}

function Horarios() {
  const { usuario } = useAuth();
  const consultorioId = usuario.consultorioId;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['horarios', String(consultorioId)],
    queryFn: () => obtenerHorarios(consultorioId),
    enabled: Boolean(consultorioId),
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl">Horarios de atención</h1>
      <p className="mt-2 max-w-prose text-tinta-suave">
        Los cambios aplican a las citas nuevas. Las que ya están agendadas no se modifican.
      </p>

      <div className="mt-8">
        {!consultorioId && (
          <EstadoVacio
            icono={Building2}
            titulo="Tu cuenta aún no tiene un consultorio"
            descripcion="Pide al administrador que te asigne uno para configurar sus horarios."
          />
        )}

        {consultorioId && isPending && (
          <Cargando etiqueta="Cargando horarios">
            <Skeleton className="h-11 w-60" />
            <div className="mt-6 space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="rounded-superficie border border-borde bg-superficie p-4">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="mt-4 h-11 w-3/4" />
                </div>
              ))}
            </div>
          </Cargando>
        )}

        {consultorioId && isError && (
          <EstadoError
            titulo="No pudimos cargar los horarios"
            mensaje="Revisa tu conexión e inténtalo de nuevo."
            onReintentar={() => refetch()}
          />
        )}

        {consultorioId && data && <Formulario inicial={data} consultorioId={consultorioId} />}
      </div>
    </main>
  );
}

export default Horarios;