import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alerta from '../components/ui/Alerta';
import Boton from '../components/ui/Boton';
import Campo from '../components/ui/Campo';
import { useToast } from '../components/ui/Toast';

const esquema = z.object({
  nombre: z.string().trim().min(2, 'Escribe tu nombre completo'),
  email: z.string().min(1, 'Escribe tu correo electrónico').email('Escribe un correo válido'),
  telefono: z.string().regex(/^(\d{10})?$/, 'Escribe 10 dígitos, sin espacios ni guiones'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

function Registro() {
  const { registro } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [errorServidor, setErrorServidor] = useState('');
  const ubicacion = useLocation();
  const desde = ubicacion.state?.desde ?? '/buscar';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquema) });

  async function onSubmit(datos) {
    setErrorServidor('');
    try {
      await registro({ ...datos, telefono: datos.telefono || undefined });
      toast.exito('Cuenta creada');
      navigate(desde, { replace: true });
    } catch (error) {
      setErrorServidor(error.message);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl">Crear cuenta</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 space-y-4 rounded-superficie border border-borde bg-superficie p-6"
      >
        <Campo
          etiqueta="Nombre completo"
          autoComplete="name"
          error={errors.nombre?.message}
          {...register('nombre')}
        />
        <Campo
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Campo
          etiqueta="Teléfono"
          opcional
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          error={errors.telefono?.message}
          {...register('telefono')}
        />
        <Campo
          etiqueta="Contraseña"
          type="password"
          autoComplete="new-password"
          ayuda="Mínimo 8 caracteres."
          error={errors.password?.message}
          {...register('password')}
        />

        {errorServidor && <Alerta>{errorServidor}</Alerta>}

        <Boton type="submit" cargando={isSubmitting} textoCargando="Creando cuenta..." className="w-full">
          Crear cuenta
        </Boton>
      </form>

      <p className="mt-6 text-center text-tinta-suave">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" state={ubicacion.state} className="font-medium text-primario underline underline-offset-2 hover:text-primario-hover">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}

export default Registro;