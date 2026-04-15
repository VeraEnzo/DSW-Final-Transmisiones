import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import BadgeEstado from '../components/BadgeEstado';
import ToastContainer from '../components/Toast';
import { useToast } from '../hooks/useToast';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('es-AR');
}

export default function CajaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { toasts, toast } = useToast();
  const [caja, setCaja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toastShown = useRef(false);
  useEffect(() => {
    if (location.state?.toast && !toastShown.current) {
      toastShown.current = true;
      toast.success(location.state.toast);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  useEffect(() => {
    api.get(`/cajas/${id}`).then(({ data }) => {
      setCaja(data.data);
      setForm({
        numero_serie: data.data.numero_serie || '',
        tipo_vehiculo: data.data.tipo_vehiculo || 'camion',
        marca: data.data.marca || '',
        modelo: data.data.modelo || '',
        observaciones_generales: data.data.observaciones_generales || '',
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/cajas/${id}`);
      navigate('/cajas', { replace: true, state: { toast: 'Caja eliminada correctamente' } });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar');
      setConfirmDelete(false);
    } finally { setDeleting(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/cajas/${id}`, form);
      setCaja(c => ({ ...c, ...data.data }));
      setEditing(false);
      toast.success('Caja actualizada correctamente');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!caja) return <p className="text-slate-400 text-center py-20">Caja no encontrada</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ToastContainer toasts={toasts} />
      {confirmDelete && (
        <ConfirmModal
          title={`¿Eliminar caja "${caja.numero_serie}"?`}
          message="Esta acción no se puede deshacer. Solo es posible si la caja no tiene reparaciones asociadas."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
          loading={deleting}
        />
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate(-1)} className="btn-ghost btn text-sm">← Volver</button>
        <h2 className="text-xl font-bold text-sky-400 font-mono flex-1">{caja.numero_serie}</h2>
        {!editing && (
          <>
            <button className="btn-secondary btn text-sm" onClick={() => setEditing(true)}>✏ Editar</button>
            {isAdmin && (
              <button className="btn text-sm bg-red-700 hover:bg-red-600 text-white" onClick={() => setConfirmDelete(true)}>
                Eliminar
              </button>
            )}
            <Link to={`/cajas/${id}/reparacion/nueva`} className="btn-primary btn text-sm">
              + Nueva reparación
            </Link>
          </>
        )}
      </div>

      {/* Info de la caja */}
      <div className="card space-y-4">
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Número de serie *</label>
                <input className="input font-mono" value={form.numero_serie}
                  onChange={e => setForm(f => ({...f, numero_serie: e.target.value}))} />
              </div>
              <div>
                <label className="label">Tipo de vehículo</label>
                <select className="input" value={form.tipo_vehiculo}
                  onChange={e => setForm(f => ({...f, tipo_vehiculo: e.target.value}))}>
                  <option value="camion">Camión</option>
                  <option value="colectivo">Colectivo</option>
                  <option value="tractor">Tractor</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="label">Marca</label>
                <input className="input" placeholder="ZF, Allison, Voith..." value={form.marca}
                  onChange={e => setForm(f => ({...f, marca: e.target.value}))} />
              </div>
              <div>
                <label className="label">Modelo</label>
                <input className="input" placeholder="6HP600, 3000 Series..." value={form.modelo}
                  onChange={e => setForm(f => ({...f, modelo: e.target.value}))} />
              </div>
            </div>
            <div>
              <label className="label">Observaciones generales</label>
              <textarea className="input min-h-[80px] resize-none" value={form.observaciones_generales}
                onChange={e => setForm(f => ({...f, observaciones_generales: e.target.value}))} />
            </div>
            <div className="flex gap-2">
              <button className="btn-primary btn" onClick={handleSave} disabled={saving}>
                {saving ? <Spinner size="sm" /> : '✓ Guardar'}
              </button>
              <button className="btn-ghost btn" onClick={() => setEditing(false)}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                <Link to={`/clientes/${caja.id_cliente}`} className="text-sky-400 hover:underline text-sm">
                  {caja.cliente_nombre}
                </Link>
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