import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, MapPin, Phone, Plus } from 'lucide-react';
import {
  actualizarConsultorio,
  crearConsultorio,
  eliminarConsultorio,
  obtenerConsultorios,
} from '../api/consultorios';
import Alerta from '../components/ui/Alerta';
import Boton from '../components/ui/Boton';
import Campo from '../components/ui/Campo';
import Dialogo from '../components/ui/Dialogo';
import EstadoError from '../components/ui/EstadoError';
import EstadoVacio from '../components/ui/EstadoVacio';
import { Cargando, Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

const esquema = z.object({
  nombre: z.string().trim().min(3, 'Escribe el nombre del consultorio'),
  especialidad: z.string().trim().min(3, 'Escribe la especialidad'),
  direccion: z.string().trim().min(5, 'Escribe la dirección'),
  telefono: z.string().trim().regex(/^\d{7,10}$/, 'Escribe entre 7 y 10 dígitos, sin espacios'),
  email: z.string().trim().email('Escribe un correo válido').or(z.literal('')),
  descripcion: z.string().trim().max(500, 'Máximo 500 caracteres'),
});

function FormConsultorio({ consultorio, especialidades, onCerrar }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const editando = Boolean(consultorio);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: consultorio?.nombre ?? '',
      especialidad: consultorio?.especialidad ?? '',
      direccion: consultorio?.direccion ?? '',
      telefono: consultorio?.telefono ?? '',
      email: consultorio?.email ?? '',
      descripcion: consultorio?.descripcion ?? '',
    },
  });

  const guardar = useMutation({
    mutationFn: (datos) =>
      editando ? actualizarConsultorio(consultorio.id, datos) : crearConsultorio(datos),
    onSuccess: () => {
      toast.exito(editando ? 'Consultorio actualizado' : 'Consultorio creado');
      queryClient.invalidateQueries({ queryKey: ['consultorios'] });
      queryClient.invalidateQueries({ queryKey: ['consultorio'] });
      onCerrar();
    },
  });

  function onSubmit(datos) {
    // Al crear, los campos vacíos no se envían. Al editar, un campo vacío borra el valor anterior
    const cuerpo = editando
      ? datos
      : Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, v === '' ? undefined : v]));
    guardar.mutate(cuerpo);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Campo etiqueta="Nombre" error={errors.nombre?.message} {...register('nombre')} />

      <Campo
        etiqueta="Especialidad"
        list="lista-especialidades"
        autoComplete="off"
        error={errors.especialidad?.message}
        {...register('especialidad')}
      />
      <datalist id="lista-especialidades">
        {especialidades.map((esp) => (
          <option key={esp} value={esp} />
        ))}
      </datalist>

      <Campo etiqueta="Dirección" error={errors.direccion?.message} {...register('direccion')} />
      <Campo
        etiqueta="Teléfono"
        type="tel"
        inputMode="numeric"
        error={errors.telefono?.message}
        {...register('telefono')}
      />
      <Campo
        etiqueta="Correo electrónico"
        opcional
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Campo
        como="textarea"
        etiqueta="Descripción"
        opcional
        rows={3}
        error={errors.descripcion?.message}
        {...register('descripcion')}
      />

      {guardar.isError && <Alerta>{guardar.error.message}</Alerta>}

      <div className="flex justify-end gap-3">
        <Boton variante="fantasma" onClick={onCerrar}>
          Cancelar
        </Boton>
        <Boton
          type="submit"
          cargando={guardar.isPending}
          textoCargando="Guardando..."
        >
          {editando ? 'Guardar cambios' : 'Crear consultorio'}
        </Boton>
      </div>
    </form>
  );
}

function AdminConsultorios() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [edicion, setEdicion] = useState(null); // null | 'nuevo' | un consultorio
  const [aEliminar, setAEliminar] = useState(null);

  const {
    data: consultorios = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['consultorios'],
    queryFn: obtenerConsultorios,
  });

  const eliminar = useMutation({
    mutationFn: (id) => eliminarConsultorio(id),
    onSuccess: () => {
      toast.exito('Consultorio eliminado');
      setAEliminar(null);
      queryClient.invalidateQueries({ queryKey: ['consultorios'] });
    },
  });

  const especialidades = [...new Set(consultorios.map((c) => c.especialidad))].sort();

  function cerrarEliminar() {
    setAEliminar(null);
    eliminar.reset();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl">Consultorios</h1>
        <Boton onClick={() => setEdicion('nuevo')}>
          <Plus aria-hidden="true" className="h-4 w-4" />
          Nuevo consultorio
        </Boton>
      </div>

      <div className="mt-6">
        {isPending && (
          <Cargando etiqueta="Cargando consultorios">
            <ul className="space-y-3">
              {[1, 2, 3].map((n) => (
                <li key={n} className="rounded-superficie border border-borde bg-superficie p-4">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="mt-3 h-4 w-1/2" />
                  <Skeleton className="mt-2 h-4 w-1/4" />
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
            titulo="Aún no hay consultorios"
            descripcion="Crea el primero para que los pacientes puedan agendar."
            accion={<Boton onClick={() => setEdicion('nuevo')}>Nuevo consultorio</Boton>}
          />
        )}

        {!isPending && !isError && consultorios.length > 0 && (
          <ul className="space-y-3">
            {consultorios.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-4 rounded-superficie border border-borde bg-superficie p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <span className="inline-block rounded-full bg-primario-suave px-2.5 py-0.5 text-sm font-medium text-primario">
                    {c.especialidad}
                  </span>
                  <p className="mt-2 font-medium">
                    <Link
                      to={`/consultorios/${c.id}`}
                      className="text-primario underline-offset-2 hover:underline"
                    >
                      {c.nombre}
                    </Link>
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-tinta-suave">
                    <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                    {c.direccion}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-tinta-suave">
                    <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />
                    {c.telefono}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Boton variante="secundario" onClick={() => setEdicion(c)}>
                    Editar
                    <span className="sr-only"> {c.nombre}</span>
                  </Boton>
                  <Boton variante="secundario" onClick={() => setAEliminar(c)}>
                    Eliminar
                    <span className="sr-only"> {c.nombre}</span>
                  </Boton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Crear o editar */}
      <Dialogo
        abierto={edicion !== null}
        onCerrar={() => setEdicion(null)}
        titulo={edicion === 'nuevo' ? 'Nuevo consultorio' : 'Editar consultorio'}
      >
        {edicion !== null && (
          <FormConsultorio
            consultorio={edicion === 'nuevo' ? null : edicion}
            especialidades={especialidades}
            onCerrar={() => setEdicion(null)}
          />
        )}
      </Dialogo>

      {/* Eliminar */}
      <Dialogo abierto={aEliminar !== null} onCerrar={cerrarEliminar} titulo="Eliminar consultorio">
        {aEliminar && (
          <>
            <p className="text-tinta-suave">
              Vas a eliminar{' '}
              <span className="font-medium text-tinta">{aEliminar.nombre}</span> y sus horarios de
              atención. Esta acción no se puede deshacer. Si el consultorio tiene médicos o citas
              asociadas, no se podrá eliminar.
            </p>

            {eliminar.isError && (
              <div className="mt-4">
                <Alerta>{eliminar.error.message}</Alerta>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Boton variante="fantasma" onClick={cerrarEliminar}>
                Cancelar
              </Boton>
              <Boton
                variante="peligro"
                cargando={eliminar.isPending}
                textoCargando="Eliminando..."
                onClick={() => eliminar.mutate(aEliminar.id)}
              >
                Eliminar consultorio
              </Boton>
            </div>
          </>
        )}
      </Dialogo>
    </main>
  );
}

export default AdminConsultorios;