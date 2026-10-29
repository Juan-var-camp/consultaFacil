import { createContext, useContext, useEffect, useState } from 'react';
import { iniciarSesion, registrarse, obtenerPerfil } from '../api/auth';
import { TOKEN_KEY } from '../api/cliente';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al abrir la app: si hay token guardado, recuperar quién es
  useEffect(() => {
    async function restaurarSesion() {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setCargando(false);
        return;
      }
      try {
        setUsuario(await obtenerPerfil());
      } catch {
        localStorage.removeItem(TOKEN_KEY); // token vencido o inválido
      } finally {
        setCargando(false);
      }
    }
    restaurarSesion();
  }, []);

  async function login(datos) {
    const { token, usuario } = await iniciarSesion(datos);
    localStorage.setItem(TOKEN_KEY, token);
    setUsuario(usuario);
    return usuario;
  }

  async function registro(datos) {
    const { token, usuario } = await registrarse(datos);
    localStorage.setItem(TOKEN_KEY, token);
    setUsuario(usuario);
    return usuario;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return contexto;
}