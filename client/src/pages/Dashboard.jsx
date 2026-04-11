import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const LIMITE = 4;

const SECCIONES = [
  { key: 'ingresadas',     estado: 'ingresada',     label: 'Sin presupuesto',       dot: 'bg-blue-500',    countKey: 'ingresada' },
  { key: 'presupuestadas', estado: 'presupuestada', label: 'Esperando aprobación',  dot: 'bg-yellow-500',  countKey: 'presupuestada' },
  { key: 'aprobadas',      estado: 'aprobada',      label: 'En reparación',         dot: 'bg-orange-500',  countKey: 'aprobada' },
  { key: 'terminadas',     estado: 'terminada',     label: 'Listas para entregar',  dot: 'bg-emerald-500', countKey: 'terminada' },
];

function ReparacionRow({ rep }) {
  return (
    <Link
      to={`/reparaciones/${rep.id}`}
      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-700 transition-colors"
    >
      <div>
        <p className="text-sm font-mono text-sky-400">{rep.numero_serie}</p>
        <p className="text-xs text-slate-400">
          {[rep.marca, rep.modelo].filter(Boolean).join(' ')}
          {rep.cliente_nombre ? ` · ${rep.cliente_nombre}` : ''}
        </p>
      </div>
      <div className="text-right shrink-0 ml-2">
        <p className="text-xs text-slate-500">#{rep.id}</p>
        <p className="text-xs text-slate-500">{rep.tecnico}</p>
      </div>
    </Link>
  );
}

function SeccionCard({ label, dot, estado, count, items }) {
  const visibles = items.slice(0, LIMITE);
  const hayMas = count > LIMITE;

  return (
    <div className="card flex flex-col gap-1">
      {/* Título clicable */}
      <Link
        to={`/reparaciones/lista?estado=${estado}`}
        className="flex items-center justify-between group mb-1"
      >
        <h3 className="font-semibold text-slate-300 flex items-center gap-2 group-hover:text-sky-400 transition-colors">
          <span className={`w-2 h-2 rounded-full inline-block ${dot}`} />
          {label}
          <span className="text-slate-500 font-normal">({count})</span>
        </h3>
        <span className="text-slate-600 group-hover:text-sky-400 transition-colors text-sm">›</span>
      </Link>

      {/* Filas */}
      {visibles.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">Sin entradas</p>
      ) : (
        <>
          {visibles.map((r) => <ReparacionRow key={r.id} rep={r} />)}
          {hayMas && (
            <Link
              to={`/reparaciones/lista?estado=${estado}`}
              className="text-center text-xs text-sky-400 hover:text-sky-300 transition-colors py-2 border-t border-slate-700 mt-1"
            >
              Ver {count - LIMITE} más →
            </Link>
          )}
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => setData(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!data) return <p className="text-slate-400 text-center py-20">Error cargando dashboard</p>;

  const { counts } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">Dashboard</h2>
        <Link to="/cajas/nueva" className="btn-primary btn text-sm">+ Nueva caja</Link>
      </div>

      {/* Stat cards clicables */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SECCIONES.map((s) => (
          <Link
            key={s.estado}
            to={`/reparaciones/lista?estado=${s.estado}`}
            className={`card border-l-4 ${s.dot.replace('bg-', 'border-')} hover:bg-slate-700/50 transition-colors`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 leading-tight">{s.label}</span>
              <span className="text-2xl font-bold text-slate-100">{counts[s.countKey]}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Listas por estado */}
      <div className="grid md:grid-cols-2 gap-4">
        {SECCIONES.map((s) => (
          <SeccionCard
            key={s.estado}
            label={s.label}
            dot={s.dot}
            estado={s.estado}
            count={counts[s.countKey]}
            items={data[s.key]}
          />
        ))}
      </div>
    </div>
  );
}