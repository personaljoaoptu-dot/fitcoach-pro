import React from 'react';

interface AdBannerProps {
  onUpgrade: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ onUpgrade }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-3">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[9px] uppercase tracking-wider font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded shrink-0">
            Anúncio
          </span>
          <span className="text-zinc-300 truncate">
            Smart Fit Coach: Encontre novos alunos particulares na sua região.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onUpgrade}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 underline decoration-zinc-600 transition"
          >
            Remover anúncios
          </button>
        </div>
      </div>
    </div>
  );
};
