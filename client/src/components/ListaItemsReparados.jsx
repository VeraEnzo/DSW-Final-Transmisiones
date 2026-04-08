import { useState } from 'react';
import api from '../api/axios';
import Spinner from './Spinner';

function ItemRow({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ descripcion: item.descripcion, cantidad: item.cantidad, observacion: item.observacion || '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onUpdate(item.id, { ...form, cantidad: parseInt(form.cantidad) });
      setEditing(false);
    } finally { setSaving(false); }
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
        <td className="table-cell">
          <input className="input text-xs" placeholder="Observación..." value={form.observacion} onChange={e => setForm(f => ({...f, observacion: e.target.value}))} />
        </td>
        <td className="table-cell">
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
    <tr className="border-b border-slate-700 hover:bg-slate-700/30">
      <td className="table-cell text-slate-200">{item.descripcion}</td>
      <td className="table-cell text-center text-slate-300">{item.cantidad}</td>
      <td className="table-cell text-slate-400 text-xs">{item.observacion}</td>
      <td className="table-cell">
        <div className="flex gap-1 justify-end">
          <button className="btn-ghost btn text-xs px-2 py-1" onClick={() => setEditing(true)}>✏</button>
          <button className="btn-danger btn text-xs px-2 py-1" onClick={() => onDelete(item.id)}>🗑</button>
        </div>
      </td>
    </tr>
  );
}

function AddRow({ reparacionId, onAdded }) {
  const [form, setForm] = useState({ descripcion: '', cantidad: 1, observacion: '' });
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const save = async () => {
    if (!form.descripcion.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/reparaciones/${reparacionId}/items`, { ...form, cantidad: parseInt(form.cantidad) });
      onAdded(data.data);
      setForm({ descripcion: '', cantidad: 1, observacion: '' });
      setOpen(false);
    } finally { setSaving(false); }
  };

  if (!open) return (
    <tr><td colSpan={4} className="table-cell">
      <button className="btn-ghost btn text-sm w-full justify-start" onClick={() => setOpen(true)}>+ Agregar trabajo</button>
    </td></tr>
  );

  return (
    <tr className="bg-slate-700/30">
      <td className="table-cell"><input className="input text-xs" placeholder="Descripción..." value={form.descripcion} onChange={e => setForm(f => ({...f, descripcion: e.target.value}))} /></td>
      <td className="table-cell w-20"><input className="input text-xs w-16" type="number" min="1" value={form.cantidad} onChange={e => setForm(f => ({...f, cantidad: e.target.value}))} /></td>
      <td className="table-cell"><input className="input text-xs" placeholder="Observación..." value={form.observacion} onChange={e => setForm(f => ({...f, observacion: e.target.value}))} /></td>
      <td className="table-cell">
        <div className="flex gap-1">
          <button className="btn-primary btn text-xs px-2 py-1" onClick={save} disabled={saving}>{saving ? <Spinner size="sm" /> : '✓'}</button>
          <button className="btn-ghost btn text-xs px-2 py-1" onClick={() => setOpen(false)}>✕</button>
        </div>
      </td>
    </tr>
  );
}

export default function ListaItemsReparados({ reparacionId, items: initialItems, editable = true }) {
  const [items, setItems] = useState(initialItems || []);

  const handleUpdate = async (id, data) => {
    const { data: res } = await api.put(`/items/${id}`, data);
    setItems((prev) => prev.map((i) => (i.id === id ? res.data : i)));
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este trabajo?')) return;
    await api.delete(`/items/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-700/50 text-slate-400 text-xs uppercase tracking-wide">
            <th className="table-cell text-left">Trabajo realizado</th>
            <th className="table-cell text-center w-16">Cant.</th>
            <th className="table-cell text-left">Observación</th>
            {editable && <th className="table-cell w-20" />}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan={4} className="table-cell text-center text-slate-500 py-4">Sin trabajos registrados</td></tr>
          )}
          {items.map((item) => (
            editable
              ? <ItemRow key={item.id} item={item} onUpdate={handleUpdate} onDelete={handleDelete} />
              : (
                <tr key={item.id} className="border-b border-slate-700">
                  <td className="table-cell">{item.descripcion}</td>
                  <td className="table-cell text-center">{item.cantidad}</td>
                  <td className="table-cell text-slate-400 text-xs">{item.observacion}</td>
                </tr>
              )
          ))}
          {editable && <AddRow reparacionId={reparacionId} onAdded={(item) => setItems((p) => [...p, item])} />}
        </tbody>
      </table>
    </div>
  );
}
