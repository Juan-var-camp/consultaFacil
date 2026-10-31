import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarX, SearchX } from 'lucide-react';
import { buscarCitas, cancelarCita } from '../api/citas';
import { obtenerConsultorios } from '../api/consultorios';
import { diaDe, formatearFechaHora } from '../lib/fechas';
import Alerta from '../components/ui/Alerta';
import Boton from '../components/ui/Boton';
import Campo from '../components/ui/Campo';
import ChipEstado from '../components/ui/ChipEstado';
import Dialogo from '../components/ui/Dialogo';
import EstadoError from '../components/ui/EstadoError';
import EstadoVacio from '../components/ui/EstadoVacio';
import { Cargando, Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

const POR_PAGINA = 20;
const ESTADOS = [
  { valor: 'PENDIENTE', texto: 'Pendiente' },
  { valor: 'CONFIRMADA', texto: 'Confirmada' },
  { valor: 'CANCELADA', texto: 'Cancelada' },
  { valor: 'COMPLETADA', texto: 'Completada' },
];

const esCancelable = (cita) =>
  ['PENDIENTE', 'CONFIRMADA'].includes(cita.estado) && new Date(cita.fecha) > new Date();

function AdminCitas() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [estado, setEstado] = useState('');
  const [consultorioId, setConsultorioId] = useState('');
  const [dia, setDia] = useState('');
  const [visibles, setVisibles] = useState(POR_PAGINA);
  const [aCancelar, setACancelar] = useState(null);

  const consultoriosQ = useQuery({ queryKey: ['consultorios'], queryFn: obtenerConsultorios });
  const citasQ = useQuery({
    queryKey: ['citas', 'admin', estado, consultorioId],
    queryFn: () => buscarCitas({ estado, consultorioId }),
  });

  const cancelar = useMutation({
    mutationFn: (id) => cancelarCita(id),
    onSuccess: () => {
      toast.exito('Cita cancelada');
      setACancelar(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['disponibilidad'] });
    },
  });

  const consultorios = consultoriosQ.data ?? [];
  const citas = citasQ.data ?? [];
  const hayFiltros = Boolean(estado || consultorioId || dia);

  // El estado y el consultorio se filtran en el servidor; el día, aquí
  const lista = (dia ? citas.filter((c) => diaDe(c.fecha) === dia) : citas).sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  // Cada vez que cambia un filtro se vuelve a la primera página
  const alCambiar = (setter) => (evento) => {
    setter(evento.target.value);
    setVisibles(POR_PAGINA);
  };

  function limpiarFiltros() {
    setEstado('');
    setConsultorioId('');
    setDia('');
    setVisibles(POR_PAGINA);
  }

  function cerrarDialogo() {
    setACancelar(null);
    cancelar.reset();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl">Citas</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Campo como="select" etiqueta="Estado" value={estado} onChange={alCambiar(setEstado)}>
          <option value="">Todos</option>
          {ESTADOS.map(({ valor, texto }) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </Campo>
        <Campo
          como="select"
          etiqueta="Consultorio"
          value={consultorioId}
          onChange={alCambiar(setConsultorioId)}
        >
          <option value="">Todos</option>
          {consultorios.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Campo>
        <Campo etiqueta="Día" type="date" value={dia} onChange={alCambiar(setDia)} />
      </div>

      {hayFiltros && (
        <div className="mt-3">
          <Boton variante="fantasma" onClick={limpiarFiltros}>
            Limpiar filtros
          </Boton>
        </div>
      )}

      <div className="mt-8">
        {citasQ.isPending && (
          <Cargando etiqueta="Cargando citas">
            <ul className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className="rounded-superficie border border-borde bg-superficie p-5">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="mt-3 h-6 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-1/2" />
                </li>
              ))}
            </ul>
          </Cargando>
        )}

        {citasQ.isError && (
          <EstadoError
            titulo="No pudimos cargar las citas"
            mensaje="Revisa tu conexión e inténtalo de nuevo."
            onReintentar={() => citasQ.refetch()}
          />
        )}

        {citasQ.isSuccess && lista.length === 0 && !hayFiltros && (
          <EstadoVacio
            icono={CalendarX}
            titulo="Aún no hay citas"
            descripcion="Aparecerán aquí cuando los pacientes agenden."
          />
        )}

        {citasQ.isSuccess && lista.length === 0 && hayFiltros && (
          <EstadoVacio
            icono={SearchX}
            titulo="Ninguna cita coincide"
            descripcion="Prueba con otros filtros."
            accion={
              <Boton variante="secundario" onClick={limpiarFiltros}>
                Limpiar filtros
              </Boton>
            }
          />
        )}

        {citasQ.isSuccess && lista.length > 0 && (
          <>
            <p aria-live="polite" className="mb-3 text-sm text-tinta-suave">
              {lista.length} {lista.length === 1 ? 'cita' : 'citas'}
            </p>

            <ul className="space-y-3">
              {lista.slice(0, visibles).map((cita) => (
                <li
                  key={cita.id}
                  className="flex flex-col gap-4 rounded-superficie border border-borde bg-superficie p-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <ChipEstado estado={cita.estado} />
                    <p className="mt-2 font-titulo text-lg font-semibold">
                      {formatearFechaHora(cita.fecha)}
                    </p>
                    <p className="mt-1">
                      <span className="font-medium">{cita.paciente.nombre}</span>
                      <span className="block break-all text-tinta-suave">{cita.paciente.email}</span>
                    </p>
                    <p className="mt-1 text-tinta-suave">{cita.consultorio.nombre}</p>
                    {cita.motivo && <p className="mt-1 text-tinta-suave">Motivo: {cita.motivo}</p>}
                  </div>

                  {esCancelable(cita) && (
                    <Boton variante="secundario" onClick={() => setACancelar(cita)}>
                      Cancelar cita
                      <span className="sr-only">
                        {' '}
                        de {cita.paciente.nombre}, {formatearFechaHora(cita.fecha)}
                      </span>
                    </Boton>
                  )}
                </li>
              ))}
            </ul>

            {lista.length > visibles && (
              <div className="mt-6 text-center">
                <p className="mb-3 text-sm text-tinta-suave">
                  Mostrando {visibles} de {lista.length}
                </p>
                <Boton variante="secundario" onClick={() => setVisibles((v) => v + POR_PAGINA)}>
                  Mostrar más
                </Boton>
              </div>
            )}
          </>
        )}
      </div>

      <Dialogo abierto={aCancelar !== null} onCerrar={cerrarDialogo} titulo="Cancelar cita">
        {aCancelar && (
          <>
            <p className="text-tinta-suave">
              Vas a cancelar la cita de{' '}
              <span className="font-medium text-tinta">{aCancelar.paciente.nombre}</span> en{' '}
              {aCancelar.consultorio.nombre} el {formatearFechaHora(aCancelar.fecha)}. El paciente
              la verá como cancelada y el horario quedará libre.
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

export default AdminCitas;