import React, { useState } from 'react';
import { Translations } from '../../i18n/translations';
import { countTrimmedCells } from '../../utils/gridLogic';
import { X, Sliders, AlertTriangle, Trash2 } from 'lucide-react';

interface ResizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWidth: number;
  currentHeight: number;
  cells: Record<string, string>;
  onApplyResize: (newWidth: number, newHeight: number) => void;
  onClearBlueprint: () => void;
  t: Translations;
}

export const ResizeModal: React.FC<ResizeModalProps> = ({
  isOpen,
  onClose,
  currentWidth,
  currentHeight,
  cells,
  onApplyResize,
  onClearBlueprint,
  t,
}) => {
  const [newWidth, setNewWidth] = useState(currentWidth);
  const [newHeight, setNewHeight] = useState(currentHeight);
  const [confirmClear, setConfirmClear] = useState(false);

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen) {
      setNewWidth(currentWidth);
      setNewHeight(currentHeight);
      setConfirmClear(false);
    }
  }, [isOpen, currentWidth, currentHeight]);

  if (!isOpen) return null;

  const trimmedCount = countTrimmedCells(cells, newWidth, newHeight);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyResize(Math.max(5, newWidth), Math.max(5, newHeight));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#18191f] border border-zinc-700/80 rounded-xl shadow-2xl p-6 text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold">{t.resizeModal.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="mt-4 space-y-4">
          <div className="p-3 bg-[#121316] rounded-lg border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
            <span>{t.resizeModal.currentSize}:</span>
            <span className="font-mono text-zinc-200 font-semibold">
              {currentWidth} × {currentHeight} {t.cells} ({currentWidth * currentHeight} total)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                {t.width} ({t.cells})
              </label>
              <input
                type="number"
                min="5"
                max="500"
                value={newWidth}
                onChange={e => setNewWidth(parseInt(e.target.value, 10) || 5)}
                className="w-full bg-[#121316] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                {t.height} ({t.cells})
              </label>
              <input
                type="number"
                min="5"
                max="500"
                value={newHeight}
                onChange={e => setNewHeight(parseInt(e.target.value, 10) || 5)}
                className="w-full bg-[#121316] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {trimmedCount > 0 && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                {t.resizeModal.trimWarning.replace('{count}', String(trimmedCount))}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between">
            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/40 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar plano</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-red-400">¿Seguro?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearBlueprint();
                    onClose();
                  }}
                  className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition"
                >
                  Sí, borrar todo
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs"
                >
                  No
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
              >
                {t.resizeModal.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold transition"
              >
                {t.resizeModal.apply}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
