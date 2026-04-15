import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import ToastContainer from '../components/Toast';
import { useToast } from '../hooks/useToast';

function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export default function Clientes() {
  const { toasts, toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nombre: '', empresa: '', telefono: '', email: '', cuit: '' });
  const [saving, setSaving] = useState(false);

  const fetchClientes = useCallback(
    debounce(async (q) => {
      setLoading(true);
      const { data } = await api.get(`/clientes?search=${encodeURIComponent(q)}`);
      setClientes(data.data);
      setLoading(false);
    }, 400), []
  );

  useEffect(() => { fetchClientes(search); }, [search]);
  const toastShown = useRef(false);
  useEffect(() => {
    if (location.state?.toast && !toastShown.current) {
      toastShown.current = true;
      toast.success(location.state.toast);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post('/clientes', form);
      setClientes((p) => [data.data, ...p]);
      setForm({ nombre: '', empresa: '', telefono: '', email: '', cuit: '' });
      setCreating(false);
      toast.success('Cliente creado correctamente');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <ToastContainer toasts={toasts} />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">Clientes</h2>
        <button className="btn-primary btn text-sm" onClick={() => setCreating(!creating)}>
          {creating ? 'Cancelar' : '+ Nuevo cliente'}
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="card space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">Nuevo cliente</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nombre *</label>
              <input className="input" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} required />
            </div>
            <div>
              <label className="label">Empresa</label>
              <input className="input" value={form.empresa} onChange={e => setForm(f => ({...f, empresa: e.target.value}))} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input className="input" value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
            </div>
            <div>
              <label className="label">CUIT</label>
              <input className="input" placeholder="30-12345678-9" value={form.cuit} onChange={e => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                let formatted = digits;
                if (digits.length > 2) formatted = digits.slice(0,2) + '-' + digits.slice(2);
                if (digits.length > 10) formatted = digits.slice(0,2) + '-' + digits.slice(2,10) + '-' + digits.slice(10);
                setForm(f => ({...f, cuit: formatted}));
              }} />
            </div>
          </div>
          <button type="submit" className="btn-primary btn" disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Crear cliente'}
          </button>
        </form>
      )}

      <input
        className="input"
        placeholder="Buscar por nombre o empresa..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <Spinner size="lg" className="py-12" />
      ) : clientes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400">No se encontraron clientes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clientes.map((c) => (
            <Link
              key={c.id}
              to={`/clientes/${c.id}`}
              className="card flex items-center justify-between hover:border-slate-600 hover:bg-slate-700/50 transition-colors block"
            >
              <div>
                <p className="font-medium text-slate-200">{c.nombre}</p>
                {c.empresa && <p className="text-sm text-slate-400">{c.empresa}</p>}
                <div className="flex gap-3 mt-0.5">
                  {c.telefono && <span className="text-xs text-slate-500">{c.telefono}</span>}
                  {c.email && <span className="text-xs text-slate-500">{c.email}</span>}
                </div>
              </div>
              <span className="text-slate-500 text-lg">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
