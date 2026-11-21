import React, { useRef, useState } from 'react';
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
  FileText,
  History,
  CloudCheck,
  CloudOff,
} from 'lucide-react';
import { BrandIcon } from './BrandIcon';

interface HeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onNewProject: () => void;
  onOpenProjectJson: (file: File) => void;
  onSaveProjectJson: () => void;
  onRecoverAutosave: () => void;
  recoveryPointCount: number;
  autosaveAvailable: boolean;
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
  onRecoverAutosave,
  recoveryPointCount,
  autosaveAvailable,
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
  const [fileMenuOpen, setFileMenuOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenProjectJson(file);
      e.target.value = ''; // reset so same file can be reopened if desired
    }
  };

  const fileActionClass = 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-200 transition hover:bg-[#1a2940]';
  const runFileAction = (action: () => void) => { action(); setFileMenuOpen(false); };

  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#24334b] bg-[#080f1c] px-3 text-zinc-200 select-none sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex shrink-0 items-center gap-2 border-r border-[#26354c] pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300"><BrandIcon className="h-6 w-6" /></div>
          <div className="hidden leading-tight sm:block">
            <h1 className="text-[11px] font-bold tracking-wide text-cyan-200">Core Keeper</h1>
            <p className="text-[10px] text-zinc-500">Planner</p>
          </div>
        </div>
        <input type="text" value={projectName} onChange={event => onProjectNameChange(event.target.value)} placeholder={t.projectNamePlaceholder} aria-label={t.projectNamePlaceholder}
          className="w-32 min-w-0 truncate rounded-md border border-transparent bg-transparent px-2 py-1 text-xs font-semibold text-zinc-100 transition hover:bg-[#111c2d] focus:border-[#345070] focus:bg-[#111c2d] focus:outline-none sm:w-52 lg:w-64" />
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="flex items-center rounded-lg border border-[#26354c] bg-[#101a2b] p-0.5">
          <button onClick={onUndo} disabled={!canUndo} title={`${t.undo} (Ctrl+Z)`} aria-label={t.undo} className="rounded-md p-1.5 text-zinc-300 transition hover:bg-[#1d2b41] disabled:pointer-events-none disabled:opacity-30"><Undo2 className="h-4 w-4" /></button>
          <button onClick={onRedo} disabled={!canRedo} title={`${t.redo} (Ctrl+Y / Ctrl+Shift+Z)`} aria-label={t.redo} className="rounded-md p-1.5 text-zinc-300 transition hover:bg-[#1d2b41] disabled:pointer-events-none disabled:opacity-30"><Redo2 className="h-4 w-4" /></button>
        </div>
        <button onClick={onRecoverAutosave} disabled={recoveryPointCount === 0} title={currentLanguage === 'es' ? `${recoveryPointCount} puntos de recuperación` : `${recoveryPointCount} recovery points`} aria-label={currentLanguage === 'es' ? 'Historial de recuperación' : 'Recovery history'}
          className="relative rounded-lg border border-[#26354c] bg-[#101a2b] p-2 text-cyan-200 transition hover:bg-[#1d2b41] disabled:pointer-events-none disabled:opacity-35"><History className="h-4 w-4" />{recoveryPointCount > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full border border-[#080f1c] bg-cyan-500 px-1 text-center text-[9px] font-bold leading-4 text-[#06121c]">{recoveryPointCount}</span>}</button>
        <span title={autosaveAvailable ? (currentLanguage === 'es' ? 'Autoguardado local activo' : 'Local autosave active') : (currentLanguage === 'es' ? 'No se pudo guardar en este navegador' : 'Could not save in this browser')} className={`hidden items-center gap-1 text-[10px] xl:flex ${autosaveAvailable ? 'text-emerald-300' : 'text-red-300'}`}>
          {autosaveAvailable ? <CloudCheck className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}{autosaveAvailable ? (currentLanguage === 'es' ? 'Guardado' : 'Saved') : (currentLanguage === 'es' ? 'Sin respaldo' : 'Not saved')}
        </span>
        <button onClick={onExportImage} title={t.exportImage} aria-label={t.exportImage} className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-2.5 py-2 text-xs font-semibold text-[#111827] shadow-sm transition hover:bg-amber-300"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t.exportImage}</span></button>

        <div className="relative">
          <button type="button" onClick={() => setFileMenuOpen(value => !value)} aria-expanded={fileMenuOpen} className="flex items-center gap-1.5 rounded-lg border border-[#2a3b55] bg-[#101a2b] px-2.5 py-2 text-xs transition hover:bg-[#1d2b41]">
            <FolderOpen className="h-3.5 w-3.5 text-amber-300" /><span>{currentLanguage === 'es' ? 'Archivo' : 'File'}</span>
          </button>
          {fileMenuOpen && <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#2b3d58] bg-[#0d1728] p-1.5 shadow-2xl">
            <button className={fileActionClass} onClick={() => runFileAction(onNewProject)}><FilePlus className="h-3.5 w-3.5 text-amber-300" />{t.newProject}</button>
            <button className={fileActionClass} onClick={() => runFileAction(() => fileInputRef.current?.click())}><FolderOpen className="h-3.5 w-3.5 text-cyan-300" />{t.openProject}</button>
            <button className={fileActionClass} onClick={() => runFileAction(onSaveProjectJson)}><Save className="h-3.5 w-3.5 text-emerald-300" />{t.saveProject}</button>
            <div className="my-1 border-t border-[#24334b]" />
            <button className={fileActionClass} onClick={() => runFileAction(onExportCode)}><FileText className="h-3.5 w-3.5" />{t.exportCode}</button>
            <button className={fileActionClass} onClick={() => runFileAction(onImportCode)}><FileText className="h-3.5 w-3.5" />{t.importCode}</button>
            <button className={fileActionClass} onClick={() => runFileAction(onOpenSettings)}><Sliders className="h-3.5 w-3.5" />{t.settings}</button>
            <button className={fileActionClass} onClick={() => runFileAction(onOpenShortcuts)}><Keyboard className="h-3.5 w-3.5" />{t.shortcuts}</button>
          </div>}
        </div>
        <input ref={fileInputRef} type="file" accept=".json,.ckbp.json" onChange={handleFileChange} className="hidden" />
        <button onClick={() => onLanguageChange(currentLanguage === 'es' ? 'en' : 'es')} title={t.language} aria-label={t.language} className="rounded-lg border border-[#26354c] bg-[#101a2b] px-2 py-2 text-[10px] font-bold text-zinc-300 transition hover:text-cyan-200">{currentLanguage.toUpperCase()}</button>
      </div>
    </header>
  );
};
