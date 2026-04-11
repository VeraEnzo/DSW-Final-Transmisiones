import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import Spinner from '../components/Spinner';

export default function Login() {
  const [modo, setModo] = useState('login'); // 'login' | 'register' | 'reset'
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register/public', {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
      });
      // Auto-login after register
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const cambiarModo = (nuevo) => {
    setModo(nuevo);
    setError('');
    setForm({ nombre: '', email: '', password: '', confirmar: '' });
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/usuarios/solicitar-reset', { email: form.email });
      setError('');
      setModo('reset-ok');
    } catch {
      setError('Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="https://agrotransmisionesautomaticas.com.ar/wp-content/uploads/2024/09/LogoBlanco.png"
            alt="Agrotransmisiones Automáticas"
            className="h-14 w-auto mx-auto mb-3"
          />
          <p className="text-slate-400 text-sm mt-1">Sistema de gestión de reparaciones</p>
        </div>

        {/* Tabs — solo en login y register */}
        {(modo === 'login' || modo === 'register') && (
          <div className="flex mb-4 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => cambiarModo('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                modo === 'login' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => cambiarModo('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                modo === 'register' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Registrarse
            </button>
          </div>
        )}

        {/* Login form */}
        {modo === 'login' && (
          <form onSubmit={handleLogin} className="card space-y-4" autoComplete="off">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="usuario@taller.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                autoComplete="off"
                name="login-password"
              />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/30 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" className="btn-primary btn w-full" disabled={loading}>
              {loading ? <><Spinner size="sm" /> Ingresando...</> : 'Ingresar'}
            </button>
            <button type="button" onClick={() => cambiarModo('reset')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors pt-1">
              Olvidé mi contraseña
            </button>
          </form>
        )}

        {/* Register form */}
        {modo === 'register' && (
          <form onSubmit={handleRegister} className="card space-y-4">
            <div>
              <label className="label">Nombre completo</label>
              <input
                className="input"
                type="text"
                placeholder="Juan Pérez"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="usuario@taller.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                className="input"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="label">Confirmar contraseña</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.confirmar}
                onChange={(e) => setForm((f) => ({ ...f, confirmar: e.target.value }))}
                required
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/30 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" className="btn-primary btn w-full" disabled={loading}>
              {loading ? <><Spinner size="sm" /> Registrando...</> : 'Crear cuenta'}
            </button>
            <p className="text-xs text-slate-500 text-center">
              Tu cuenta se crea como técnico. El administrador puede cambiar tu rol.
            </p>
          </form>
        )}

        {/* Olvidé mi contraseña */}
        {modo === 'reset' && (
          <form onSubmit={handleReset} className="card space-y-4">
            <div>
              <h3 className="font-semibold text-slate-200 mb-1">Recuperar contraseña</h3>
              <p className="text-xs text-slate-400">
                Ingresá tu email y se le enviará una solicitud al administrador para que resetee tu contraseña.
              </p>
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="usuario@taller.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/30 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" className="btn-primary btn w-full" disabled={loading}>
              {loading ? <><Spinner size="sm" /> Enviando...</> : 'Enviar solicitud'}
            </button>
            <button type="button" onClick={() => cambiarModo('login')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Volver al login
            </button>
          </form>
        )}

        {/* Confirmación de solicitud enviada */}
        {modo === 'reset-ok' && (
          <div className="card space-y-4 text-center">
            <div className="text-4xl">✓</div>
            <p className="text-emerald-400 font-medium">Solicitud enviada</p>
            <p className="text-sm text-slate-400">
              El administrador va a resetear tu contraseña y te avisará por WhatsApp o teléfono con la contraseña temporal.
            </p>
            <button onClick={() => cambiarModo('login')} className="btn-secondary btn w-full">
              Volver al login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
