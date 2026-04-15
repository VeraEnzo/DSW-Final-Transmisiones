import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import BadgeEstado from '../components/BadgeEstado';
import ConfirmModal from '../components/ConfirmModal';
import ToastContainer from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toasts, toast } = useToast();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/clientes/${id}`).then(({ data }) => {
      setCliente(data.data);
      setForm({ nombre: data.data.nombre, empresa: data.data.empresa || '', telefono: data.data.telefono || '', email: data.data.email || '', cuit: data.data.cuit || '' });
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/clientes/${id}`, form);
      setCliente((c) => ({ ...c, ...data.data }));
      setEditing(false);
      toast.success('Cliente actualizado correctamente');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/clientes/${id}`);
      navigate('/clientes', { replace: true, state: { toast: 'Cliente eliminado correctamente' } });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar');
      setConfirmDelete(false);
    } finally { setDeleting(false); }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!cliente) return <p className="text-slate-400 text-center py-20">Cliente no encontrado</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ToastContainer toasts={toasts} />
      {confirmDelete && (
        <ConfirmModal
          title={`¿Eliminar cliente "${cliente.nombre}"?`}
          message="Esta acción no se puede deshacer. Solo es posible si el cliente no tiene cajas asociadas."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
          loading={deleting}
        />
      )}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate(-1)} className="btn-ghost btn text-sm">← Volver</button>
        <h2 className="text-xl font-bold text-slate-100 flex-1">{cliente.nombre}</h2>
        {!editing && <button className="btn-secondary btn text-sm" onClick={() => setEditing(true)}>✏ Editar</button>}
        {!editing && isAdmin && (
          <button className="btn text-sm bg-red-700 hover:bg-red-600 text-white" onClick={() => setConfirmDelete(true)}>
            Eliminar
          </button>
        )}
      </div>

      <div className="card space-y-4">
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre *</label>
                <input className="input" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} />
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
            <div className="flex gap-2">
              <button className="btn-primary btn" onClick={handleSave} disabled={saving}>
                {saving ? <Spinner size="sm" /> : '✓ Guardar'}
              </button>
              <button className="btn-ghost btn" onClick={() => setEditing(false)}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="label">Nombre</p>
              <p className="text-slate-200">{cliente.nombre}</p>
            </div>
            {cliente.empresa && <div>
              <p className="label">Empresa</p>
              <p className="text-slate-200">{cliente.empresa}</p>
            </div>}
            {cliente.telefono && <div>
              <p className="label">Teléfono</p>
              <p className="text-slate-200">{cliente.telefono}</p>
            </div>}
            {cliente.email && <div>
              <p className="label">Email</p>
              <p className="text-slate-200">{cliente.email}</p>
            </div>}
            {cliente.cuit && <div>
              <p className="label">CUIT</p>
              <p className="text-slate-200">{cliente.cuit}</p>
            </div>}
          </div>
        )}
      </div>

      {/* Cajas del cliente */}
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-3">
          Cajas ({cliente.cajas?.length || 0})
        </h3>
        {!cliente.cajas?.length ? (
          <div className="card text-center py-8">
            <p className="text-slate-400">Sin cajas registradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cliente.cajas.map((c) => (
              <Link key={c.id} to={`/cajas/${c.id}`}
                className="card flex items-center justify-between hover:border-slate-600 hover:bg-slate-700/50 transition-colors block">
                <div>
                  <p className="font-mono text-sky-400">{c.numero_serie}</p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {[c.marca, c.modelo, c.tipo_vehiculo].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.total_reparaciones} reparaciones</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.ultimo_estado && <BadgeEstado estado={c.ultimo_estado} />}
                  <span className="text-slate-500 text-lg">›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
