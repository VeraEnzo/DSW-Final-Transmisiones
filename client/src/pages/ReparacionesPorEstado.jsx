import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import BadgeEstado from '../components/BadgeEstado';

const LABELS = {
  ingresada:     'Sin presupuesto',
  presupuestada: 'Esperando aprobación',
  aprobada:      'En reparación',
  terminada:     'Listas para entregar',
  entregada:     'Entregadas',
  rechazada:     'Rechazadas',
};

const DOT_COLORS = {
  ingresada:     'bg-blue-500',
  presupuestada: 'bg-yellow-500',
  aprobada:      'bg-orange-500',
  terminada:     'bg-emerald-500',
  entregada:     'bg-slate-500',
  rechazada:     'bg-red-500',
};

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('es-AR');
}

export default function ReparacionesPorEstado() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const estado = searchParams.get('estado') || 'ingresada';

  const [reparaciones, setReparaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/reparaciones/por-estado?estado=${estado}`)
      .then(({ data }) => setReparaciones(data.data))
      .finally(() => setLoading(false));
  }, [estado]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="btn-ghost btn text-sm">← Volver</button>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full inline-block ${DOT_COLORS[estado]}`} />
          <h2 className="text-xl font-bold text-slate-100">{LABELS[estado]}</h2>
          <span className="text-slate-500 text-sm">({reparaciones.length})</span>
        </div>
      </div>

      {/* Filtro rápido de estados */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.entries(LABELS).map(([key, label]) => (
          <Link
            key={key}
            to={`/reparaciones/lista?estado=${key}`}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              estado === key
                ? 'bg-sky-600 border-sky-500 text-white'
                : 'border-slate-600 text-slate-400 hover:border-slate-400'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {loading ? (
        <Spinner size="lg" className="py-12" />
      ) : reparaciones.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400">No hay reparaciones en este estado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reparaciones.map((r) => (
            <Link
              key={r.id}
              to={`/reparaciones/${r.id}`}
              className="card flex items-center justify-between hover:border-slate-600 hover:bg-slate-700/50 transition-colors block"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sky-400 text-sm">#{r.id}</span>
                  <span className="font-mono text-sky-300 text-sm">{r.numero_serie}</span>
                  <BadgeEstado estado={r.estado} />
                </div>
                <p className="text-sm text-slate-300 mt-0.5">
                  {[r.marca, r.modelo].filter(Boolean).join(' ')}
                  {r.cliente_nombre && <span className="text-slate-400"> · {r.cliente_nombre}</span>}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ingreso: {formatDate(r.fecha_ingreso)}
                  {r.tecnico && ` · ${r.tecnico}`}
                </p>
              </div>
              <span className="text-slate-500 text-lg ml-3">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}