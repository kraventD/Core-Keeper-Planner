import React, { useState } from 'react';
import { Translations } from '../../i18n/translations';
import { X, Sparkles } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, width: number, height: number) => void;
  t: Translations;
  currentHasContent: boolean;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  t,
  currentHasContent,
}) => {
  const [name, setName] = useState('');
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(50);

  if (!isOpen) return null;

  const presets = [
    { label: '30 × 30', w: 30, h: 30, desc: 'Habitación / Room' },
    { label: '50 × 50', w: 50, h: 50, desc: 'Base mediana / Medium' },
    { label: '80 × 80', w: 80, h: 80, desc: 'Gran complejo / Large' },
    { label: '100 × 100', w: 100, h: 100, desc: 'Base masiva / Huge' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(name.trim() || 'Core Keeper Base', Math.max(10, Math.min(300, width)), Math.max(10, Math.min(300, height)));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#18191f] border border-zinc-700/80 rounded-xl shadow-2xl p-6 text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold">{t.newProjectModal.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            aria-label={t.closeModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              {t.projectNamePlaceholder}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Mi Base Principal..."
              className="w-full bg-[#121316] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              {t.newProjectModal.presets}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map(p => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => {
                    setWidth(p.w);
                    setHeight(p.h);
                  }}
                  className={`p-2.5 rounded-lg border text-left text-xs transition flex flex-col justify-between ${
                    width === p.w && height === p.h
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-[#121316] text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="font-semibold text-sm">{p.label}</span>
                  <span className="text-[10px] text-zinc-400">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                {t.newProjectModal.width}
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={width}
                onChange={e => setWidth(parseInt(e.target.value, 10) || 10)}
                className="w-full bg-[#121316] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                {t.newProjectModal.height}
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={height}
                onChange={e => setHeight(parseInt(e.target.value, 10) || 10)}
                className="w-full bg-[#121316] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {currentHasContent && (
            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs">
              ⚠️ {t.newProjectModal.confirmWarning}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
            >
              {t.newProjectModal.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold transition shadow-md"
            >
              {t.newProjectModal.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
