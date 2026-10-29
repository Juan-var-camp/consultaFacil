import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Buscar from './pages/Buscar';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Sistema from './pages/Sistema';
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

        <Route element={<RutaProtegida />}>
          <Route path="/sistema" element={<Sistema />} />
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