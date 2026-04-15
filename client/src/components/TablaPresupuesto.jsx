import { useState } from 'react';
import api from '../api/axios';
import Spinner from './Spinner';
import ConfirmModal from './ConfirmModal';

function fmtCurrency(val) {
  const n = parseFloat(val) || 0;
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 });
}

function ItemRow({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    descripcion: item.descripcion,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    observacion: item.observacion || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onUpdate(item.id, {
        ...form,
        cantidad: parseInt(form.cantidad),
        precio_unitario: parseFloat(form.precio_unitario),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <tr className="bg-slate-700/50">
        <td className="table-cell">
          <input className="input text-xs" value={form.descripcion} onChange={e => setForm(f => ({...f, descripcion: e.target.value}))} />
        </td>
        <td className="table-cell w-20">
          <input className="input text-xs w-16" type="number" min="1" value={form.cantidad} onChange={e => setForm(f => ({...f, cantidad: e.target.value}))} />
        </td>
        <td className="table-cell w-32">
          <input className="input text-xs w-28" type="number" min="0" step="0.01" value={form.precio_unitario} onChange={e => setForm(f => ({...f, precio_unitario: e.target.value}))} />
        </td>
        <td className="table-cell w-24 text-right">{fmtCurrency((form.precio_unitario||0)*(form.cantidad||1))}</td>
        <td className="table-cell w-24">
          <div className="flex gap-1">
            <button className="btn-primary btn text-xs px-2 py-1" onClick={save} disabled={saving}>
              {saving ? <Spinner size="sm" /> : '✓'}
            </button>
            <button className="btn-ghost btn text-xs px-2 py-1" onClick={() => setEditing(false)}>✕</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
      <td className="table-cell text-slate-200">{item.descripcion}</td>
      <td className="table-cell text-center text-slate-300">{item.cantidad}</td>
      <td className="table-cell text-right text-slate-300">{fmtCurrency(item.precio_unitario)}</td>
      <td className="table-cell text-right font-medium text-slate-200">
        {fmtCurrency((parseFloat(item.precio_unitario)||0) * (item.cantidad||1))}
      </td>
      <td className="table-cell">
        <div className="flex gap-1 justify-end">
          <button className="btn-ghost btn text-xs px-2 py-1" onClick={() => setEditing(true)}>✏</button>
          <button className="btn-danger btn text-xs px-2 py-1" onClick={() => onDelete(item.id)}>✕</button>
        </div>
      </td>
    </tr>
  );
}

function AddRow({ reparacionId, onAdded }) {
  const [form, setForm] = useState({ descripcion: '', cantidad: 1, precio_unitario: '', observacion: '' });
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const save = async () => {
    if (!form.descripcion.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/reparaciones/${reparacionId}/presupuesto`, {
        ...form,
        cantidad: parseInt(form.cantidad),
        precio_unitario: parseFloat(form.precio_unitario) || 0,
      });
      onAdded(data.data);
      setForm({ descripcion: '', cantidad: 1, precio_unitario: '', observacion: '' });
      setOpen(false);
    } finally { setSaving(false); }
  };

  if (!open) {
    return (
      <tr>
        <td colSpan={5} className="table-cell">
          <button className="btn-ghost btn text-sm w-full justify-start" onClick={() => setOpen(true)}>
            + Agregar ítem
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-slate-700/30">
      <td className="table-cell">
        <input className="input text-xs" placeholder="Descripción..." value={form.descripcion} onChange={e => setForm(f => ({...f, descripcion: e.target.value}))} />
      </td>
      <td className="table-cell w-20">
        <input className="input text-xs w-16" type="number" min="1" value={form.cantidad} onChange={e => setForm(f => ({...f, cantidad: e.target.value}))} />
      </td>
      <td className="table-cell w-32">
        <input className="input text-xs w-28" type="number" min="0" step="0.01" placeholder="0.00" value={form.precio_unitario} onChange={e => setForm(f => ({...f, precio_unitario: e.target.value}))} />
      </td>
      <td className="table-cell w-24 text-right text-slate-400">
        {fmtCurrency((form.precio_unitario||0)*(form.cantidad||1))}
      </td>
      <td className="table-cell">
        <div className="flex gap-1">
          <button className="btn-primary btn text-xs px-2 py-1" onClick={save} disabled={saving}>
            {saving ? <Spinner size="sm" /> : '✓'}
          </button>
          <button className="btn-ghost btn text-xs px-2 py-1" onClick={() => setOpen(false)}>✕</button>
        </div>
      </td>
    </tr>
  );
}

export default function TablaPresupuesto({ reparacionId, items: initialItems, editable = true, onPDF }) {
  const [items, setItems] = useState(initialItems || []);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const total = items.reduce((sum, item) => sum + (parseFloat(item.precio_unitario) || 0) * (item.cantidad || 1), 0);

  const handleUpdate = async (id, data) => {
    const { data: res } = await api.put(`/presupuesto/${id}`, data);
    setItems((prev) => prev.map((i) => (i.id === id ? res.data : i)));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/presupuesto/${confirmId}`);
      setItems((prev) => prev.filter((i) => i.id !== confirmId));
      setConfirmId(null);
    } finally { setDeleting(false); }
  };

  return (
    <div>
      {confirmId && (
        <ConfirmModal
          title="¿Eliminar ítem?"
          message="Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
          loading={deleting}
        />
      )}
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700/50 text-slate-400 text-xs uppercase tracking-wide">
              <th className="table-cell text-left">Descripción</th>
              <th className="table-cell text-center w-16">Cant.</th>
              <th className="table-cell text-right w-28">P. Unit.</th>
              <th className="table-cell text-right w-24">Subtotal</th>
              {editable && <th className="table-cell w-20" />}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              editable
                ? <ItemRow key={item.id} item={item} onUpdate={handleUpdate} onDelete={(id) => setConfirmId(id)} />
                : (
                  <tr key={item.id} className="border-b border-slate-700">
                    <td className="table-cell">{item.descripcion}</td>
                    <td className="table-cell text-center">{item.cantidad}</td>
                    <td className="table-cell text-right">{fmtCurrency(item.precio_unitario)}</td>
                    <td className="table-cell text-right">{fmtCurrency((parseFloat(item.precio_unitario)||0)*(item.cantidad||1))}</td>
                  </tr>
                )
            ))}
            {editable && <AddRow reparacionId={reparacionId} onAdded={(item) => setItems((p) => [...p, item])} />}
          </tbody>
          <tfoot>
            <tr className="bg-slate-700/50 font-bold">
              <td className="table-cell text-right" colSpan={editable ? 3 : 2}>TOTAL</td>
              <td className="table-cell text-right text-sky-400 text-base">{fmtCurrency(total)}</td>
              {editable && <td />}
            </tr>
          </tfoot>
        </table>
      </div>
      {onPDF && (
        <button className="btn-secondary btn mt-3" onClick={onPDF}>
          📄 Generar PDF del presupuesto
        </button>
      )}
    </div>
  );
}
