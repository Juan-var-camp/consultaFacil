import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarX, MapPin } from 'lucide-react';
import { cancelarCita, obtenerCitas } from '../api/citas';
import { useAuth } from '../context/AuthContext';
import { formatearFechaHora } from '../lib/fechas';
import Alerta from '../components/ui/Alerta';
import Boton, { clasesBoton } from '../components/ui/Boton';
import ChipEstado from '../components/ui/ChipEstado';
import Dialogo from '../components/ui/Dialogo';
import EstadoError from '../components/ui/EstadoError';
import EstadoVacio from '../components/ui/EstadoVacio';
import Pestanas from '../components/ui/Pestanas';
import { Cargando, Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

const ESTADOS_ACTIVOS = ['PENDIENTE', 'CONFIRMADA'];

// Misma forma que una fila real
function FilaSkeleton() {
  return (
    <div className="rounded-superficie border border-borde bg-superficie p-5">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="mt-3 h-6 w-2/3" />
      <Skeleton className="mt-3 h-4 w-1/2" />
      <Skeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}

function MisCitas() {
  const { usuario } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [pestana, setPestana] = useState('proximas');
  const [aCancelar, setACancelar] = useState(null);

  // El id del usuario va en la clave: si otra persona inicia sesión en el mismo
  // navegador, no ve las citas guardadas en caché de la anterior
  const {
    data: citas = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['citas', usuario.id],
    queryFn: obtenerCitas,
  });

  const cancelar = useMutation({
    mutationFn: (id) => cancelarCita(id),
    onSuccess: () => {
      toast.exito('Cita cancelada');
      setACancelar(null);
    },
    // Con éxito o con error se recarga: el estado real manda sobre lo que se ve en pantalla
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['disponibilidad'] });
    },
  });

  const ahora = Date.now();
  const esProxima = (c) =>
    new Date(c.fecha).getTime() >= ahora && ESTADOS_ACTIVOS.includes(c.estado);

  const proximas = citas
    .filter(esProxima)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const anteriores = citas
    .filter((c) => !esProxima(c))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const visibles = pestana === 'proximas' ? proximas : anteriores;

  function cerrarDialogo() {
    setACancelar(null);
    cancelar.reset();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl">Mis citas</h1>

      <div className="mt-6">
        <Pestanas
          etiqueta="Mis citas"
          idBase="citas"
          activa={pestana}
          onChange={setPestana}
          pestanas={[
            { id: 'proximas', titulo: 'Próximas', conteo: isPending ? undefined : proximas.length },
            { id: 'anteriores', titulo: 'Anteriores', conteo: isPending ? undefined : anteriores.length },
          ]}
        />
      </div>

      <div role="tabpanel" id="citas-panel" aria-labelledby={`citas-${pestana}`} className="mt-6">
        {isPending && (
          <Cargando etiqueta="Cargando tus citas">
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
            titulo="No pudimos cargar tus citas"
            mensaje="Revisa tu conexión e inténtalo de nuevo."
            onReintentar={() => refetch()}
          />
        )}

        {!isPending && !isError && visibles.length === 0 && (
          <EstadoVacio
            icono={CalendarX}
            titulo={
              pestana === 'proximas'
                ? 'No tienes citas próximas'
                : 'Aún no tienes citas anteriores'
            }
            descripcion={
              pestana === 'proximas'
                ? 'Busca un consultorio y elige un horario libre.'
                : 'Aquí aparecerán las citas pasadas y las canceladas.'
            }
            accion={
              pestana === 'proximas' ? (
                <Link to="/buscar" className={clasesBoton('primario')}>
                  Buscar consultorio
                </Link>
              ) : undefined
            }
          />
        )}

        {!isPending && !isError && visibles.length > 0 && (
          <ul className="space-y-3">
            {visibles.map((cita) => (
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
                    <Link
                      to={`/consultorios/${cita.consultorio.id}`}
                      className="font-medium text-primario underline-offset-2 hover:underline"
                    >
                      {cita.consultorio.nombre}
                    </Link>
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-tinta-suave">
                    <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                    {cita.consultorio.direccion}
                  </p>
                  {cita.motivo && <p className="mt-2 text-tinta-suave">Motivo: {cita.motivo}</p>}
                </div>

                {esProxima(cita) && (
                  <Boton variante="secundario" onClick={() => setACancelar(cita)}>
                    Cancelar cita
                    <span className="sr-only">
                      {' '}
                      en {cita.consultorio.nombre}, {formatearFechaHora(cita.fecha)}
                    </span>
                  </Boton>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialogo abierto={aCancelar !== null} onCerrar={cerrarDialogo} titulo="Cancelar cita">
        {aCancelar && (
          <>
            <p className="text-tinta-suave">
              Vas a cancelar tu cita en{' '}
              <span className="font-medium text-tinta">{aCancelar.consultorio.nombre}</span> el{' '}
              {formatearFechaHora(aCancelar.fecha)}. El horario quedará libre para otros
              pacientes.
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

export default MisCitas;