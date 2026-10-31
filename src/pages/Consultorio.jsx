import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarX, ChevronLeft, ChevronRight, MapPin, Phone, SearchX } from 'lucide-react';
import { obtenerConsultorio, obtenerDisponibilidad, obtenerHorarios } from '../api/consultorios';
import { resumirAtencion } from '../lib/atencion';
import { agendarCita } from '../api/citas';
import { useAuth } from '../context/AuthContext';
import {
  esFechaISO,
  formatearDia,
  formatearFechaHora,
  formatearHora,
  hoyColombia,
  sumarDias,
} from '../lib/fechas';
import SelectorHorarios from '../components/SelectorHorarios';
import Alerta from '../components/ui/Alerta';
import Boton, { clasesBoton } from '../components/ui/Boton';
import Campo from '../components/ui/Campo';
import Dialogo from '../components/ui/Dialogo';
import EstadoError from '../components/ui/EstadoError';
import EstadoVacio from '../components/ui/EstadoVacio';
import { Cargando, Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

const DIAS_MAXIMO = 60; // hasta cuántos días adelante se puede agendar

function Consultorio() {
  const { id } = useParams();
  const { usuario, cargando: verificandoSesion } = useAuth();
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();

  const [aConfirmar, setAConfirmar] = useState(null); // horario que se está confirmando
  const [motivo, setMotivo] = useState('');

  // El día y la hora elegidos viven en la URL: sobreviven al login y se pueden compartir
  const hoy = hoyColombia();
  const maximo = sumarDias(hoy, DIAS_MAXIMO);
  const fechaParam = params.get('fecha');
  const fecha =
    esFechaISO(fechaParam) && fechaParam >= hoy && fechaParam <= maximo ? fechaParam : hoy;
  const hora = params.get('hora');

  const consultorioQ = useQuery({
    queryKey: ['consultorio', id],
    queryFn: () => obtenerConsultorio(id),
    retry: (intentos, error) => ![400, 404].includes(error.status) && intentos < 1,
  });

  const horariosQ = useQuery({
    queryKey: ['horarios', String(id)],
    queryFn: () => obtenerHorarios(id),
  });

  const disponibilidadQ = useQuery({
    queryKey: ['disponibilidad', id, fecha],
    queryFn: () => obtenerDisponibilidad(id, fecha),
    staleTime: 15_000, // los horarios cambian rápido: se refrescan más seguido
  });

  const agendar = useMutation({
    mutationFn: agendarCita,
    onSuccess: () => {
        toast.exito('Cita agendada');
        setAConfirmar(null);
        setMotivo('');
        navigate('/mis-citas');
        },
    // Con éxito o con error (por ejemplo, otro paciente tomó el horario) se actualizan los horarios
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidad', id] });
      queryClient.invalidateQueries({ queryKey: ['citas'] });
    },
  });

  const consultorio = consultorioQ.data;
  const horarios = disponibilidadQ.data?.horarios ?? [];
  const seleccionado = horarios.find((h) => h.inicio === hora && h.libre)?.inicio ?? null;
  const hayLibres = horarios.some((h) => h.libre);
  const esPaciente = usuario?.rol === 'PACIENTE';

  function irAFecha(nueva) {
    setParams({ fecha: nueva }, { replace: true });
  }

  function elegirHora(inicio) {
    setParams({ fecha, hora: inicio }, { replace: true });
  }

  function alAgendar() {
    if (!usuario) {
      // Vuelve aquí tras el login, con el mismo día y horario ya elegidos
      navigate('/login', { state: { desde: ubicacion.pathname + ubicacion.search } });
      return;
    }
    agendar.reset();
    setAConfirmar(seleccionado);
  }

  function cerrarDialogo() {
    setAConfirmar(null);
    agendar.reset();
  }

  function confirmar(evento) {
    evento.preventDefault();
    agendar.mutate({
      consultorioId: Number(id),
      fecha: aConfirmar,
      motivo: motivo.trim() || undefined,
    });
  }

  const volver = (
    <Link
      to="/buscar"
      className="inline-flex items-center gap-1 rounded-control py-2 text-tinta-suave hover:text-tinta"
    >
      <ArrowLeft aria-hidden="true" className="h-4 w-4" />
      Volver a buscar
    </Link>
  );

  if (consultorioQ.isError) {
    const noExiste = [400, 404].includes(consultorioQ.error.status);
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        {volver}
        <div className="mt-4">
          {noExiste ? (
            <EstadoVacio
              icono={SearchX}
              titulo="No encontramos este consultorio"
              descripcion="Puede que el enlace esté incompleto o que ya no exista."
              accion={
                <Link to="/buscar" className={clasesBoton('secundario')}>
                  Buscar consultorio
                </Link>
              }
            />
          ) : (
            <EstadoError
              titulo="No pudimos cargar el consultorio"
              mensaje="Revisa tu conexión e inténtalo de nuevo."
              onReintentar={() => consultorioQ.refetch()}
            />
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {volver}

      {/* Datos del consultorio */}
      <section className="mt-4">
        {consultorioQ.isPending ? (
          <Cargando etiqueta="Cargando consultorio">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="mt-3 h-9 w-2/3" />
            <Skeleton className="mt-3 h-4 w-1/2" />
            <Skeleton className="mt-2 h-4 w-1/3" />
          </Cargando>
        ) : (
          <>
            <span className="inline-block rounded-full bg-primario-suave px-2.5 py-0.5 text-sm font-medium text-primario">
              {consultorio.especialidad}
            </span>
            <h1 className="mt-2 text-3xl">{consultorio.nombre}</h1>
            <p className="mt-2 flex items-center gap-2 text-tinta-suave">
              <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
              {consultorio.direccion}
            </p>
            <p className="mt-1 flex items-center gap-2 text-tinta-suave">
              <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />
              <a
                href={`tel:${consultorio.telefono}`}
                className="underline underline-offset-2 hover:text-tinta"
              >
                {consultorio.telefono}
              </a>
            </p>
            {consultorio.descripcion && (
              <p className="mt-4 max-w-prose text-tinta-suave">{consultorio.descripcion}</p>
            )}

            {/* Si falla la carga de los horarios, este bloque simplemente no aparece */}
            {horariosQ.isPending && <Skeleton className="mt-5 h-4 w-2/3" />}
            {horariosQ.isSuccess && (
              <div className="mt-5">
                <h2 className="text-lg">Días de atención</h2>
                {resumirAtencion(horariosQ.data.franjas).length === 0 ? (
                  <p className="mt-1 text-tinta-suave">Este consultorio aún no tiene horario configurado.</p>
                ) : (
                  <dl className="mt-2 space-y-1">
                    {resumirAtencion(horariosQ.data.franjas).map((grupo) => (
                      <div key={grupo.dias} className="flex flex-wrap gap-x-4">
                        <dt className="w-44 font-medium">{grupo.dias}</dt>
                        <dd className="text-tinta-suave">{grupo.texto}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Selector de horarios */}
      <section
        aria-labelledby="titulo-horarios"
        className="mt-8 rounded-superficie border border-borde bg-superficie p-5 sm:p-6"
      >
        <div className="flex items-end gap-2">
          <Boton
            variante="secundario"
            aria-label="Día anterior"
            disabled={fecha <= hoy}
            onClick={() => irAFecha(sumarDias(fecha, -1))}
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </Boton>
          <div className="flex-1">
            <Campo
              etiqueta="Día"
              type="date"
              min={hoy}
              max={maximo}
              value={fecha}
              onChange={(e) => {
                const nueva = e.target.value;
                if (esFechaISO(nueva) && nueva >= hoy && nueva <= maximo) irAFecha(nueva);
              }}
            />
          </div>
          <Boton
            variante="secundario"
            aria-label="Día siguiente"
            disabled={fecha >= maximo}
            onClick={() => irAFecha(sumarDias(fecha, 1))}
          >
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          </Boton>
        </div>

        <h2 id="titulo-horarios" aria-live="polite" className="mt-6 mb-4 text-xl">
          Horarios del {formatearDia(fecha)}
        </h2>

        {disponibilidadQ.isPending && (
          <Cargando etiqueta="Cargando horarios">
            <div className="space-y-5">
              {[0, 1].map((bloque) => (
                <div key={bloque}>
                  <Skeleton className="mb-2 h-4 w-16" />
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {Array.from({ length: 8 }, (_, n) => (
                      <Skeleton key={n} className="h-11" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Cargando>
        )}

        {disponibilidadQ.isError && (
          <EstadoError
            titulo="No pudimos cargar los horarios"
            mensaje="Revisa tu conexión e inténtalo de nuevo."
            onReintentar={() => disponibilidadQ.refetch()}
          />
        )}

        {disponibilidadQ.isSuccess && !hayLibres && (
          <EstadoVacio
            icono={CalendarX}
            titulo={
                horarios.length === 0
                    ? 'El consultorio no atiende este día'
                    : 'Sin horarios libres este día'
                }
            descripcion="Prueba con otro día."
            accion={
              <Boton
                variante="secundario"
                disabled={fecha >= maximo}
                onClick={() => irAFecha(sumarDias(fecha, 1))}
              >
                Ver el día siguiente
              </Boton>
            }
          />
        )}

        {disponibilidadQ.isSuccess && hayLibres && (
          <SelectorHorarios horarios={horarios} valor={seleccionado} onChange={elegirHora} />
        )}

        {/* Resumen y acción principal */}
        <div className="mt-6 flex flex-col gap-3 border-t border-borde pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className="text-tinta-suave">
            {usuario && !esPaciente ? (
              'Solo los pacientes pueden agendar citas.'
            ) : seleccionado ? (
              <>
                Elegiste las{' '}
                <span className="font-medium text-tinta">{formatearHora(seleccionado)}</span> del{' '}
                {formatearDia(fecha)}.
              </>
            ) : (
              'Elige un horario para continuar.'
            )}
          </p>
          <Boton
            onClick={alAgendar}
            disabled={!seleccionado || verificandoSesion || (usuario && !esPaciente)}
          >
            {usuario ? 'Agendar cita' : 'Ingresar para agendar'}
          </Boton>
        </div>
      </section>

      {/* Confirmación */}
      <Dialogo abierto={aConfirmar !== null} onCerrar={cerrarDialogo} titulo="Confirmar cita">
        {aConfirmar && (
          <form onSubmit={confirmar} className="space-y-4">
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-tinta-suave">Consultorio</dt>
                <dd className="font-medium">{consultorio?.nombre}</dd>
              </div>
              <div>
                <dt className="text-sm text-tinta-suave">Fecha y hora</dt>
                <dd className="font-medium">{formatearFechaHora(aConfirmar)}</dd>
              </div>
            </dl>

            <Campo
              como="textarea"
              etiqueta="Motivo de la consulta"
              opcional
              rows={3}
              maxLength={300}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />

            {agendar.isError && <Alerta>{agendar.error.message}</Alerta>}

            <div className="flex justify-end gap-3">
              <Boton variante="fantasma" onClick={cerrarDialogo}>
                Volver
              </Boton>
              <Boton type="submit" cargando={agendar.isPending} textoCargando="Agendando...">
                Confirmar cita
              </Boton>
            </div>
          </form>
        )}
      </Dialogo>
    </main>
  );
}

export default Consultorio;