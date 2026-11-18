import React from 'react';
import { BlueprintProject, Language } from '../../types/blueprint';
import { History, X } from 'lucide-react';

interface RecoveryModalProps {
  project: BlueprintProject | null;
  language: Language;
  onClose: () => void;
  onRecover: () => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({ project, language, onClose, onRecover }) => {
  if (!project) return null;
  const isSpanish = language === 'es';
  const occupiedTiles = Object.keys(project.cells).length + Object.keys(project.floorTiles ?? {}).length;
  const placedObjects = project.storagePlacements?.length ?? 0;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="recovery-title" className="w-full max-w-md rounded-2xl border border-zinc-700 bg-[#15161b] p-5 text-zinc-100 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300"><History className="h-5 w-5" /></span>
            <div>
              <h2 id="recovery-title" className="text-base font-semibold">{isSpanish ? 'Recuperar plano anterior' : 'Recover previous blueprint'}</h2>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">{isSpanish ? 'Este respaldo automático se creó antes del último cambio guardado.' : 'This automatic backup was created before the latest saved change.'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={isSpanish ? 'Cerrar' : 'Close'} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="mb-5 rounded-xl border border-zinc-800 bg-[#101115] p-3">
          <div className="truncate text-sm font-semibold">{project.name}</div>
          <div className="mt-1 font-mono text-[11px] text-zinc-400">{project.width} × {project.height} {isSpanish ? 'casillas' : 'tiles'}</div>
          <div className="mt-2 flex gap-3 text-[10px] text-zinc-500">
            <span>{occupiedTiles} {isSpanish ? 'casillas con suelo o color' : 'floor or color tiles'}</span>
            <span>{placedObjects} {isSpanish ? 'objetos' : 'objects'}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800">{isSpanish ? 'Cancelar' : 'Cancel'}</button>
          <button type="button" onClick={onRecover} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-400">{isSpanish ? 'Recuperar respaldo' : 'Recover backup'}</button>
        </div>
      </section>
    </div>
  );
};
