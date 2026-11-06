import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Upload, ShieldCheck } from 'lucide-react';
import { PersonalProfile } from '../types';
import { exportBackupAsJson, exportStudentsAsCsv } from '../utils/storage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PersonalProfile;
  onSaveProfile: (profile: PersonalProfile) => void;
  onRestoreBackup: (jsonContent: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onRestoreBackup,
}) => {
  const [formData, setFormData] = useState<PersonalProfile>({ ...profile });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onRestoreBackup(content);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-base font-bold text-white mb-1">Configurações & Backup</h2>
        <p className="text-xs text-zinc-400 mb-5">
          Configure sua chave Pix e exporte cópias de segurança dos seus alunos
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs pb-5 border-b border-zinc-800">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Seu nome ou marca</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
              placeholder="Ex: Lucas Personal"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Seu WhatsApp</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
              placeholder="Ex: 11999998888"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block font-medium text-zinc-300 mb-1">Tipo de Pix</label>
              <select
                value={formData.pixKeyType}
                onChange={(e) =>
                  setFormData({ ...formData, pixKeyType: e.target.value as PersonalProfile['pixKeyType'] })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
              >
                <option value="email">E-mail</option>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="phone">Celular</option>
                <option value="random">Aleatória</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block font-medium text-zinc-300 mb-1">Chave Pix</label>
              <input
                type="text"
                required
                value={formData.pixKey}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
                placeholder="suachave@email.com"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs bg-white hover:bg-zinc-200 text-zinc-950 transition active:scale-95"
            >
              Salvar Dados
            </button>
          </div>
        </form>

        {/* SEÇÃO DE BACKUP & EXPORTAÇÃO */}
        <div className="pt-4 space-y-3">
          <div>
            <span className="text-xs font-bold text-white block">Cópia de Segurança & Exportação</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Baixe os dados para nunca perder nada ou envie para o Excel
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={exportBackupAsJson}
              className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Backup Geral (JSON)</span>
            </button>

            <button
              type="button"
              onClick={exportStudentsAsCsv}
              className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Excel (CSV)</span>
            </button>
          </div>

          {/* Restaurar Backup */}
          <div className="pt-2">
            <label className="w-full p-2.5 rounded-lg bg-zinc-950 border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-xs flex items-center justify-center gap-2 cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" />
              <span>Restaurar dados de um backup (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-zinc-500 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Seus dados ficam salvos com segurança no seu dispositivo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
