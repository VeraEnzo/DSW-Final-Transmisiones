import { useState, useEffect } from 'react';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import { useAuth } from '../contexts/AuthContext';

function SolicitudesReset() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(null);
  const [passwordTemporal, setPasswordTemporal] = useState(null);

  useEffect(() => {
    api.get('/usuarios/solicitudes-reset')
      .then(({ data }) => setSolicitudes(data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleReset = async (id, nombre) => {
    setResetting(id);
    try {
      const { data } = await api.post(`/usuarios/solicitudes-reset/${id}/resetear`);
      setPasswordTemporal({ nombre, password: data.data.password_temporal });
      setSolicitudes((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setResetting(null); }
  };

  if (loading) return <Spinner size="sm" className="py-4" />;
  if (!solicitudes.length && !passwordTemporal) return null;

  return (
    <div className="card border-yellow-700 space-y-3">
      <h3 className="font-semibold text-yellow-400 flex items-center gap-2">
        ⚠ Solicitudes de reset de contraseña ({solicitudes.length})
      </h3>

      {passwordTemporal && (
        <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg px-4 py-3 space-y-1">
          <p className="text-sm text-emerald-400 font-medium">Contraseña reseteada para {passwordTemporal.nombre}</p>
          <p className="text-xs text-slate-300">Contraseña temporal: <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-white">{passwordTemporal.password}</span></p>
          <p className="text-xs text-slate-500">Avisale al usuario por WhatsApp o teléfono.</p>
          <button className="text-xs text-slate-400 hover:text-slate-200 mt-1" onClick={() => setPasswordTemporal(null)}>Cerrar</button>
        </div>
      )}

      {solicitudes.map((s) => (
        <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
          <div>
            <p className="text-sm font-medium text-slate-200">{s.nombre}</p>
            <p className="text-xs text-slate-400">{s.email}</p>
            <p className="text-xs text-slate-500">{new Date(s.created_at).toLocaleString('es-AR')}</p>
          </div>
          <button
            className="btn-primary btn text-xs"
            onClick={() => handleReset(s.id, s.nombre)}
            disabled={resetting === s.id}
          >
            {resetting === s.id ? <Spinner size="sm" /> : 'Resetear contraseña'}
          </button>
        </div>
      ))}
    </div>
  );
}

function UserRow({ user, onUpdate, onDelete, currentUserId }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nombre: user.nombre, email: user.email, rol: user.rol, password: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { nombre: form.nombre, email: form.email, rol: form.rol };
      if (form.password) payload.password = form.password;
      await onUpdate(user.id, payload);
      setEditing(false);
    } finally { setSaving(false); }
  };

  if (editing) {
    return (
      <tr className="bg-slate-700/50">
        <td className="table-cell"><input className="input text-xs" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} /></td>
        <td className="table-cell"><input className="input text-xs" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></td>
        <td className="table-cell">
          <select className="input text-xs" value={form.rol} onChange={e => setForm(f => ({...f, rol: e.target.value}))}>
            <option value="admin">Admin</option>
            <option value="tecnico">Técnico</option>
          </select>
        </td>
        <td className="table-cell"><input className="input text-xs" type="password" placeholder="Nueva contraseña..." value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} /></td>
        <td className="table-cell">
          <div className="flex gap-1">
            <button className="btn-primary btn text-xs px-2 py-1" onClick={save} disabled={saving}>{saving ? <Spinner size="sm" /> : '✓'}</button>
            <button className="btn-ghost btn text-xs px-2 py-1" onClick={() => setEditing(false)}>✕</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-slate-700 hover:bg-slate-700/30">
      <td className="table-cell font-medium text-slate-200">{user.nombre}</td>
      <td className="table-cell text-slate-400">{user.email}</td>
      <td className="table-cell">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${user.rol === 'admin' ? 'text-purple-400 border-purple-700 bg-purple-900/20' : 'text-sky-400 border-sky-700 bg-sky-900/20'}`}>
          {user.rol}
        </span>
      </td>
      <td className="table-cell text-slate-500 text-xs">—</td>
      <td className="table-cell">
        <div className="flex gap-1">
          <button className="btn-ghost btn text-xs px-2 py-1" onClick={() => setEditing(true)}>✏</button>
          {user.id !== currentUserId && (
            <button className="btn-danger btn text-xs px-2 py-1" onClick={() => onDelete(user.id)}>🗑</button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function Usuarios() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'tecnico' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/usuarios').then(({ data }) => setUsuarios(data.data)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post('/usuarios', form);
      setUsuarios((p) => [...p, data.data]);
      setForm({ nombre: '', email: '', password: '', rol: 'tecnico' });
      setCreating(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear usuario');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (id, payload) => {
    const { data } = await api.put(`/usuarios/${id}`, payload);
    setUsuarios((p) => p.map((u) => (u.id === id ? data.data : u)));
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    await api.delete(`/usuarios/${id}`);
    setUsuarios((p) => p.filter((u) => u.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <SolicitudesReset />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">Usuarios</h2>
        <button className="btn-primary btn text-sm" onClick={() => setCreating(!creating)}>
          {creating ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="card space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">Nuevo usuario</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nombre *</label>
              <input className="input" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
            </div>
            <div>
              <label className="label">Contraseña *</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
            </div>
            <div>
              <label className="label">Rol</label>
              <select className="input" value={form.rol} onChange={e => setForm(f => ({...f, rol: e.target.value}))}>
                <option value="admin">Admin</option>
                <option value="tecnico">Técnico</option>
              </select>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="btn-primary btn" disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Crear usuario'}
          </button>
        </form>
      )}

      {loading ? (
        <Spinner size="lg" className="py-12" />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700/50 text-slate-400 text-xs uppercase tracking-wide">
                <th className="table-cell text-left">Nombre</th>
                <th className="table-cell text-left">Email</th>
                <th className="table-cell text-left">Rol</th>
                <th className="table-cell text-left">Contraseña</th>
                <th className="table-cell w-24" />
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <UserRow key={u.id} user={u} onUpdate={handleUpdate} onDelete={handleDelete} currentUserId={currentUser?.id} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
