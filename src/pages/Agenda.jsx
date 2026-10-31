import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, CalendarX, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { cambiarEstadoCita, cancelarCita, obtenerCitas } from '../api/citas';
import { useAuth } from '../context/AuthContext';
import {
  diaDe,
  esFechaISO,
  formatearDia,
  formatearFechaHora,
  formatearHora,
  hoyColombia,
  sumarDias,
} from '../lib/fechas';
import Alerta from '../components/ui/Alerta';
import Boton from '../components/ui/Boton';
import Campo from '../components/ui/Campo';
import ChipEstado from '../components/ui/ChipEstado';
import Dialogo from '../components/ui/Dialogo';
import EstadoError from '../components/ui/EstadoError';
import EstadoVacio from '../components/ui/EstadoVacio';
import { Cargando, Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

const MENSAJES_EXITO = {
  CONFIRMADA: 'Cita confirmada',
  COMPLETADA: 'Cita completada',
};

function FilaSkeleton() {
  return (
    <div className="rounded-superficie border border-borde bg-superficie p-5">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="mt-3 h-5 w-1/2" />
      <Skeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}

function Agenda() {
  const { usuario } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [aCancelar, setACancelar] = useState(null);

  const hoy = hoyColombia();
  const fechaParam = params.get('fecha');
  const fecha = esFechaISO(fechaParam) ? fechaParam : hoy;

  const sinConsultorio = !usuario.consultorioId;

  const {
    data: citas = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['citas', usuario.id],
    queryFn: obtenerCitas,
    enabled: !sinConsultorio,
  });

  function refrescar() {
    queryClient.invalidateQueries({ queryKey: ['citas'] });
    queryClient.invalidateQueries({ queryKey: ['disponibilidad'] });
  }

  const cambiar = useMutation({
    mutationFn: ({ id, estado }) => cambiarEstadoCita(id, estado),
    onSuccess: (_, { estado }) => toast.exito(MENSAJES_EXITO[estado]),
    onError: (error) => toast.error(error.message),
    onSettled: refrescar,
  });

  const cancelar = useMutation({
    mutationFn: (id) => cancelarCita(id),
    onSuccess: () => {
      toast.exito('Cita cancelada');
      setACancelar(null);
    },
    onSettled: refrescar,
  });

  function irAFecha(nueva) {
    setParams({ fecha: nueva }, { replace: true });
  }

  function cerrarDialogo() {
    setACancelar(null);
    cancelar.reset();
  }

  if (sinConsultorio) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl">Agenda</h1>
        <div className="mt-6">
          <EstadoVacio
            icono={Building2}
            titulo="Tu cuenta aún no tiene un consultorio"
            descripcion="Pide al administrador que te asigne uno para ver tus citas."
          />
        </div>
      </main>
    );
  }

  // Las citas llegan todas juntas; aquí se muestran las del día elegido
  const delDia = citas
    .filter((c) => diaDe(c.fecha) === fecha)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const porConfirmar = delDia.filter((c) => c.estado === 'PENDIENTE').length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl">Agenda</h1>

      <div className="mt-6 flex items-end gap-2">
        <Boton
          variante="secundario"
          aria-label="Día anterior"
          onClick={() => irAFecha(sumarDias(fecha, -1))}
        >
          <ChevronLeft aria-hidden="true" className="h-5 w-5" />
        </Boton>
        <div className="flex-1">
          <Campo
            etiqueta="Día"
            type="date"
            value={fecha}
            onChange={(e) => esFechaISO(e.target.value) && irAFecha(e.target.value)}
          />
        </div>
        <Boton
          variante="secundario"
          aria-label="Día siguiente"
          onClick={() => irAFecha(sumarDias(fecha, 1))}
        >
          <ChevronRight aria-hidden="true" className="h-5 w-5" />
        </Boton>
        {fecha !== hoy && (
          <Boton variante="fantasma" onClick={() => irAFecha(hoy)}>
            Ir a hoy
          </Boton>
        )}
      </div>

      <h2 aria-live="polite" className="mt-8 text-xl">
        {formatearDia(fecha)}
      </h2>
      {!isPending && !isError && delDia.length > 0 && (
        <p className="mt-1 text-tinta-suave">
          {delDia.length} {delDia.length === 1 ? 'cita' : 'citas'}
          {porConfirmar > 0 && `, ${porConfirmar} por confirmar`}
        </p>
      )}

      <div className="mt-4">
        {isPending && (
          <Cargando etiqueta="Cargando la agenda">
            <ul className="space-y-3">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <FilaSkeleton />
                </li>
              ))}
            </ul>
          </Cargando>
        )}

        {isError && (
          <EstadoError
            titulo="No pudimos cargar la agenda"
            mensaje="Revisa tu conexión e inténtalo de nuevo."
            onReintentar={() => refetch()}
          />
        )}

        {!isPending && !isError && delDia.length === 0 && (
          <EstadoVacio
            icono={CalendarX}
            titulo="No hay citas este día"
            descripcion="Cuando un paciente agende, la cita aparecerá aquí."
          />
        )}

        {!isPending && !isError && delDia.length > 0 && (
          <ul className="space-y-3">
            {delDia.map((cita) => {
              const yaInicio = new Date(cita.fecha).getTime() <= Date.now();
              const puedeConfirmar = cita.estado === 'PENDIENTE';
              const puedeCompletar = cita.estado === 'CONFIRMADA' && yaInicio;
              const puedeCancelar = ['PENDIENTE', 'CONFIRMADA'].includes(cita.estado);
              const enCurso = cambiar.isPending && cambiar.variables.id === cita.id;
              const nombre = cita.paciente.nombre;

              return (
                <li
                  key={cita.id}
                  className="flex flex-col gap-4 rounded-superficie border border-borde bg-superficie p-5 sm:flex-row sm:items-start"
                >
                  <p className="w-28 shrink-0 font-titulo text-xl font-semibold tabular-nums">
                    {formatearHora(cita.fecha)}
                  </p>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{nombre}</p>
                      <ChipEstado estado={cita.estado} />
                    </div>
                    {cita.paciente.telefono && (
                      <p className="mt-1 flex items-center gap-2 text-tinta-suave">
                        <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />
                        <a
                          href={`tel:${cita.paciente.telefono}`}
                          className="underline underline-offset-2 hover:text-tinta"
                        >
                          {cita.paciente.telefono}
                        </a>
                      </p>
                    )}
                    {cita.motivo && <p className="mt-1 text-tinta-suave">Motivo: {cita.motivo}</p>}
                  </div>

                  {(puedeConfirmar || puedeCompletar || puedeCancelar) && (
                    <div className="flex flex-wrap gap-2">
                      {puedeConfirmar && (
                        <Boton
                          cargando={enCurso}
                          textoCargando="Confirmando..."
                          onClick={() => cambiar.mutate({ id: cita.id, estado: 'CONFIRMADA' })}
                        >
                          Confirmar
                          <span className="sr-only"> cita de {nombre}</span>
                        </Boton>
                      )}
                      {puedeCompletar && (
                        <Boton
                          cargando={enCurso}
                          textoCargando="Guardando..."
                          onClick={() => cambiar.mutate({ id: cita.id, estado: 'COMPLETADA' })}
                        >
                          Completar
                          <span className="sr-only"> cita de {nombre}</span>
                        </Boton>
                      )}
                      {puedeCancelar && (
                        <Boton variante="secundario" onClick={() => setACancelar(cita)}>
                          Cancelar
                          <span className="sr-only"> cita de {nombre}</span>
                        </Boton>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialogo abierto={aCancelar !== null} onCerrar={cerrarDialogo} titulo="Cancelar cita">
        {aCancelar && (
          <>
            <p className="text-tinta-suave">
              Vas a cancelar la cita de{' '}
              <span className="font-medium text-tinta">{aCancelar.paciente.nombre}</span> el{' '}
              {formatearFechaHora(aCancelar.fecha)}. El paciente la verá como cancelada y el
              horario quedará libre.
            </p>

            {cancelar.isError && (
              <div className="mt-4">
                <Alerta>{cancelar.error.message}</Alerta>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Boton variante="fantasma" onClick={cerrarDialogo}>
                Mantener cita
              </Boton>
              <Boton
                variante="peligro"
                cargando={cancelar.isPending}
                textoCargando="Cancelando..."
                onClick={() => cancelar.mutate(aCancelar.id)}
              >
                Cancelar cita
              </Boton>
            </div>
          </>
        )}
      </Dialogo>
    </main>
  );
}

export default Agenda;