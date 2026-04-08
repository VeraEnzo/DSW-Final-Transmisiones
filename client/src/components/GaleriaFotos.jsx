import { useState, useRef } from 'react';
import api from '../api/axios';
import Spinner from './Spinner';

const ETIQUETAS = ['ingreso', 'proceso', 'terminado', 'detalle_falla'];

function FotoCard({ foto, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    try { await onDelete(foto.id); } finally { setDeleting(false); }
  };

  return (
    <div className="relative group rounded-lg overflow-hidden bg-slate-700 aspect-square">
      <img
        src={foto.url_cloudinary}
        alt={foto.etiqueta}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
        {foto.etiqueta && (
          <span className="text-xs bg-black/50 rounded px-1.5 py-0.5 self-start capitalize text-slate-200">
            {foto.etiqueta}
          </span>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`self-end text-xs px-2 py-1 rounded font-medium ${confirmDel ? 'bg-red-600 text-white' : 'bg-slate-700/80 text-slate-200'}`}
        >
          {deleting ? <Spinner size="sm" /> : confirmDel ? '¿Confirmar?' : '🗑'}
        </button>
      </div>
    </div>
  );
}

function SubirFoto({ reparacionId, onSubida }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [etiqueta, setEtiqueta] = useState('ingreso');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('etiqueta', etiqueta);
      const { data } = await api.post(`/reparaciones/${reparacionId}/fotos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSubida(data.data);
      setPreview(null);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } finally { setUploading(false); }
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-slate-700 max-w-xs">
            <img src={preview} alt="Preview" className="w-full object-cover max-h-64" />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <select
              className="input max-w-[160px]"
              value={etiqueta}
              onChange={e => setEtiqueta(e.target.value)}
            >
              {ETIQUETAS.map((e) => (
                <option key={e} value={e}>{e.replace('_', ' ')}</option>
              ))}
            </select>
            <button className="btn-primary btn" onClick={upload} disabled={uploading}>
              {uploading ? <><Spinner size="sm" /> Subiendo...</> : 'Subir foto'}
            </button>
            <button className="btn-ghost btn" onClick={() => { setPreview(null); setFile(null); }}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <label className="flex items-center gap-3 cursor-pointer btn-secondary btn w-fit">
          <span>📷 Agregar foto</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />
        </label>
      )}
    </div>
  );
}

export default function GaleriaFotos({ reparacionId, fotos: initialFotos, editable = true }) {
  const [fotos, setFotos] = useState(initialFotos || []);

  const handleDelete = async (id) => {
    await api.delete(`/fotos/${id}`);
    setFotos((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {editable && (
        <SubirFoto reparacionId={reparacionId} onSubida={(f) => setFotos((p) => [...p, f])} />
      )}
      {fotos.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">Sin fotos cargadas</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {fotos.map((foto) => (
            <FotoCard key={foto.id} foto={foto} onDelete={editable ? handleDelete : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
