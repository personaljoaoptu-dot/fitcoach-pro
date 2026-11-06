import React from 'react';
import { Settings } from 'lucide-react';
import { PersonalProfile } from '../types';

interface HeaderProps {
  profile: PersonalProfile;
  onOpenUpgrade: () => void;
  onOpenProfile: () => void;
  onTogglePlanSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenUpgrade,
  onOpenProfile,
  onTogglePlanSimulation,
}) => {
  const isPro = profile.plan === 'pro';

  // Get initials
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-30 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center border border-zinc-700 transition"
            title="Editar perfil"
          >
            {initials || 'PT'}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                {profile.name}
              </span>
              {isPro ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Pro
                </span>
              ) : (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  Free
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 leading-none mt-0.5">
              Gestão de Treinos & Mensalidades
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick simulation button to test the UX */}
          <button
            onClick={onTogglePlanSimulation}
            className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition"
            title="Alternar entre plano Free e Pro para testar"
          >
            Modo de teste: <span className="font-semibold text-zinc-200">{isPro ? 'Pro' : 'Free'}</span>
          </button>

          {!isPro && (
            <button
              onClick={onOpenUpgrade}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 transition active:scale-95"
            >
              Assinar Pro
            </button>
          )}

          <button
            onClick={onOpenProfile}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
            title="Configurações da conta"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
