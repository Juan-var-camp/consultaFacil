import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SearchX, Users } from 'lucide-react';
import { cambiarAcceso, obtenerUsuarios } from '../api/usuarios';
import { obtenerConsultorios } from '../api/consultorios';
import { useAuth } from '../context/AuthContext';
import Alerta from '../components/ui/Alerta';
import Boton from '../components/ui/Boton';
import Campo from '../components/ui/Campo';
import Dialogo from '../components/ui/Dialogo';
import EstadoError from '../components/ui/EstadoError';
import EstadoVacio from '../components/ui/EstadoVacio';
import { Cargando, Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

const ROLES = {
  PACIENTE: { texto: 'Paciente', clases: 'border border-borde-fuerte text-tinta-suave' },
  MEDICO: { texto: 'Médico', clases: 'bg-primario-suave text-primario' },
  ADMIN: { texto: 'Administrador', clases: 'bg-borde text-tinta' },
};

// Compara sin tildes ni mayúsculas
const normalizar = (texto) =>
  texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function ChipRol({ rol }) {
  const { texto, clases } = ROLES[rol];
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-medium ${clases}`}>
      {texto}
    </span>
  );
}

function FormAcceso({ persona, consultorios, onCerrar }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [rol, setRol] = useState(persona.rol);
  const [consultorioId, setConsultorioId] = useState(
    persona.consultorioId ? String(persona.consultorioId) : ''
  );
  const [errorCampo, setErrorCampo] = useState('');

  const cambiar = useMutation({
    mutationFn: (datos) => cambiarAcceso(persona.id, datos),
    onSuccess: () => {
      toast.exito('Acceso actualizado');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      onCerrar();
    },
  });

  const sinCambios =
    rol === persona.rol &&
    (rol !== 'MEDICO' || consultorioId === String(persona.consultorioId ?? ''));

  function enviar(evento) {
    evento.preventDefault();
    if (rol === 'MEDICO' && !consultorioId) {
      setErrorCampo('Elige el consultorio del médico');
      return;
    }
    cambiar.mutate({ rol, consultorioId: rol === 'MEDICO' ? Number(consultorioId) : null });
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <p>
        <span className="font-medium">{persona.nombre}</span>
        <span className="block text-tinta-suave">{persona.email}</span>
      </p>

      <Campo
        como="select"
        etiqueta="Rol"
        value={rol}
        onChange={(e) => {
          setRol(e.target.value);
          setErrorCampo('');
        }}
      >
        {Object.entries(ROLES).map(([valor, { texto }]) => (
          <option key={valor} value={valor}>
            {texto}
          </option>
        ))}
      </Campo>

      {rol === 'MEDICO' && (
        <Campo
          como="select"
          etiqueta="Consultorio"
          value={consultorioId}
          error={errorCampo}
          onChange={(e) => {
            setConsultorioId(e.target.value);
            setErrorCampo('');
          }}
        >
          <option value="">Elige un consultorio</option>
          {consultorios.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Campo>
      )}

      <p className="text-sm text-tinta-suave">
        El cambio se aplica cuando la persona vuelva a iniciar sesión.
      </p>

      {cambiar.isError && <Alerta>{cambiar.error.message}</Alerta>}

      <div className="flex justify-end gap-3">
        <Boton variante="fantasma" onClick={onCerrar}>
          Cancelar
        </Boton>
        <Boton
          type="submit"
          disabled={sinCambios}
          cargando={cambiar.isPending}
          textoCargando="Guardando..."
        >
          Guardar acceso
        </Boton>
      </div>
    </form>
  );
}

function AdminUsuarios() {
  const { usuario: yo } = useAuth();
  const [texto, setTexto] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [editando, setEditando] = useState(null);

  const usuariosQ = useQuery({ queryKey: ['usuarios'], queryFn: obtenerUsuarios });
  const consultoriosQ = useQuery({ queryKey: ['consultorios'], queryFn: obtenerConsultorios });

  const usuarios = usuariosQ.data ?? [];
  const consultorios = consultoriosQ.data ?? [];

  const busqueda = normalizar(texto.trim());
  const filtrados = usuarios.filter(
    (u) =>
      (normalizar(u.nombre).includes(busqueda) || normalizar(u.email).includes(busqueda)) &&
      (!rolFiltro || u.rol === rolFiltro)
  );

  function limpiarFiltros() {
    setTexto('');
    setRolFiltro('');
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl">Usuarios</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_14rem]">
        <Campo
          etiqueta="Nombre o correo"
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <Campo
          como="select"
          etiqueta="Rol"
          value={rolFiltro}
          onChange={(e) => setRolFiltro(e.target.value)}
        >
          <option value="">Todos</option>
          {Object.entries(ROLES).map(([valor, { texto: nombre }]) => (
            <option key={valor} value={valor}>
              {nombre}
            </option>
          ))}
        </Campo>
      </div>

      <div className="mt-8">
        {usuariosQ.isPending && (
          <Cargando etiqueta="Cargando usuarios">
            <ul className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className="rounded-superficie border border-borde bg-superficie p-4">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="mt-3 h-4 w-1/2" />
                </li>
              ))}
            </ul>
          </Cargando>
        )}

        {usuariosQ.isError && (
          <EstadoError
            titulo="No pudimos cargar los usuarios"
            mensaje="Revisa tu conexión e inténtalo de nuevo."
            onReintentar={() => usuariosQ.refetch()}
          />
        )}

        {usuariosQ.isSuccess && usuarios.length === 0 && (
          <EstadoVacio
            icono={Users}
            titulo="Aún no hay usuarios"
            descripcion="Las personas aparecen aquí cuando crean su cuenta."
          />
        )}

        {usuariosQ.isSuccess && usuarios.length > 0 && filtrados.length === 0 && (
          <EstadoVacio
            icono={SearchX}
            titulo="Ninguna persona coincide"
            descripcion="Prueba con otro nombre, correo o rol."
            accion={
              <Boton variante="secundario" onClick={limpiarFiltros}>
                Limpiar filtros
              </Boton>
            }
          />
        )}

        {usuariosQ.isSuccess && filtrados.length > 0 && (
          <>
            <p aria-live="polite" className="mb-3 text-sm text-tinta-suave">
              {filtrados.length} {filtrados.length === 1 ? 'persona' : 'personas'}
            </p>
            <ul className="space-y-3">
              {filtrados.map((u) => {
                const consultorio = consultorios.find((c) => c.id === u.consultorioId);
                return (
                  <li
                    key={u.id}
                    className="flex flex-col gap-3 rounded-superficie border border-borde bg-superficie p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{u.nombre}</p>
                        <ChipRol rol={u.rol} />
                      </div>
                      <p className="mt-1 break-all text-tinta-suave">{u.email}</p>
                      {u.rol === 'MEDICO' && (
                        <p className="mt-1 text-tinta-suave">
                          {consultorio ? `Consultorio: ${consultorio.nombre}` : 'Sin consultorio asignado'}
                        </p>
                      )}
                    </div>

                    {u.id === yo.id ? (
                      <p className="text-tinta-suave">Tu cuenta</p>
                    ) : (
                      <Boton variante="secundario" onClick={() => setEditando(u)}>
                        Cambiar acceso
                        <span className="sr-only"> de {u.nombre}</span>
                      </Boton>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <Dialogo abierto={editando !== null} onCerrar={() => setEditando(null)} titulo="Cambiar acceso">
        {editando && (
          <FormAcceso
            persona={editando}
            consultorios={consultorios}
            onCerrar={() => setEditando(null)}
          />
        )}
      </Dialogo>
    </main>
  );
}

export default AdminUsuarios;