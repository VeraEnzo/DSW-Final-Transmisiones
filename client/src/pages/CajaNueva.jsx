import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';

function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export default function CajaNueva() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    numero_serie: location.state?.numero_serie || '',
    tipo_vehiculo: 'camion',
    marca: '',
    modelo: '',
    id_cliente: '',
    observaciones_generales: '',
  });

  const [clientes, setClientes] = useState([]);
  const [clienteSearch, setClienteSearch] = useState('');
  const [showNewCliente, setShowNewCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', empresa: '', telefono: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const searchClientes = useCallback(
    debounce(async (q) => {
      const { data } = await api.get(`/clientes?search=${encodeURIComponent(q)}`);
      setClientes(data.data);
    }, 300),
    []
  );

  useEffect(() => { searchClientes(clienteSearch); }, [clienteSearch]);
  useEffect(() => { searchClientes(''); }, []);

  const createCliente = async () => {
    if (!nuevoCliente.nombre.trim()) return;
    const { data } = await api.post('/clientes', nuevoCliente);
    setClientes((p) => [data.data, ...p]);
    setForm((f) => ({ ...f, id_cliente: data.data.id }));
    setClienteSearch(data.data.nombre);
    setShowNewCliente(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.numero_serie.trim()) { setError('El número de serie es obligatorio'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, id_cliente: form.id_cliente ? parseInt(form.id_cliente) : null };
      const { data } = await api.post('/cajas', payload);
      navigate(`/cajas/${data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la caja');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost btn text-sm">← Volver</button>
        <h2 className="text-xl font-bold text-slate-100">Nueva Caja</h2>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Número de serie *</label>
          <input className="input font-mono" value={form.numero_serie}
            onChange={e => setForm(f => ({...f, numero_serie: e.target.value}))} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
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
        </div>

        <div>
          <label className="label">Modelo</label>
          <input className="input" placeholder="6HP600, 3000 Series..." value={form.modelo}
            onChange={e => setForm(f => ({...f, modelo: e.target.value}))} />
        </div>

        {/* Cliente selector */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Cliente</label>
            <button type="button" className="text-xs text-sky-400 hover:text-sky-300"
              onClick={() => setShowNewCliente(!showNewCliente)}>
              {showNewCliente ? 'Cancelar' : '+ Nuevo cliente'}
            </button>
          </div>

          {showNewCliente ? (
            <div className="bg-slate-700/50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Nuevo cliente</p>
              <input className="input" placeholder="Nombre *" value={nuevoCliente.nombre}
                onChange={e => setNuevoCliente(f => ({...f, nombre: e.target.value}))} />
              <input className="input" placeholder="Empresa" value={nuevoCliente.empresa}
                onChange={e => setNuevoCliente(f => ({...f, empresa: e.target.value}))} />
              <input className="input" placeholder="Teléfono" value={nuevoCliente.telefono}
                onChange={e => setNuevoCliente(f => ({...f, telefono: e.target.value}))} />
              <button type="button" className="btn-primary btn text-sm" onClick={createCliente}>
                Crear y seleccionar
              </button>
            </div>
          ) : (
            <div className="relative">
              <input className="input" placeholder="Buscar cliente..." value={clienteSearch}
                onChange={e => { setClienteSearch(e.target.value); setForm(f => ({...f, id_cliente: ''})); }} />
              {clientes.length > 0 && !form.id_cliente && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  <button type="button" className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:bg-slate-700"
                    onClick={() => { setClienteSearch(''); setForm(f => ({...f, id_cliente: ''})); }}>
                    Sin cliente
                  </button>
                  {clientes.map((cl) => (
                    <button key={cl.id} type="button"
                      onMouseDown={() => { setForm(f => ({...f, id_cliente: cl.id})); setClienteSearch(cl.nombre + (cl.empresa ? ` (${cl.empresa})` : '')); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 border-t border-slate-700">
                      <span className="text-slate-200">{cl.nombre}</span>
                      {cl.empresa && <span className="text-slate-400 ml-1">· {cl.empresa}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="label">Observaciones generales</label>
          <textarea className="input min-h-[80px] resize-none" value={form.observaciones_generales}
            onChange={e => setForm(f => ({...f, observaciones_generales: e.target.value}))} />
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/30 rounded px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary btn flex-1" disabled={saving}>
            {saving ? <><Spinner size="sm" /> Guardando...</> : 'Crear caja'}
          </button>
          <button type="button" className="btn-secondary btn" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
