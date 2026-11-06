import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmUpgrade: () => void;
  reason?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onConfirmUpgrade,
  reason,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="mb-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Assinatura Pro
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1 mb-1">
            FitCoach Pro
          </h2>
          <p className="text-xs text-zinc-400">
            {reason || 'Organize sua rotina de personal com alunos ilimitados e zero anúncios.'}
          </p>
        </div>

        {/* Features Checklist */}
        <div className="space-y-2.5 mb-5 bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 text-xs">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-200">Alunos ilimitados (elimina o teto de 5 alunos)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-200">Zero anúncios e banners na tela</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-200">Cobrança rápida via WhatsApp com chave Pix</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-200">Relatório financeiro mensal completo</span>
          </div>
        </div>

        {/* Billing cycle toggle */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`p-3 rounded-xl border text-left transition ${
              billingCycle === 'monthly'
                ? 'border-zinc-300 bg-zinc-800 text-white'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-[11px] block font-medium">Mensal</span>
            <span className="text-base font-bold text-white block mt-0.5">R$ 19,90</span>
            <span className="text-[10px] text-zinc-500">Cobrado todo mês</span>
          </button>

          <button
            onClick={() => setBillingCycle('yearly')}
            className={`p-3 rounded-xl border text-left transition relative ${
              billingCycle === 'yearly'
                ? 'border-zinc-300 bg-zinc-800 text-white'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-[11px] block font-medium">Anual</span>
            <span className="text-base font-bold text-white block mt-0.5">R$ 149,00</span>
            <span className="text-[10px] text-emerald-400">R$ 12,41/mês (-37%)</span>
          </button>
        </div>

        {/* CTA Button */}
        <button
          onClick={onConfirmUpgrade}
          className="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-white hover:bg-zinc-200 text-zinc-950 transition active:scale-95"
        >
          {billingCycle === 'monthly' ? 'Assinar por R$ 19,90/mês' : 'Assinar por R$ 149,00/ano'}
        </button>

        <p className="text-center text-[11px] text-zinc-500 mt-3">
          Cancele quando quiser diretamente na sua loja de aplicativos.
        </p>
      </div>
    </div>
  );
};
