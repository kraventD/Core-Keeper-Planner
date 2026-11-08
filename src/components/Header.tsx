import React, { useRef } from 'react';
import { Translations } from '../i18n/translations';
import { Language } from '../types/blueprint';
import {
  FilePlus,
  FolderOpen,
  Save,
  Download,
  Undo2,
  Redo2,
  Sliders,
  Keyboard,
  Globe,
  Grid,
  FileText,
} from 'lucide-react';

interface HeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onNewProject: () => void;
  onOpenProjectJson: (file: File) => void;
  onSaveProjectJson: () => void;
  onExportImage: () => void;
  onExportCode: () => void;
  onImportCode: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  t: Translations;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  onProjectNameChange,
  onNewProject,
  onOpenProjectJson,
  onSaveProjectJson,
  onExportImage,
  onExportCode,
  onImportCode,
  onOpenSettings,
  onOpenShortcuts,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  currentLanguage,
  onLanguageChange,
  t,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenProjectJson(file);
      e.target.value = ''; // reset so same file can be reopened if desired
    }
  };

  return (
    <header className="h-14 bg-[#14151a] border-b border-zinc-800/90 px-4 flex items-center justify-between gap-3 text-zinc-200 select-none shrink-0 z-30">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 pr-3 border-r border-zinc-800/80">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
            <Grid className="w-4 h-4" />
          </div>
          <div className="hidden lg:block leading-tight">
            <h1 className="text-xs font-bold tracking-wider text-amber-400 uppercase">
              Core Keeper
            </h1>
            <p className="text-[10px] text-zinc-400 font-medium">Planner</p>
          </div>
        </div>

        {/* Project Name input */}
        <input
          type="text"
          value={projectName}
          onChange={e => onProjectNameChange(e.target.value)}
          placeholder={t.projectNamePlaceholder}
          aria-label={t.projectNamePlaceholder}
          className="bg-transparent hover:bg-[#1a1b22] focus:bg-[#1a1b22] px-2.5 py-1 rounded-md text-sm font-semibold text-zinc-100 placeholder-zinc-500 border border-transparent focus:border-zinc-700 transition w-44 md:w-60 truncate focus:w-72"
        />
      </div>

      {/* Primary Actions & Tooling */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-[#1a1b22] border border-zinc-800 rounded-lg p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title={`${t.undo} (Ctrl+Z)`}
            aria-label={`${t.undo} (Ctrl+Z)`}
            className="p-1.5 rounded-md text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title={`${t.redo} (Ctrl+Y / Ctrl+Shift+Z)`}
            aria-label={`${t.redo} (Ctrl+Y / Ctrl+Shift+Z)`}
            className="p-1.5 rounded-md text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-[1px] bg-zinc-800 mx-0.5 hidden sm:block" />

        {/* File operations */}
        <button
          onClick={onNewProject}
          title={t.newProject}
          aria-label={t.newProject}
          className="px-2.5 py-1.5 rounded-lg bg-[#1a1b22] hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition flex items-center gap-1.5"
        >
          <FilePlus className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{t.newProject}</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title={t.openProject}
          aria-label={t.openProject}
          className="px-2.5 py-1.5 rounded-lg bg-[#1a1b22] hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition flex items-center gap-1.5"
        >
          <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">{t.openProject}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.ckbp.json"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={onSaveProjectJson}
          title={t.saveProject}
          aria-label={t.saveProject}
          className="px-2.5 py-1.5 rounded-lg bg-[#1a1b22] hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{t.saveProject}</span>
        </button>

        <button
          onClick={onExportImage}
          title={t.exportImage}
          aria-label={t.exportImage}
          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t.exportImage}</span>
        </button>

        <button
          onClick={onExportCode}
          title={t.exportCode}
          aria-label={t.exportCode}
          className="px-2.5 py-1.5 rounded-lg bg-[#1a1b22] hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-zinc-300" />
          <span className="hidden sm:inline">{t.exportCode}</span>
        </button>

        <button
          onClick={onImportCode}
          title={t.importCode}
          aria-label={t.importCode}
          className="px-2.5 py-1.5 rounded-lg bg-[#1a1b22] hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-zinc-300" />
          <span className="hidden sm:inline">{t.importCode}</span>
        </button>

        <div className="h-5 w-[1px] bg-zinc-800 mx-0.5" />

        {/* Blueprint settings (Width/Height resize modal) */}
        <button
          onClick={onOpenSettings}
          title={t.settings}
          aria-label={t.settings}
          className="p-1.5 rounded-lg bg-[#1a1b22] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          title={t.shortcuts}
          aria-label={t.shortcuts}
          className="p-1.5 rounded-lg bg-[#1a1b22] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition hidden sm:flex items-center"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Language selector toggle */}
        <button
          onClick={() => onLanguageChange(currentLanguage === 'es' ? 'en' : 'es')}
          title={t.language}
          aria-label={t.language}
          className="px-2 py-1 rounded-lg bg-[#1a1b22] hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-semibold text-zinc-300 hover:text-amber-400 transition flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          <span>{currentLanguage.toUpperCase()}</span>
        </button>
      </div>
    </header>
  );
};
