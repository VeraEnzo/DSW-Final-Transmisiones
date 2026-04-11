import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import Spinner from '../components/Spinner';

export default function Perfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password_actual: '', password_nuevo: '', confirmar: '' });
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (form.password_nuevo !== form.confirmar) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (form.password_nuevo.length < 6) {
      setError('La contraseña nueva debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await api.put('/usuarios/cambiar-password', {
        password_actual: form.password_actual,
        password_nuevo: form.password_nuevo,
      });
      setExito('Contraseña actualizada correctamente');
      setForm({ password_actual: '', password_nuevo: '', confirmar: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost btn text-sm">← Volver</button>
        <h2 className="text-xl font-bold text-slate-100">Mi perfil</h2>
      </div>

      {/* Info del usuario */}
      <div className="card grid grid-cols-2 gap-4">
        <div>
          <p className="label">Nombre</p>
          <p className="text-slate-200">{user?.nombre}</p>
        </div>
        <div>
          <p className="label">Email</p>
          <p className="text-slate-200">{user?.email}</p>
        </div>
        <div>
          <p className="label">Rol</p>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${
            user?.rol === 'admin'
              ? 'text-purple-400 border-purple-700 bg-purple-900/20'
              : 'text-sky-400 border-sky-700 bg-sky-900/20'
          }`}>
            {user?.rol}
          </span>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-slate-200">Cambiar contraseña</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Contraseña actual</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password_actual}
              onChange={(e) => setForm((f) => ({ ...f, password_actual: e.target.value }))}
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="label">Contraseña nueva</label>
            <input
              className="input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password_nuevo}
              onChange={(e) => setForm((f) => ({ ...f, password_nuevo: e.target.value }))}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label">Confirmar contraseña nueva</label>
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
          {exito && <p className="text-emerald-400 text-sm bg-emerald-900/30 rounded-lg px-3 py-2">{exito}</p>}

          <button type="submit" className="btn-primary btn w-full" disabled={loading}>
            {loading ? <><Spinner size="sm" /> Guardando...</> : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
