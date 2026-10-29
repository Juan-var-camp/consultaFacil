import { useState } from 'react';
import { Inbox } from 'lucide-react';
import { useTema } from '../hooks/useTema';
import { useToast } from '../components/ui/Toast';
import Boton from '../components/ui/Boton';
import Campo from '../components/ui/Campo';
import Dialogo from '../components/ui/Dialogo';
import EstadoVacio from '../components/ui/EstadoVacio';
import EstadoError from '../components/ui/EstadoError';
import { Cargando, Skeleton } from '../components/ui/Skeleton';

function Sistema() {
  const { oscuro, alternar } = useTema();
  const toast = useToast();
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  return (
    <main className="mx-auto max-w-3xl space-y-12 px-4 py-12">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl">Sistema de diseño</h1>
        <Boton variante="secundario" onClick={alternar}>
          {oscuro ? 'Usar tema claro' : 'Usar tema oscuro'}
        </Boton>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl">Botones</h2>
        <div className="flex flex-wrap gap-3">
          <Boton>Agendar cita</Boton>
          <Boton variante="secundario">Ver detalles</Boton>
          <Boton variante="fantasma">Cancelar</Boton>
          <Boton variante="peligro">Cancelar cita</Boton>
          <Boton disabled>Deshabilitado</Boton>
          <Boton cargando textoCargando="Agendando...">
            Agendar cita
          </Boton>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Campos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Correo electrónico" type="email" ayuda="Lo usaremos para confirmar tu cita." />
          <Campo etiqueta="Contraseña" type="password" error="Debe tener al menos 8 caracteres." />
          <Campo etiqueta="Teléfono" type="tel" opcional />
          <Campo como="select" etiqueta="Especialidad" defaultValue="">
            <option value="">Todas</option>
            <option>Pediatría</option>
            <option>Medicina general</option>
          </Campo>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Cargando</h2>
        <Cargando etiqueta="Cargando consultorios">
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-superficie border border-borde bg-superficie p-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="mt-3 h-5 w-1/2" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </div>
            ))}
          </div>
        </Cargando>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Vacío y error</h2>
        <EstadoVacio
          icono={Inbox}
          titulo="Aún no tienes citas"
          descripcion="Busca un consultorio y agenda tu primera cita."
          accion={<Boton>Buscar consultorio</Boton>}
        />
        <EstadoError
          mensaje="Revisa tu conexión e inténtalo de nuevo."
          onReintentar={() => toast.exito('Reintentando...')}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Avisos y diálogo</h2>
        <div className="flex flex-wrap gap-3">
          <Boton variante="secundario" onClick={() => toast.exito('Cita agendada')}>
            Aviso de éxito
          </Boton>
          <Boton variante="secundario" onClick={() => toast.error('No pudimos agendar la cita. Inténtalo de nuevo.')}>
            Aviso de error
          </Boton>
          <Boton variante="secundario" onClick={() => setDialogoAbierto(true)}>
            Abrir diálogo
          </Boton>
        </div>

        <Dialogo abierto={dialogoAbierto} onCerrar={() => setDialogoAbierto(false)} titulo="Cancelar cita">
          <p className="text-tinta-suave">El horario quedará libre para otros pacientes.</p>
          <div className="mt-6 flex justify-end gap-3">
            <Boton variante="fantasma" onClick={() => setDialogoAbierto(false)}>
              Mantener cita
            </Boton>
            <Boton
              variante="peligro"
              onClick={() => {
                setDialogoAbierto(false);
                toast.exito('Cita cancelada');
              }}
            >
              Cancelar cita
            </Boton>
          </div>
        </Dialogo>
      </section>
    </main>
  );
}

export default Sistema;