import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import Spinner from './Spinner';

const ETIQUETAS = ['ingreso', 'proceso', 'terminado', 'detalle_falla'];

// ── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ fotos, indiceInicial, onClose }) {
  const [indice, setIndice] = useState(indiceInicial);
  const foto = fotos[indice];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndice((i) => Math.min(i + 1, fotos.length - 1));
      if (e.key === 'ArrowLeft') setIndice((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fotos.length, onClose]);

  const descargar = async () => {
    const res = await fetch(foto.url_cloudinary);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foto-${foto.id}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          {foto.etiqueta && (
            <span className="text-xs bg-slate-700 rounded px-2 py-1 capitalize text-slate-300">
              {foto.etiqueta.replace('_', ' ')}
            </span>
          )}
          <span className="text-xs text-slate-500">{indice + 1} / {fotos.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={descargar}
            className="btn-secondary btn text-xs px-3 py-1.5"
          >
            ⬇ Descargar
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none px-2"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Imagen */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-12">
        <img
          src={foto.url_cloudinary}
          alt={foto.etiqueta}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Flechas */}
        {indice > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIndice((i) => i - 1); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center text-xl transition-colors"
          >
            ‹
          </button>
        )}
        {indice < fotos.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIndice((i) => i + 1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center text-xl transition-colors"
          >
            ›
          </button>
        )}
      </div>

      {/* Miniaturas */}
      {fotos.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto shrink-0" onClick={(e) => e.stopPropagation()}>
          {fotos.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setIndice(i)}
              className={`shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition-colors ${
                i === indice ? 'border-sky-400' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={f.url_cloudinary} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── FotoCard ─────────────────────────────────────────────────────────────────
function FotoCard({ foto, onDelete, onOpen }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    try { await onDelete(foto.id); } finally { setDeleting(false); }
  };

  return (
    <div
      className="relative group rounded-lg overflow-hidden bg-slate-700 aspect-square cursor-pointer"
      onClick={onOpen}
    >
      <img
        src={foto.url_cloudinary}
        alt={foto.etiqueta}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
        {foto.etiqueta && (
          <span className="text-xs bg-black/50 rounded px-1.5 py-0.5 self-start capitalize text-slate-200">
            {foto.etiqueta.replace('_', ' ')}
          </span>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`self-end text-xs px-2 py-1 rounded font-medium ${confirmDel ? 'bg-red-600 text-white' : 'bg-slate-700/80 text-slate-200'}`}
          >
            {deleting ? <Spinner size="sm" /> : confirmDel ? '¿Confirmar?' : '🗑'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── SubirFoto ─────────────────────────────────────────────────────────────────
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
            <select className="input max-w-[160px]" value={etiqueta} onChange={e => setEtiqueta(e.target.value)}>
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
          <input ref={inputRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={handleFile} />
        </label>
      )}
    </div>
  );
}

// ── GaleriaFotos ──────────────────────────────────────────────────────────────
export default function GaleriaFotos({ reparacionId, fotos: initialFotos, editable = true }) {
  const [fotos, setFotos] = useState(initialFotos || []);
  const [lightboxIndice, setLightboxIndice] = useState(null);

  const handleDelete = async (id) => {
    await api.delete(`/fotos/${id}`);
    setFotos((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {lightboxIndice !== null && (
        <Lightbox
          fotos={fotos}
          indiceInicial={lightboxIndice}
          onClose={() => setLightboxIndice(null)}
        />
      )}

      {editable && (
        <SubirFoto reparacionId={reparacionId} onSubida={(f) => setFotos((p) => [...p, f])} />
      )}

      {fotos.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">Sin fotos cargadas</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {fotos.map((foto, i) => (
            <FotoCard
              key={foto.id}
              foto={foto}
              onOpen={() => setLightboxIndice(i)}
              onDelete={editable ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
