import React, { useState } from 'react';
import { BlueprintProject } from '../../types/blueprint';
import { Translations } from '../../i18n/translations';
import { encodeShareCode } from '../../utils/shareCode';
import { X, Copy, Download, Check, FileText } from 'lucide-react';

interface ExportCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: BlueprintProject;
  t: Translations;
  onSuccess: (msg: string) => void;
}

export const ExportCodeModal: React.FC<ExportCodeModalProps> = ({
  isOpen,
  onClose,
  project,
  t,
  onSuccess,
}) => {
  const [isCopying, setIsCopying] = useState<boolean>(false);

  if (!isOpen) return null;

  let code = '';
  let error: string | null = null;
  try {
    code = encodeShareCode(project);
    if (!code) {
      error = t.exportCodeModal.errorGenerate;
    }
  } catch {
    error = t.exportCodeModal.errorUnexpected;
  }

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setIsCopying(true);
      onSuccess(t.alerts.codeCopied);
      setTimeout(() => setIsCopying(false), 1500);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    if (!code) return;
    try {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = (project.name || 'core_keeper_plan')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/gi, '_');
      a.download = `${cleanName}.ckbp.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      onSuccess(t.alerts.codeDownloaded);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#18191f] border border-zinc-700/80 rounded-xl shadow-2xl p-6 text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold">{t.exportCodeModal.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            aria-label={t.closeModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-2 p-2.5 rounded-lg bg-red-950/20 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
            <span className="w-4 h-4 flex-shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 space-y-4">
          <p className="text-xs text-zinc-500 mb-1">
            {t.exportCodeModal.description}
          </p>

          <div className="relative group">
            <textarea
              value={code}
              readOnly
              className="w-full bg-[#0f1115] border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-300 break-all focus:outline-none focus:border-amber-500 min-h-[200px]"
              onFocus={e => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={handleCopy}
              disabled={!code}
              className="absolute right-2 top-2 p-1.5 rounded-md bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition disabled:opacity-50 disabled:pointer-events-none"
              title={isCopying ? t.exportCodeModal.copied : t.exportCodeModal.copy}
              aria-label={isCopying ? t.exportCodeModal.copied : t.exportCodeModal.copy}
            >
              {isCopying ? (
                <Check className="w-4 h-4 text-amber-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
            >
              {t.exportCodeModal.cancel}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!code}
              className={`px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition flex items-center gap-1.5 shadow-md ${!code ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Download className="w-4 h-4" />
              <span>{t.exportCodeModal.download}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
