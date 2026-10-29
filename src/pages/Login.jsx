import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alerta from '../components/ui/Alerta';
import Boton from '../components/ui/Boton';
import Campo from '../components/ui/Campo';

const esquema = z.object({
  email: z.string().min(1, 'Escribe tu correo electrónico').email('Escribe un correo válido'),
  password: z.string().min(1, 'Escribe tu contraseña'),
});

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const desde = ubicacion.state?.desde ?? '/buscar';
  const [errorServidor, setErrorServidor] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquema) });

  async function onSubmit(datos) {
    setErrorServidor('');
    try {
      await login(datos);
      navigate(desde, { replace: true });
    } catch (error) {
      setErrorServidor(error.message);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl">Iniciar sesión</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 space-y-4 rounded-superficie border border-borde bg-superficie p-6"
      >
        <Campo
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Campo
          etiqueta="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {errorServidor && <Alerta>{errorServidor}</Alerta>}

        <Boton type="submit" cargando={isSubmitting} textoCargando="Ingresando..." className="w-full">
          Ingresar
        </Boton>
      </form>

      <p className="mt-6 text-center text-tinta-suave">
        ¿Primera vez aquí?{' '}
        <Link to="/registro" className="font-medium text-primario underline underline-offset-2 hover:text-primario-hover">
          Crea tu cuenta
        </Link>
      </p>
    </main>
  );
}

export default Login;