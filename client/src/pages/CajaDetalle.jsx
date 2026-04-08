import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import BadgeEstado from '../components/BadgeEstado';

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('es-AR');
}

export default function CajaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caja, setCaja] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/cajas/${id}`).then(({ data }) => setCaja(data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!caja) return <p className="text-slate-400 text-center py-20">Caja no encontrada</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate(-1)} className="btn-ghost btn text-sm">← Volver</button>
        <h2 className="text-xl font-bold text-sky-400 font-mono flex-1">{caja.numero_serie}</h2>
        <Link to={`/cajas/${id}/reparacion/nueva`} className="btn-primary btn text-sm">
          + Nueva reparación
        </Link>
      </div>

      {/* Info de la caja */}
      <div className="card grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="label">Tipo</p>
          <p className="text-slate-200 capitalize">{caja.tipo_vehiculo || '-'}</p>
        </div>
        <div>
          <p className="label">Marca</p>
          <p className="text-slate-200">{caja.marca || '-'}</p>
        </div>
        <div>
          <p className="label">Modelo</p>
          <p className="text-slate-200">{caja.modelo || '-'}</p>
        </div>
        {caja.cliente_nombre && (
          <div>
            <p className="label">Cliente</p>
            <p className="text-slate-200">{caja.cliente_nombre}</p>
            {caja.cliente_empresa && <p className="text-xs text-slate-400">{caja.cliente_empresa}</p>}
          </div>
        )}
        {caja.cliente_telefono && (
          <div>
            <p className="label">Teléfono</p>
            <p className="text-slate-200">{caja.cliente_telefono}</p>
          </div>
        )}
        {caja.observaciones_generales && (
          <div className="col-span-full">
            <p className="label">Observaciones</p>
            <p className="text-slate-300 text-sm">{caja.observaciones_generales}</p>
          </div>
        )}
      </div>

      {/* Historial de reparaciones */}
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-3">
          Historial de reparaciones ({caja.reparaciones?.length || 0})
        </h3>

        {!caja.reparaciones?.length ? (
          <div className="card text-center py-8">
            <p className="text-slate-400">Sin reparaciones registradas</p>
            <Link to={`/cajas/${id}/reparacion/nueva`} className="btn-primary btn mt-3 inline-flex">
              Iniciar primera reparación
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {caja.reparaciones.map((r) => (
              <Link
                key={r.id}
                to={`/reparaciones/${r.id}`}
                className="card flex items-center justify-between hover:border-slate-600 hover:bg-slate-700/50 transition-colors block"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-200">Rep. #{r.id}</span>
                    <BadgeEstado estado={r.estado} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Ingreso: {formatDate(r.fecha_ingreso)}
                    {r.tecnico && ` · ${r.tecnico}`}
                  </p>
                  {r.falla_declarada && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-sm">{r.falla_declarada}</p>
                  )}
                </div>
                <span className="text-slate-500 text-lg ml-4">›</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
