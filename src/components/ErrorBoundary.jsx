import { Component } from 'react';
import { useLocation } from 'react-router-dom';
import EstadoError from './ui/EstadoError';

class Limite extends Component {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  // Al navegar a otra página, se vuelve a intentar dibujar
  componentDidUpdate(anteriores) {
    if (anteriores.ruta !== this.props.ruta && this.state.fallo) {
      this.setState({ fallo: false });
    }
  }

  render() {
    if (this.state.fallo) {
      return (
        <main className="mx-auto max-w-3xl px-4 py-12">
          <EstadoError
            titulo="Esta página no pudo mostrarse"
            mensaje="Recárgala para intentarlo de nuevo."
            onReintentar={() => window.location.reload()}
          />
        </main>
      );
    }
    return this.props.children;
  }
}

export default function ErrorBoundary({ children }) {
  const { pathname } = useLocation();
  return <Limite ruta={pathname}>{children}</Limite>;
}