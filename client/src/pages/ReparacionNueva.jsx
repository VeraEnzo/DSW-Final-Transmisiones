import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import { useAuth } from '../contexts/AuthContext';

export default function ReparacionNueva() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caja, setCaja] = useState(null);
  const [form, setForm] = useState({
    fecha_ingreso: new Date().toISOString().split('T')[0],
    tecnico: user?.nombre || '',
    falla_declarada: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/cajas/${id}`).then(({ data }) => setCaja(data.data));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post('/reparaciones', { ...form, id_caja: parseInt(id) });
      navigate(`/reparaciones/${data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la reparación');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost btn text-sm">← Volver</button>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Nueva Reparación</h2>
          {caja && <p className="text-sm text-sky-400 font-mono">{caja.numero_serie}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Fecha de ingreso</label>
          <input type="date" className="input" value={form.fecha_ingreso}
            onChange={e => setForm(f => ({...f, fecha_ingreso: e.target.value}))} required />
        </div>

        <div>
          <label className="label">Técnico a cargo</label>
          <input className="input" placeholder="Nombre del técnico" value={form.tecnico}
            onChange={e => setForm(f => ({...f, tecnico: e.target.value}))} />
        </div>

        <div>
          <label className="label">Falla declarada por el cliente</label>
          <textarea className="input min-h-[100px] resize-none" placeholder="Descripción del problema según el cliente..."
            value={form.falla_declarada}
            onChange={e => setForm(f => ({...f, falla_declarada: e.target.value}))} />
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/30 rounded px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary btn flex-1" disabled={saving}>
            {saving ? <><Spinner size="sm" /> Creando...</> : 'Iniciar reparación'}
          </button>
          <button type="button" className="btn-secondary btn" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
