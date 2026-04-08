import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import BadgeEstado from '../components/BadgeEstado';
import SelectorEstado from '../components/SelectorEstado';
import TablaPresupuesto from '../components/TablaPresupuesto';
import ListaItemsReparados from '../components/ListaItemsReparados';
import GaleriaFotos from '../components/GaleriaFotos';
import { useAuth } from '../contexts/AuthContext';

const TABS = ['Datos', 'Presupuesto', 'Trabajos', 'Fotos'];

function Field({ label, value }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="text-slate-200 text-sm">{value || '-'}</p>
    </div>
  );
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('es-AR');
}

export default function ReparacionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [rep, setRep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [stateLoading, setStateLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get(`/reparaciones/${id}`).then(({ data }) => {
      setRep(data.data);
      setEditForm({
        falla_declarada: data.data.falla_declarada || '',
        diagnostico_tecnico: data.data.diagnostico_tecnico || '',
        tecnico: data.data.tecnico || '',
        fecha_ingreso: data.data.fecha_ingreso?.split('T')[0] || '',
        fecha_egreso: data.data.fecha_egreso?.split('T')[0] || '',
        observaciones_finales: data.data.observaciones_finales || '',
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/reparaciones/${id}`, editForm);
      setRep((r) => ({ ...r, ...data.data }));
      setEditing(false);
      showToast('Guardado correctamente');
    } catch { showToast('Error al guardar'); }
    finally { setSaving(false); }
  };

  const cambiarEstado = async (nuevoEstado) => {
    setStateLoading(true);
    try {
      const { data } = await api.put(`/reparaciones/${id}`, { estado: nuevoEstado });
      setRep((r) => ({ ...r, estado: data.data.estado }));
      showToast(`Estado cambiado a ${nuevoEstado}`);
    } catch { showToast('Error al cambiar estado'); }
    finally { setStateLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta reparación? Esta acción no se puede deshacer.')) return;
    await api.delete(`/reparaciones/${id}`);
    navigate(-1);
  };

  const downloadPDF = () => {
    const token = localStorage.getItem('token');
    const a = document.createElement('a');
    a.href = `/api/reparaciones/${id}/presupuesto/pdf`;
    a.download = `presupuesto-${id}.pdf`;
    // Use fetch to include auth header
    fetch(`/api/reparaciones/${id}/presupuesto/pdf`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
  };

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!rep) return <p className="text-slate-400 text-center py-20">Reparación no encontrada</p>;

  const isEditable = !['entregada', 'rechazada'].includes(rep.estado);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost btn text-sm">← Volver</button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">Rep. #{rep.id}</h2>
              <BadgeEstado estado={rep.estado} size="lg" />
            </div>
            <Link to={`/cajas/${rep.id_caja}`} className="text-sky-400 font-mono text-sm hover:underline">
              {rep.numero_serie}
            </Link>
            {rep.marca && <span className="text-slate-400 text-sm"> · {rep.marca} {rep.modelo}</span>}
          </div>
        </div>
        {isAdmin && (
          <button className="btn-danger btn text-xs" onClick={handleDelete}>🗑 Eliminar</button>
        )}
      </div>

      {/* Estado selector */}
      <div className="card">
        <p className="label mb-2">Estado de la reparación</p>
        <SelectorEstado estado={rep.estado} onCambio={cambiarEstado} loading={stateLoading} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-700">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === i ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
            {t === 'Fotos' && rep.fotos?.length > 0 && (
              <span className="ml-1 text-xs bg-slate-700 rounded-full px-1.5">{rep.fotos.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Datos */}
      {tab === 0 && (
        <div className="card space-y-4">
          <div className="flex justify-end">
            {isEditable && !editing && (
              <button className="btn-secondary btn text-sm" onClick={() => setEditing(true)}>✏ Editar</button>
            )}
            {editing && (
              <div className="flex gap-2">
                <button className="btn-primary btn text-sm" onClick={saveEdit} disabled={saving}>
                  {saving ? <Spinner size="sm" /> : '✓ Guardar'}
                </button>
                <button className="btn-ghost btn text-sm" onClick={() => setEditing(false)}>Cancelar</button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Fecha ingreso</label>
                  <input type="date" className="input" value={editForm.fecha_ingreso}
                    onChange={e => setEditForm(f => ({...f, fecha_ingreso: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Fecha egreso</label>
                  <input type="date" className="input" value={editForm.fecha_egreso}
                    onChange={e => setEditForm(f => ({...f, fecha_egreso: e.target.value}))} />
                </div>
              </div>
              <div>
                <label className="label">Técnico</label>
                <input className="input" value={editForm.tecnico}
                  onChange={e => setEditForm(f => ({...f, tecnico: e.target.value}))} />
              </div>
              <div>
                <label className="label">Falla declarada</label>
                <textarea className="input min-h-[80px] resize-none" value={editForm.falla_declarada}
                  onChange={e => setEditForm(f => ({...f, falla_declarada: e.target.value}))} />
              </div>
              <div>
                <label className="label">Diagnóstico técnico</label>
                <textarea className="input min-h-[80px] resize-none" value={editForm.diagnostico_tecnico}
                  onChange={e => setEditForm(f => ({...f, diagnostico_tecnico: e.target.value}))} />
              </div>
              <div>
                <label className="label">Observaciones finales</label>
                <textarea className="input min-h-[80px] resize-none" value={editForm.observaciones_finales}
                  onChange={e => setEditForm(f => ({...f, observaciones_finales: e.target.value}))} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Fecha ingreso" value={formatDate(rep.fecha_ingreso)} />
              <Field label="Fecha egreso" value={formatDate(rep.fecha_egreso)} />
              <Field label="Técnico" value={rep.tecnico} />
              <div className="col-span-full">
                <Field label="Falla declarada" value={rep.falla_declarada} />
              </div>
              <div className="col-span-full">
                <Field label="Diagnóstico técnico" value={rep.diagnostico_tecnico} />
              </div>
              {rep.observaciones_finales && (
                <div className="col-span-full">
                  <Field label="Observaciones finales" value={rep.observaciones_finales} />
                </div>
              )}
              {rep.cliente_nombre && (
                <>
                  <div className="col-span-full border-t border-slate-700 pt-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Cliente</p>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Nombre" value={rep.cliente_nombre} />
                      {rep.cliente_empresa && <Field label="Empresa" value={rep.cliente_empresa} />}
                      {rep.cliente_telefono && <Field label="Teléfono" value={rep.cliente_telefono} />}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Presupuesto */}
      {tab === 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-300 font-medium">Ítems del presupuesto</h3>
            {rep.estado === 'ingresada' && (
              <button
                className="btn-primary btn text-sm"
                onClick={() => cambiarEstado('presupuestada')}
                disabled={stateLoading}
              >
                → Marcar como presupuestada
              </button>
            )}
          </div>
          <TablaPresupuesto
            reparacionId={id}
            items={rep.items_presupuesto}
            editable={isEditable}
            onPDF={downloadPDF}
          />
        </div>
      )}

      {/* Tab: Trabajos */}
      {tab === 2 && (
        <div className="space-y-3">
          <h3 className="text-slate-300 font-medium">Trabajos realizados</h3>
          {rep.estado !== 'aprobada' && rep.estado !== 'terminada' && (
            <p className="text-sm text-slate-500 bg-slate-800 rounded-lg px-3 py-2">
              Los trabajos se pueden registrar cuando la reparación está aprobada o terminada.
            </p>
          )}
          <ListaItemsReparados
            reparacionId={id}
            items={rep.items_reparados}
            editable={rep.estado === 'aprobada' || rep.estado === 'terminada'}
          />
        </div>
      )}

      {/* Tab: Fotos */}
      {tab === 3 && (
        <div className="space-y-3">
          <h3 className="text-slate-300 font-medium">Fotos</h3>
          <GaleriaFotos
            reparacionId={id}
            fotos={rep.fotos}
            editable={isEditable}
          />
        </div>
      )}
    </div>
  );
}
