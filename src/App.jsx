import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CambioDeRuta from './components/CambioDeRuta';
import ErrorBoundary from './components/ErrorBoundary';
import RutaProtegida from './components/RutaProtegida';
import Home from './pages/Home';
import Buscar from './pages/Buscar';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Consultorio from './pages/Consultorio';
import MisCitas from './pages/MisCitas';
import Agenda from './pages/Agenda';
import Horarios from './pages/Horarios';
import AdminConsultorios from './pages/AdminConsultorios';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminCitas from './pages/AdminCitas';
import NoEncontrada from './pages/NoEncontrada';

function App() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primario focus:px-4 focus:py-2 focus:text-sobre-primario"
      >
        Saltar al contenido
      </a>

      <Header />
      <CambioDeRuta />

      <div id="contenido" tabIndex={-1} className="outline-none">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buscar" element={<Buscar />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/consultorios/:id" element={<Consultorio />} />

            <Route element={<RutaProtegida roles={['PACIENTE']} />}>
              <Route path="/mis-citas" element={<MisCitas />} />
            </Route>

            <Route element={<RutaProtegida roles={['MEDICO']} />}>
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/horarios" element={<Horarios />} />
            </Route>

            <Route element={<RutaProtegida roles={['ADMIN']} />}>
              <Route path="/admin/consultorios" element={<AdminConsultorios />} />
              <Route path="/admin/usuarios" element={<AdminUsuarios />} />
              <Route path="/admin/citas" element={<AdminCitas />} />
            </Route>

            <Route path="*" element={<NoEncontrada />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </>
  );
}

export default App;