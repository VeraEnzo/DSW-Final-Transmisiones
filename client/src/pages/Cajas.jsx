import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import BadgeEstado from '../components/BadgeEstado';
import ToastContainer from '../components/Toast';
import { useToast } from '../hooks/useToast';

function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export default function Cajas() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toasts, toast } = useToast();
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');

  const fetchCajas = useCallback(
    debounce(async (q, t) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set('numero_serie', q);
      if (t) params.set('tipo_vehiculo', t);
      const { data } = await api.get(`/cajas?${params}`);
      setCajas(data.data);
      setLoading(false);
    }, 400),
    []
  );

  useEffect(() => { fetchCajas(search, tipo); }, [search, tipo]);
  const toastShown = useRef(false);
  useEffect(() => {
    if (location.state?.toast && !toastShown.current) {
      toastShown.current = true;
      toast.success(location.state.toast);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <ToastContainer toasts={toasts} />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">Cajas</h2>
        <Link to="/cajas/nueva" className="btn-primary btn text-sm">+ Nueva caja</Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          className="input flex-1 min-w-[200px]"
          placeholder="Buscar por número de serie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input w-40" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="camion">Camión</option>
          <option value="colectivo">Colectivo</option>
          <option value="tractor">Tractor</option>
          <option value="pulverizadora">Pulverizadora</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      {loading ? (
        <Spinner size="lg" className="py-12" />
      ) : cajas.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400">No se encontraron cajas</p>
          <Link to="/cajas/nueva" className="btn-primary btn mt-3 inline-flex">Crear primera caja</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {cajas.map((c) => (
            <Link
              key={c.id}
              to={`/cajas/${c.id}`}
              className="card flex items-center justify-between hover:border-slate-600 hover:bg-slate-700/50 transition-colors block"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sky-400 font-semibold">{c.numero_serie}</span>
                  <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded capitalize">{c.tipo_vehiculo || 'N/A'}</span>
                  {c.ultimo_estado && <BadgeEstado estado={c.ultimo_estado} />}
                </div>
                <p className="text-sm text-slate-300 mt-0.5">
                  {[c.marca, c.modelo].filter(Boolean).join(' ')}
                  {c.cliente_nombre && <span className="text-slate-400"> · {c.cliente_nombre}</span>}
                  {c.cliente_empresa && <span className="text-slate-500"> ({c.cliente_empresa})</span>}
                </p>
              </div>
              <div className="text-right ml-4 shrink-0">
                <p className="text-xs text-slate-500">{c.total_reparaciones} rep.</p>
                <span className="text-slate-500 text-lg">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
