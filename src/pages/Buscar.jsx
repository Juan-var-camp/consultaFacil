import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, MapPin, Phone, SearchX } from 'lucide-react';
import { obtenerConsultorios } from '../api/consultorios';
import Boton, { clasesBoton } from '../components/ui/Boton';
import Campo from '../components/ui/Campo';
import EstadoError from '../components/ui/EstadoError';
import EstadoVacio from '../components/ui/EstadoVacio';
import { Cargando, Skeleton } from '../components/ui/Skeleton';

// Compara sin tildes ni mayúsculas: "pediatria" encuentra "Pediatría"
const normalizar = (texto) =>
  texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Misma forma que una fila real, para que la página no salte al cargar
function FilaSkeleton() {
  return (
    <div className="rounded-superficie border border-borde bg-superficie p-5">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="mt-3 h-6 w-1/2" />
      <Skeleton className="mt-3 h-4 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}

function Buscar() {
  const [params] = useSearchParams();
  const [texto, setTexto] = useState(params.get('q') ?? '');
  const [especialidad, setEspecialidad] = useState(params.get('especialidad') ?? '');

  const {
    data: consultorios = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['consultorios'],
    queryFn: obtenerConsultorios,
  });

  const especialidades = [...new Set(consultorios.map((c) => c.especialidad))].sort();

  const busqueda = normalizar(texto.trim());
  const filtrados = consultorios.filter((c) => {
    const coincideTexto =
      normalizar(c.nombre).includes(busqueda) || normalizar(c.direccion).includes(busqueda);
    const coincideEspecialidad = !especialidad || c.especialidad === especialidad;
    return coincideTexto && coincideEspecialidad;
  });

  function limpiarFiltros() {
    setTexto('');
    setEspecialidad('');
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl">Buscar consultorio</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_16rem]">
        <Campo
          etiqueta="Nombre o dirección"
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <Campo
          como="select"
          etiqueta="Especialidad"
          value={especialidad}
          onChange={(e) => setEspecialidad(e.target.value)}
        >
          <option value="">Todas</option>
          {especialidades.map((esp) => (
            <option key={esp} value={esp}>
              {esp}
            </option>
          ))}
        </Campo>
      </div>

      <div className="mt-8">
        {isPending && (
          <Cargando etiqueta="Cargando consultorios">
            <ul className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <li key={n}>
                  <FilaSkeleton />
                </li>
              ))}
            </ul>
          </Cargando>
        )}

        {isError && (
          <EstadoError
            titulo="No pudimos cargar los consultorios"
            mensaje="Revisa tu conexión e inténtalo de nuevo."
            onReintentar={() => refetch()}
          />
        )}

        {!isPending && !isError && consultorios.length === 0 && (
          <EstadoVacio
            icono={Building2}
            titulo="Aún no hay consultorios registrados"
            descripcion="Cuando se registren, aparecerán aquí."
          />
        )}

        {!isPending && !isError && consultorios.length > 0 && filtrados.length === 0 && (
          <EstadoVacio
            icono={SearchX}
            titulo="Ningún consultorio coincide"
            descripcion="Prueba con otro nombre o especialidad."
            accion={
              <Boton variante="secundario" onClick={limpiarFiltros}>
                Limpiar filtros
              </Boton>
            }
          />
        )}

        {!isPending && !isError && filtrados.length > 0 && (
          <>
            <p aria-live="polite" className="mb-3 text-sm text-tinta-suave">
              {filtrados.length} {filtrados.length === 1 ? 'consultorio' : 'consultorios'}
            </p>
            <ul className="space-y-3">
              {filtrados.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-4 rounded-superficie border border-borde bg-superficie p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <span className="inline-block rounded-full bg-primario-suave px-2.5 py-0.5 text-sm font-medium text-primario">
                      {c.especialidad}
                    </span>
                    <h2 className="mt-2 text-lg">{c.nombre}</h2>
                    <p className="mt-1 flex items-center gap-2 text-tinta-suave">
                      <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                      {c.direccion}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-tinta-suave">
                      <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />
                      {c.telefono}
                    </p>
                  </div>

                  <Link to={`/consultorios/${c.id}`} className={clasesBoton('secundario')}>
                    Ver horarios
                    <span className="sr-only"> de {c.nombre}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}

export default Buscar;