import React, { useState, useEffect } from 'react';
import { X, Database, Key, Check, ExternalLink, Copy } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      setStatusMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      setStatusMessage('Preencha a URL e a Chave Anon do seu projeto Supabase.');
      return;
    }
    if (!url.startsWith('https://') || !url.includes('supabase.co')) {
      setStatusMessage('A URL deve ter o formato https://seu-projeto.supabase.co');
      return;
    }

    saveSupabaseCredentials(url, anonKey);
    setStatusMessage('Chaves salvas com sucesso! Conectando...');
    setTimeout(() => {
      onConnected();
      onClose();
    }, 600);
  };

  const handleCopySql = () => {
    fetch('./supabase/schema.sql')
      .then((res) => res.text())
      .catch(() => '')
      .then((sqlText) => {
        if (!sqlText) {
          // Fallback simple message or copy indicator
          navigator.clipboard.writeText(
            `-- Script do FitCoach Pro está disponível em /supabase/schema.sql no repositório`
          );
        } else {
          navigator.clipboard.writeText(sqlText);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Conectar Banco Supabase</h2>
            <span className="text-[11px] text-zinc-400">Armazenamento em nuvem PostgreSQL e autenticação</span>
          </div>
        </div>

        {/* Step by step guide */}
        <div className="my-4 p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 text-xs text-zinc-300">
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-zinc-800 text-[10px] font-bold flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
              1
            </span>
            <p>
              Acesse seu projeto no{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-0.5 font-medium"
              >
                painel do Supabase <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-zinc-800 text-[10px] font-bold flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
              2
            </span>
            <p>
              Vá em <strong>Project Settings → API</strong> e copie a <strong>Project URL</strong> e a{' '}
              <strong>anon public key</strong>.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-zinc-800 text-[10px] font-bold flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
              3
            </span>
            <p>
              No Supabase, vá em <strong>SQL Editor</strong> e execute o script das tabelas (arquivo{' '}
              <code className="text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded">schema.sql</code> já criado).
            </p>
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              API Key (anon public)
            </label>
            <textarea
              rows={3}
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 font-mono resize-none"
            />
          </div>

          {statusMessage && (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
              {statusMessage}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={handleSave}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Salvar e Conectar
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl font-medium text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
