import React, { useEffect, useMemo, useState } from 'react';
import { BlueprintProject, Language } from '../../types/blueprint';
import { RecoverySnapshot, createProjectThumbnail, MAX_RECOVERY_SNAPSHOTS } from '../../utils/recoveryHistory';
import { History, RotateCcw, X } from 'lucide-react';

interface RecoveryModalProps {
  isOpen: boolean;
  project: BlueprintProject | null;
  snapshots: RecoverySnapshot[];
  historyAvailable: boolean;
  language: Language;
  onClose: () => void;
  onRecover: () => void;
  onRecoverSnapshot: (snapshot: RecoverySnapshot) => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  isOpen,
  project,
  snapshots,
  historyAvailable,
  language,
  onClose,
  onRecover,
  onRecoverSnapshot,
}) => {
  const isSpanish = language === 'es';
  const [selectedId, setSelectedId] = useState<string | null>(snapshots[0]?.id ?? (project ? 'legacy' : null));
  const legacyThumbnail = useMemo(() => isOpen && project ? createProjectThumbnail(project) : '', [isOpen, project]);

  useEffect(() => {
    setSelectedId(current => {
      if (current === 'legacy' && project) return current;
      if (current && snapshots.some(snapshot => snapshot.id === current)) return current;
      return snapshots[0]?.id ?? (project ? 'legacy' : null);
    });
  }, [snapshots, project, isOpen]);

  if (!isOpen) return null;

  const selectedSnapshot = snapshots.find(snapshot => snapshot.id === selectedId) ?? null;
  const selectedLegacy = selectedId === 'legacy' && project !== null;
  const selectedProject = selectedSnapshot?.project ?? (selectedLegacy ? project : null);
  const selectedThumbnail = selectedSnapshot?.thumbnail || (selectedLegacy ? legacyThumbnail : '');
  const canRestore = selectedSnapshot !== null || selectedLegacy;
  const occupiedTiles = selectedProject
    ? Object.keys(selectedProject.cells).length + Object.keys(selectedProject.floorTiles ?? {}).length
    : 0;
  const placedObjects = selectedProject?.storagePlacements?.length ?? 0;
  const formatTimestamp = (value: string) => new Date(value).toLocaleString(isSpanish ? 'es' : 'en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const restoreSelected = () => {
    if (selectedSnapshot) onRecoverSnapshot(selectedSnapshot);
    else if (selectedLegacy) onRecover();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="recovery-title" className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#2b3d58] bg-[#0d1728] text-zinc-100 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#24334b] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300"><History className="h-5 w-5" /></span>
            <div>
              <h2 id="recovery-title" className="text-base font-semibold">{isSpanish ? 'Historial de recuperación' : 'Recovery history'}</h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-400">
                {isSpanish
                  ? `Se guarda un punto cada 5 minutos cuando hay cambios. Se conservan los últimos ${MAX_RECOVERY_SNAPSHOTS} puntos.`
                  : `A recovery point is saved every 5 minutes when changes are detected. The latest ${MAX_RECOVERY_SNAPSHOTS} points are kept.`}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={isSpanish ? 'Cerrar' : 'Close'} className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#1a2940] hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        {!historyAvailable && <div className="border-b border-amber-500/20 bg-amber-500/5 px-5 py-2 text-[11px] text-amber-200">
          {isSpanish ? 'El navegador no permitió acceder al almacenamiento del historial. El autoguardado normal sigue activo.' : 'The browser did not allow access to recovery history storage. Regular autosave is still active.'}
        </div>}

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.85fr)]">
          <div className="flex min-w-0 flex-col">
            {selectedProject ? <>
              <div className="overflow-hidden rounded-xl border border-[#2a3b55] bg-[#08111f]">
                {selectedThumbnail ? <img src={selectedThumbnail} alt={isSpanish ? 'Miniatura del plano guardado' : 'Saved blueprint thumbnail'} className="block aspect-[360/190] w-full object-contain" /> : <div className="flex aspect-[360/190] items-center justify-center text-xs text-zinc-500">{isSpanish ? 'Miniatura no disponible' : 'Thumbnail unavailable'}</div>}
              </div>
              <div className="mt-3 rounded-xl border border-[#26354c] bg-[#101a2b] p-3">
                <div className="truncate text-sm font-semibold">{selectedProject.name}</div>
                <div className="mt-1 font-mono text-[11px] text-zinc-400">{selectedProject.width} × {selectedProject.height} {isSpanish ? 'casillas' : 'tiles'}</div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500">
                  <span>{formatTimestamp(selectedSnapshot?.createdAt ?? selectedProject.updatedAt)}</span>
                  <span>{occupiedTiles} {isSpanish ? 'casillas con suelo o color' : 'floor or color tiles'}</span>
                  <span>{placedObjects} {isSpanish ? 'objetos' : 'objects'}</span>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={restoreSelected} className="flex items-center gap-2 rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-[#111827] transition hover:bg-amber-300 disabled:opacity-40" disabled={!canRestore}>
                  <RotateCcw className="h-3.5 w-3.5" />{isSpanish ? 'Restaurar este punto' : 'Restore this point'}
                </button>
              </div>
              <p className="mt-2 text-right text-[10px] leading-relaxed text-zinc-500">
                {isSpanish ? 'Antes de restaurar, se guardará el estado actual como otro punto.' : 'Before restoring, the current state will be saved as another point.'}
              </p>
            </> : <div className="flex min-h-56 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[#2a3b55] bg-[#101a2b]/50 p-6 text-center">
              <History className="mb-3 h-7 w-7 text-zinc-600" />
              <div className="text-sm font-medium text-zinc-300">{isSpanish ? 'Aún no hay puntos de recuperación' : 'No recovery points yet'}</div>
              <div className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-500">{isSpanish ? 'Se creará el primero después de cinco minutos, siempre que hayas hecho cambios en el plano.' : 'The first one will be created after five minutes, if you have made changes to the blueprint.'}</div>
            </div>}
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              <span>{isSpanish ? 'Puntos guardados' : 'Saved recovery points'}</span>
              <span className="font-mono text-cyan-300">{snapshots.length}</span>
            </div>
            <div className="min-h-32 flex-1 space-y-2 overflow-y-auto pr-1">
              {project && <button type="button" onClick={() => setSelectedId('legacy')} className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${selectedLegacy ? 'border-amber-400/70 bg-amber-400/10' : 'border-[#26354c] bg-[#101a2b] hover:border-[#3b5273]'}`}>
                <img src={legacyThumbnail} alt="" className="h-14 w-24 rounded-md border border-[#2a3b55] bg-[#08111f] object-contain" />
                <span className="min-w-0"><span className="block truncate text-xs font-medium">{isSpanish ? 'Respaldo anterior' : 'Previous autosave'}</span><span className="mt-1 block text-[10px] text-zinc-500">{formatTimestamp(project.updatedAt)}</span></span>
              </button>}
              {snapshots.map(snapshot => <button key={snapshot.id} type="button" onClick={() => setSelectedId(snapshot.id)} className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${selectedId === snapshot.id ? 'border-cyan-400/70 bg-cyan-400/10' : 'border-[#26354c] bg-[#101a2b] hover:border-[#3b5273]'}`}>
                <img src={snapshot.thumbnail} alt="" className="h-14 w-24 rounded-md border border-[#2a3b55] bg-[#08111f] object-contain" />
                <span className="min-w-0"><span className="block truncate text-xs font-medium">{snapshot.project.name}</span><span className="mt-1 block text-[10px] text-zinc-500">{formatTimestamp(snapshot.createdAt)}</span><span className="mt-0.5 block text-[10px] text-zinc-600">{snapshot.project.width} × {snapshot.project.height}</span></span>
              </button>)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
