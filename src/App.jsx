import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Buscar from './pages/Buscar';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Sistema from './pages/Sistema';
import Consultorio from './pages/Consultorio';
import MisCitas from './pages/MisCitas';
import Agenda from './pages/Agenda';
import Horarios from './pages/Horarios';
import RutaProtegida from './components/RutaProtegida';  // se activa con la primera ruta protegida

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buscar" element={<Buscar />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/consultorios/:id" element={<Consultorio />} />

        <Route element={<RutaProtegida />}>
          <Route path="/sistema" element={<Sistema />} />
        </Route>

        <Route element={<RutaProtegida roles={['PACIENTE']} />}>
          <Route path="/mis-citas" element={<MisCitas />} />
        </Route>

        <Route element={<RutaProtegida roles={['MEDICO']} />}>
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/horarios" element={<Horarios />} />
        </Route>

        {/* Rutas solo para ADMIN:
        <Route element={<RutaProtegida roles={['ADMIN']} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        */}
      </Routes>
    </>
  );
}

export default App;