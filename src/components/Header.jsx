import { Link, NavLink } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTema } from '../hooks/useTema';
import Boton, { clasesBoton } from './ui/Boton';

// NavLink pasa isActive: la página actual se marca sola
const claseEnlace = ({ isActive }) =>
  `rounded-control px-3 py-2 text-base font-medium transition-colors duration-150 ${
    isActive
      ? 'bg-primario-suave text-primario'
      : 'text-tinta-suave hover:bg-borde/40 hover:text-tinta'
  }`;

function Header() {
  const { usuario, logout } = useAuth();
  const { oscuro, alternar } = useTema();

  return (
    <header className="border-b border-borde bg-superficie">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link
          to="/"
          className="rounded-control font-titulo text-xl font-semibold tracking-tight text-primario"
        >
          ConsultaFácil
        </Link>

        {/* En celular baja a una segunda fila (order-last) y se desplaza si no cabe */}
        <nav
          aria-label="Principal"
          className="order-last flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto sm:overflow-visible"
        >
          <NavLink to="/buscar" className={claseEnlace}>
            Buscar consultorio
          </NavLink>

          {usuario?.rol === 'PACIENTE' && (
            <NavLink to="/mis-citas" className={claseEnlace}>
              Mis citas
            </NavLink>
          )}

          {usuario?.rol === 'MEDICO' && (
            <>
              <NavLink to="/agenda" className={claseEnlace}>
                Agenda
              </NavLink>
              <NavLink to="/horarios" className={claseEnlace}>
                Horarios
              </NavLink>
            </>
          )}

          {usuario?.rol === 'ADMIN' && (
            <>
              <NavLink to="/admin/consultorios" className={claseEnlace}>
                Consultorios
              </NavLink>
              <NavLink to="/admin/usuarios" className={claseEnlace}>
                Usuarios
              </NavLink>
              <NavLink to="/admin/citas" className={claseEnlace}>
                Citas
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={alternar}
            aria-label={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-control text-tinta-suave transition-colors duration-150 hover:bg-borde/40 hover:text-tinta"
          >
            {oscuro ? (
              <Sun aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Moon aria-hidden="true" className="h-5 w-5" />
            )}
          </button>

          {usuario ? (
            <>
              <span className="hidden text-sm text-tinta-suave sm:inline">{usuario.nombre}</span>
              <Boton variante="secundario" onClick={logout}>
                Salir
              </Boton>
            </>
          ) : (
            <Link to="/login" className={clasesBoton('primario')}>
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;