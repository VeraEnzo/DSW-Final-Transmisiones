import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from './Spinner';

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function BuscadorCajas({ onSelect, placeholder = 'Buscar por serie, cliente o tipo...' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const search = useCallback(
    debounce(async (q) => {
      if (!q.trim()) { setResults([]); return; }
      setLoading(true);
      try {
        const { data } = await api.get(`/cajas?numero_serie=${encodeURIComponent(q)}`);
        setResults(data.data);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400),
    []
  );

  useEffect(() => { search(query); }, [query]);

  const handleSelect = (caja) => {
    setQuery('');
    setOpen(false);
    if (onSelect) onSelect(caja);
    else navigate(`/cajas/${caja.id}`);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          className="input pr-8"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {loading && <Spinner size="sm" className="absolute right-2 top-2.5" />}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
          {results.map((c) => (
            <button
              key={c.id}
              onMouseDown={() => handleSelect(c)}
              className="w-full text-left px-4 py-3 hover:bg-slate-700 border-b border-slate-700 last:border-0 transition-colors"
            >
              <div className="font-mono text-sky-400 text-sm">{c.numero_serie}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {c.marca} {c.modelo} · {c.tipo_vehiculo} · {c.cliente_nombre || 'Sin cliente'}
              </div>
            </button>
          ))}
          {query && (
            <button
              onMouseDown={() => { navigate('/cajas/nueva', { state: { numero_serie: query } }); setOpen(false); }}
              className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sky-400 text-sm"
            >
              + Crear caja con serie "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
