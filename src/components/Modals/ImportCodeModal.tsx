import React, { useState } from 'react';
import { BlueprintProject } from '../../types/blueprint';
import { Translations } from '../../i18n/translations';
import { decodeShareCode, isValidShareCode } from '../../utils/shareCode';
import { X, FileText, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';

interface ImportCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (project: Partial<BlueprintProject>) => void;
  t: Translations;
}

export const ImportCodeModal: React.FC<ImportCodeModalProps> = ({
  isOpen,
  onClose,
  onImport,
  t,
}) => {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleImport = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError(t.importCodeModal.errorEmpty);
      return;
    }

    if (!isValidShareCode(trimmed)) {
      setError(t.importCodeModal.errorInvalid);
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const projectData = decodeShareCode(trimmed);
      onImport(projectData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.importCodeModal.errorInvalid);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#18191f] border border-zinc-700/80 rounded-xl shadow-2xl p-6 text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold">{t.importCodeModal.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-xs text-zinc-500 mb-1">
            {t.importCodeModal.description}
          </p>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="relative">
            <textarea
              value={code}
              placeholder="Pega aquí el código CKBP..."
              onChange={e => {
                setCode(e.target.value);
                setError(null);
              }}
              className="w-full bg-[#0f1115] border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-300 break-all focus:outline-none focus:border-amber-500 min-h-[180px]"
            />
            <button
              type="button"
              onClick={() => setCode('')}
              className="absolute right-2 top-2 p-1.5 rounded-md bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
              title="Limpiar"
              aria-label="Limpiar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
            >
              {t.importCodeModal.cancel}
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>{t.importCodeModal.importing}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{t.importCodeModal.import}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
