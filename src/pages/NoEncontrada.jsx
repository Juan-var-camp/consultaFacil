import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { clasesBoton } from '../components/ui/Boton';
import EstadoVacio from '../components/ui/EstadoVacio';

function NoEncontrada() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="sr-only">Página no encontrada</h1>
      <EstadoVacio
        icono={SearchX}
        titulo="No encontramos esta página"
        descripcion="Puede que el enlace esté incompleto o que la página ya no exista."
        accion={
          <Link to="/" className={clasesBoton('primario')}>
            Ir al inicio
          </Link>
        }
      />
    </main>
  );
}

export default NoEncontrada;