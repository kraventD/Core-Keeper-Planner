import React, { useState } from 'react';
import { BlueprintProject } from '../../types/blueprint';
import { exportBlueprintToPng, ExportOptions } from '../../utils/exportPng';
import { Translations } from '../../i18n/translations';
import { X, Download, Check, Image as ImageIcon } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: BlueprintProject;
  t: Translations;
  onSuccess: (msg: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  t,
  onSuccess,
}) => {
  const [scale, setScale] = useState<number>(24); // 24px per cell by default
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [includeLegend, setIncludeLegend] = useState<boolean>(true);
  const [background, setBackground] = useState<'dark' | 'navy' | 'light' | 'transparent'>('dark');
  const [fileName, setFileName] = useState<string>(project.name || 'core_keeper_plan');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);

    try {
      const opts: ExportOptions = {
        cellSize: scale,
        showGrid,
        background,
        includeLegend,
        fileName: fileName.trim() || 'blueprint',
      };

      await exportBlueprintToPng(project, opts);
      onSuccess(t.alerts.imageExported);
      onClose();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const scaleOptions = [
    { label: t.exportModal.scaleNormal, value: 16 },
    { label: t.exportModal.scaleHigh, value: 24 },
    { label: t.exportModal.scaleUltra, value: 36 },
    { label: t.exportModal.scalePoster, value: 48 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#18191f] border border-zinc-700/80 rounded-xl shadow-2xl p-6 text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold">{t.exportModal.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            aria-label={t.closeModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleExport} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              {t.exportModal.fileName}
            </label>
            <input
              type="text"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              className="w-full bg-[#121316] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              {t.exportModal.scale}
            </label>
            <select
              value={scale}
              onChange={e => setScale(parseInt(e.target.value, 10))}
              className="w-full bg-[#121316] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              {scaleOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {project.width * opt.value} × {project.height * opt.value} px
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              {t.exportModal.background}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setBackground('dark')}
                className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                  background === 'dark'
                    ? 'border-amber-500 bg-[#121316] text-amber-300'
                    : 'border-zinc-800 bg-[#121316] text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span>{t.exportModal.bgDark}</span>
                {background === 'dark' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
              <button
                type="button"
                onClick={() => setBackground('navy')}
                className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                  background === 'navy'
                    ? 'border-cyan-500 bg-[#0f172a] text-cyan-300'
                    : 'border-zinc-800 bg-[#0f172a] text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span>{t.exportModal.bgNavy}</span>
                {background === 'navy' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
              <button
                type="button"
                onClick={() => setBackground('light')}
                className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                  background === 'light'
                    ? 'border-zinc-400 bg-white text-zinc-900 font-medium'
                    : 'border-zinc-800 bg-zinc-200 text-zinc-800 hover:border-zinc-600'
                }`}
              >
                <span>{t.exportModal.bgLight}</span>
                {background === 'light' && <Check className="w-3.5 h-3.5 text-zinc-900" />}
              </button>
              <button
                type="button"
                onClick={() => setBackground('transparent')}
                className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                  background === 'transparent'
                    ? 'border-amber-500 bg-[#121316] text-amber-300'
                    : 'border-zinc-800 bg-[#121316] text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span>{t.exportModal.bgTransparent}</span>
                {background === 'transparent' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={e => setShowGrid(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0 focus:ring-offset-0"
              />
              <span>{t.exportModal.includeGrid}</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLegend}
                onChange={e => setIncludeLegend(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0 focus:ring-offset-0"
              />
              <span>{t.exportModal.includeLegend}</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
            >
              {t.exportModal.cancel}
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? t.exportModal.exporting : t.exportModal.export}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
