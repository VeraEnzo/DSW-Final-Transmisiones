const CONFIG = {
  ingresada:     { label: 'Ingresada',     color: 'bg-blue-600/20 text-blue-400 border-blue-700' },
  presupuestada: { label: 'Presupuestada', color: 'bg-yellow-600/20 text-yellow-400 border-yellow-700' },
  aprobada:      { label: 'Aprobada',      color: 'bg-orange-600/20 text-orange-400 border-orange-700' },
  terminada:     { label: 'Terminada',     color: 'bg-emerald-600/20 text-emerald-400 border-emerald-700' },
  entregada:     { label: 'Entregada',     color: 'bg-slate-600/20 text-slate-400 border-slate-600' },
  rechazada:     { label: 'Rechazada',     color: 'bg-red-600/20 text-red-400 border-red-700' },
};

export default function BadgeEstado({ estado, size = 'sm' }) {
  const cfg = CONFIG[estado] || { label: estado, color: 'bg-slate-600/20 text-slate-400 border-slate-600' };
  const padding = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-block border rounded-full font-medium ${cfg.color} ${padding}`}>
      {cfg.label}
    </span>
  );
}

export { CONFIG as ESTADO_CONFIG };
