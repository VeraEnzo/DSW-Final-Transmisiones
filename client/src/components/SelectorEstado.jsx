import { useState } from 'react';

const STEPS = ['ingresada', 'presupuestada', 'aprobada', 'terminada', 'entregada'];

const TRANSITIONS = {
  ingresada:     ['presupuestada'],
  presupuestada: ['aprobada', 'rechazada'],
  aprobada:      ['terminada'],
  terminada:     ['entregada'],
  entregada:     [],
  rechazada:     [],
};

const STEP_COLORS = {
  ingresada:     { active: 'bg-blue-500', text: 'text-blue-400' },
  presupuestada: { active: 'bg-yellow-500', text: 'text-yellow-400' },
  aprobada:      { active: 'bg-orange-500', text: 'text-orange-400' },
  terminada:     { active: 'bg-emerald-500', text: 'text-emerald-400' },
  entregada:     { active: 'bg-slate-500', text: 'text-slate-400' },
  rechazada:     { active: 'bg-red-500', text: 'text-red-400' },
};

const LABELS = {
  ingresada: 'Ingresada',
  presupuestada: 'Presupuestada',
  aprobada: 'Aprobada',
  terminada: 'Terminada',
  entregada: 'Entregada',
  rechazada: 'Rechazada',
};

export default function SelectorEstado({ estado, onCambio, loading }) {
  const [confirmando, setConfirmando] = useState(null);
  const siguientes = TRANSITIONS[estado] || [];
  const isRechazada = estado === 'rechazada';

  if (isRechazada) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
        <span className="text-red-400 text-sm font-medium">Rechazada — presupuesto no aprobado</span>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(estado);

  const handleClick = (nuevoEstado) => {
    if (confirmando === nuevoEstado) {
      onCambio(nuevoEstado);
      setConfirmando(null);
    } else {
      setConfirmando(nuevoEstado);
    }
  };

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const isPast = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;
          const col = STEP_COLORS[step];

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                    ${isCurrent ? `${col.active} border-white text-white` : ''}
                    ${isPast ? 'bg-slate-600 border-slate-500 text-slate-300' : ''}
                    ${isFuture ? 'bg-slate-800 border-slate-600 text-slate-500' : ''}
                  `}
                >
                  {isPast ? '✓' : idx + 1}
                </div>
                <span className={`text-xs mt-1 hidden md:block ${isCurrent ? col.text : 'text-slate-500'}`}>
                  {LABELS[step]}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 ${isPast || isCurrent ? 'bg-slate-500' : 'bg-slate-700'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Transition buttons */}
      {siguientes.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {siguientes.map((sig) => {
            const isConfirming = confirmando === sig;
            const col = STEP_COLORS[sig];
            const isReject = sig === 'rechazada';
            return (
              <button
                key={sig}
                onClick={() => handleClick(sig)}
                disabled={loading}
                className={`btn text-sm ${isReject ? 'btn-danger' : 'btn-primary'} ${isConfirming ? 'ring-2 ring-white' : ''}`}
              >
                {isConfirming ? `¿Confirmar → ${LABELS[sig]}?` : `→ ${LABELS[sig]}`}
              </button>
            );
          })}
          {confirmando && (
            <button onClick={() => setConfirmando(null)} className="btn-ghost btn text-sm">
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
