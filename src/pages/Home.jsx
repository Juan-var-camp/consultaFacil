import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { obtenerConsultorios } from '../api/consultorios';
import Boton from '../components/ui/Boton';
import Campo from '../components/ui/Campo';
import { Cargando, Skeleton } from '../components/ui/Skeleton';

const PASOS = [
  { titulo: 'Busca', texto: 'Filtra por nombre, dirección o especialidad.' },
  { titulo: 'Elige un horario', texto: 'Solo ves los horarios que están libres.' },
  { titulo: 'Confirma', texto: 'Tu cita queda guardada en tu cuenta.' },
];

function Home() {
  const navigate = useNavigate();
  const [texto, setTexto] = useState('');
  const [especialidad, setEspecialidad] = useState('');

  // Misma consulta que Buscar: React Query la comparte, así que no se pide dos veces
  const { data: consultorios = [], isPending } = useQuery({
    queryKey: ['consultorios'],
    queryFn: obtenerConsultorios,
  });

  const especialidades = [...new Set(consultorios.map((c) => c.especialidad))].sort();

  function buscar(evento) {
    evento.preventDefault();
    const params = new URLSearchParams();
    if (texto.trim()) params.set('q', texto.trim());
    if (especialidad) params.set('especialidad', especialidad);
    navigate(`/buscar?${params}`);
  }

  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-12 sm:pt-20">
        <h1 className="max-w-3xl text-4xl leading-tight sm:text-5xl">
          Agenda tu cita en un consultorio de Bucaramanga
        </h1>
        <p className="mt-4 max-w-xl text-lg text-tinta-suave">
          Mira los horarios libres y confirma sin llamadas ni mensajes.
        </p>

        <form
          role="search"
          onSubmit={buscar}
          className="mt-8 grid gap-4 sm:grid-cols-[1fr_14rem_auto] sm:items-end"
        >
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
            disabled={isPending}
          >
            <option value="">Todas</option>
            {especialidades.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </Campo>
          <Boton type="submit">Buscar consultorio</Boton>
        </form>
      </section>

      {/* Si falla la carga o no hay consultorios, esta sección no aparece: la búsqueda de arriba sigue funcionando */}
      {(isPending || especialidades.length > 0) && (
        <section aria-labelledby="titulo-especialidades" className="mx-auto max-w-5xl px-4 pb-12">
          <h2 id="titulo-especialidades" className="text-xl">
            Busca por especialidad
          </h2>

          {isPending ? (
            <Cargando etiqueta="Cargando especialidades">
              <div className="mt-4 flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-11 w-28 rounded-full" />
                ))}
              </div>
            </Cargando>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {especialidades.map((esp) => (
                <li key={esp}>
                  <Link
                    to={`/buscar?${new URLSearchParams({ especialidad: esp })}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-borde-fuerte bg-superficie px-4 transition-colors duration-150 hover:bg-borde/40 active:bg-borde"
                  >
                    {esp}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section
        aria-labelledby="titulo-pasos"
        className="mx-auto max-w-5xl border-t border-borde px-4 py-12"
      >
        <h2 id="titulo-pasos" className="text-xl">
          Cómo funciona
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {PASOS.map((paso, indice) => (
            <li key={paso.titulo} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primario-suave font-medium text-primario"
              >
                {indice + 1}
              </span>
              <div>
                <p className="font-medium">{paso.titulo}</p>
                <p className="mt-1 text-tinta-suave">{paso.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

export default Home;