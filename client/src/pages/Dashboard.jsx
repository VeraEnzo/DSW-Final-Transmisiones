import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import BadgeEstado from '../components/BadgeEstado';

function StatCard({ label, count, color, children }) {
  return (
    <div className={`card border-l-4 ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        <span className="text-2xl font-bold text-slate-100">{count}</span>
      </div>
      {children}
    </div>
  );
}

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
      <div className="text-right">
        <p className="text-xs text-slate-500">#{rep.id}</p>
        <p className="text-xs text-slate-500">{rep.tecnico}</p>
      </div>
    </Link>
  );
}

function Section({ title, items, emptyMsg }) {
  if (!items.length) return null;
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 pt-2">{title}</h3>
      {items.map((r) => <ReparacionRow key={r.id} rep={r} />)}
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

  const { counts, ingresadas, presupuestadas, aprobadas, terminadas } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">Dashboard</h2>
        <Link to="/cajas/nueva" className="btn-primary btn text-sm">+ Nueva caja</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Sin presupuesto" count={counts.ingresada} color="border-blue-500" />
        <StatCard label="Esperando aprobación" count={counts.presupuestada} color="border-yellow-500" />
        <StatCard label="En reparación" count={counts.aprobada} color="border-orange-500" />
        <StatCard label="Listas p/ entregar" count={counts.terminada} color="border-emerald-500" />
      </div>

      {/* Lists per state */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card space-y-1">
          <h3 className="font-semibold text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Sin presupuesto ({counts.ingresada})
          </h3>
          <Section items={ingresadas} emptyMsg="Sin cajas ingresadas" />
          {!ingresadas.length && <p className="text-slate-500 text-sm text-center py-4">Sin entradas</p>}
        </div>

        <div className="card space-y-1">
          <h3 className="font-semibold text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
            Esperando aprobación ({counts.presupuestada})
          </h3>
          <Section items={presupuestadas} emptyMsg="" />
          {!presupuestadas.length && <p className="text-slate-500 text-sm text-center py-4">Sin entradas</p>}
        </div>

        <div className="card space-y-1">
          <h3 className="font-semibold text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
            En reparación ({counts.aprobada})
          </h3>
          <Section items={aprobadas} emptyMsg="" />
          {!aprobadas.length && <p className="text-slate-500 text-sm text-center py-4">Sin entradas</p>}
        </div>

        <div className="card space-y-1">
          <h3 className="font-semibold text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Listas para entregar ({counts.terminada})
          </h3>
          <Section items={terminadas} emptyMsg="" />
          {!terminadas.length && <p className="text-slate-500 text-sm text-center py-4">Sin entradas</p>}
        </div>
      </div>
    </div>
  );
}
