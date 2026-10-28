import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { obtenerConsultorios } from '../api/consultorios';

function Buscar() {
  const [texto, setTexto] = useState('');
  const [especialidad, setEspecialidad] = useState('');

  const {
    data: consultorios = [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['consultorios'],
    queryFn: obtenerConsultorios,
  });

  // Lista de especialidades únicas para el selector
  const especialidades = [...new Set(consultorios.map((c) => c.especialidad))].sort();

  // Filtrado en el cliente
  const filtrados = consultorios.filter((c) => {
    const busqueda = texto.toLowerCase().trim();
    const coincideTexto =
      c.nombre.toLowerCase().includes(busqueda) ||
      c.direccion.toLowerCase().includes(busqueda);
    const coincideEspecialidad = !especialidad || c.especialidad === especialidad;
    return coincideTexto && coincideEspecialidad;
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Buscar consultorio</h1>
      <p className="text-gray-600 mb-6">
        Encuentra un consultorio en Bucaramanga y agenda tu cita.
      </p>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar por nombre o dirección..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={especialidad}
          onChange={(e) => setEspecialidad(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las especialidades</option>
          {especialidades.map((esp) => (
            <option key={esp} value={esp}>
              {esp}
            </option>
          ))}
        </select>
      </div>

      {/* Estado: cargando */}
      {isPending && (
        <p className="text-gray-500 text-center py-12">Cargando consultorios...</p>
      )}

      {/* Estado: error */}
      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-center">
          <p className="mb-3">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estado: datos */}
      {!isPending && !isError && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {filtrados.length} consultorio{filtrados.length !== 1 && 's'} encontrado
            {filtrados.length !== 1 && 's'}
            {isFetching && ' · actualizando...'}
          </p>

          {filtrados.length === 0 ? (
            <p className="text-gray-500 text-center py-12">
              No hay consultorios que coincidan con tu búsqueda.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map((c) => (
                <article
                  key={c.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="inline-block text-xs font-semibold bg-blue-100 text-blue-700 rounded-full px-3 py-1 mb-3">
                    {c.especialidad}
                  </span>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">{c.nombre}</h2>
                  <p className="text-sm text-gray-600 mb-1"> {c.direccion}</p>
                  <p className="text-sm text-gray-600 mb-4"> {c.telefono}</p>
                  {c.descripcion && (
                    <p className="text-sm text-gray-500 mb-4">{c.descripcion}</p>
                  )}
                  <button
                    disabled
                    className="w-full bg-blue-600 text-white rounded-lg py-2 opacity-60 cursor-not-allowed"
                    title="Disponible cuando tengamos login"
                  >
                    Agendar cita
                  </button>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default Buscar;