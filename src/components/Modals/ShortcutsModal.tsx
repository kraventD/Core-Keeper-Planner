import React from 'react';
import { Translations } from '../../i18n/translations';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: Translations;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  const toolShortcuts = [
    { key: 'P', desc: t.tools.pencil },
    { key: 'E', desc: t.tools.eraser },
    { key: 'L', desc: t.tools.line },
    { key: 'R', desc: t.tools.rectangle },
    { key: 'C', desc: t.tools.circle },
    { key: 'B / G', desc: t.tools.fill },
    { key: 'S', desc: t.tools.rect_select },
    { key: 'M', desc: t.tools.move },
    { key: 'K', desc: t.tools.place_core },
    { key: 'V', desc: t.tools.select },
  ];

  const editShortcuts = [
    { key: 'Ctrl + Z', desc: t.undo },
    { key: 'Ctrl + Y / ⇧Z', desc: t.redo },
    { key: 'Ctrl + C', desc: t.copy },
    { key: 'Ctrl + X', desc: t.cut },
    { key: 'Ctrl + V', desc: t.paste },
    { key: 'Delete / Backspace', desc: t.delete },
    { key: 'Escape', desc: t.clearSelection },
  ];

  const canvasShortcuts = [
    { key: t.shortcutsModal.scrollWheel, desc: t.shortcutsModal.zoomInfo },
    { key: t.shortcutsModal.spaceDrag, desc: t.shortcutsModal.panInfo },
    { key: t.shortcutsModal.middleButton, desc: t.shortcutsModal.panDirect },
    { key: '+  /  -', desc: t.shortcutsModal.zoomInOut },
    { key: '0', desc: t.resetZoom },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#18191f] border border-zinc-700/80 rounded-xl shadow-2xl p-6 text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold">{t.shortcutsModal.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            aria-label={t.closeModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              {t.shortcutsModal.toolsSection}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {toolShortcuts.map(s => (
                <div
                  key={s.key}
                  className="p-2 rounded-lg bg-[#121316] border border-zinc-800/80 flex items-center justify-between"
                >
                  <span className="text-zinc-400">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[11px] font-semibold">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              {t.shortcutsModal.clipboardSection}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {editShortcuts.map(s => (
                <div
                  key={s.key}
                  className="p-2 rounded-lg bg-[#121316] border border-zinc-800/80 flex items-center justify-between"
                >
                  <span className="text-zinc-400">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[11px] font-semibold">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              {t.shortcutsModal.canvasSection}
            </h4>
            <div className="space-y-1.5 text-xs">
              {canvasShortcuts.map(s => (
                <div
                  key={s.key}
                  className="p-2 rounded-lg bg-[#121316] border border-zinc-800/80 flex items-center justify-between"
                >
                  <span className="text-zinc-400">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[11px] font-semibold">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-800 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
          >
            {t.shortcutsModal.close}
          </button>
        </div>
      </div>
    </div>
  );
};
