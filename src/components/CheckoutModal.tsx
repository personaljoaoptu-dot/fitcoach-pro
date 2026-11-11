import React, { useState, useEffect } from 'react';
import { X, QrCode, Copy, Check, ShieldCheck, Zap, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import QRCode from 'qrcode';
import { generatePixPayload } from '../utils/pix';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trainerEmail?: string | null;
  defaultPlan?: 'monthly' | 'yearly';
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  trainerEmail,
  defaultPlan = 'monthly',
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(defaultPlan);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [pixPayload, setPixPayload] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes

  const amount = billingCycle === 'monthly' ? 19.90 : 149.00;
  const pixKey = 'personal.joaoptu@gmail.com'; // Master receiver Pix Key or configurable

  useEffect(() => {
    if (isOpen) {
      setIsPaid(false);
      setIsProcessing(false);
      setTimeLeft(900);
      const payload = generatePixPayload(
        pixKey,
        'FITCOACH PRO ASSINATURA',
        'SAO PAULO',
        amount,
        billingCycle === 'monthly' ? 'MENSAL19' : 'ANUAL149'
      );
      setPixPayload(payload);

      QRCode.toDataURL(payload, {
        width: 260,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Erro ao gerar QR Code Pix:', err));
    }
  }, [isOpen, billingCycle, amount]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1600);
    }, 1200);
  };

  const formatMinutes = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {isPaid ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Pagamento Confirmado!</h3>
            <p className="text-xs text-zinc-300 max-w-xs mx-auto">
              Parabéns! Sua assinatura do <strong>FitCoach Pro</strong> está ativa. Alunos ilimitados liberados!
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Checkout Seguro via Pix
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Assinar FitCoach Pro
              </h2>
              <p className="text-xs text-zinc-400">
                Liberação instantânea com alunos ilimitados e relatórios completos.
              </p>
            </div>

            {/* Plan Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`p-3 rounded-xl border text-left transition ${
                  billingCycle === 'monthly'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="text-[11px] block font-medium">Plano Mensal</span>
                <span className="text-base font-bold text-white block mt-0.5">R$ 19,90</span>
                <span className="text-[10px] text-zinc-400">Cobrado por mês</span>
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`p-3 rounded-xl border text-left transition relative ${
                  billingCycle === 'yearly'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="text-[11px] block font-medium">Plano Anual</span>
                <span className="text-base font-bold text-white block mt-0.5">R$ 149,00</span>
                <span className="text-[10px] text-emerald-400">R$ 12,41/mês (-37%)</span>
              </button>
            </div>

            {/* Pix QR Code Container */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 text-center mb-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 px-1">
                <span className="flex items-center gap-1 font-medium">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  Pague com Pix Instantâneo
                </span>
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                  <Clock className="w-3 h-3" />
                  Expira em {formatMinutes(timeLeft)}
                </span>
              </div>

              {qrCodeDataUrl ? (
                <div className="inline-block p-2 bg-white rounded-xl shadow-lg mb-3">
                  <img src={qrCodeDataUrl} alt="QR Code Pix" className="w-48 h-48 mx-auto" />
                </div>
              ) : (
                <div className="w-48 h-48 bg-zinc-900 rounded-xl mx-auto flex items-center justify-center text-xs text-zinc-500">
                  Gerando QR Code...
                </div>
              )}

              <p className="text-[11px] text-zinc-400 mb-3">
                Abra o app do seu banco e escaneie o código acima, ou copie o código Pix abaixo:
              </p>

              {/* Copy Paste Code */}
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 pl-3">
                <input
                  type="text"
                  readOnly
                  value={pixPayload}
                  className="bg-transparent text-[11px] text-zinc-300 font-mono flex-1 outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center gap-1 transition shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Pix</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-zinc-950" />
                <span>
                  {isProcessing ? 'Validando recebimento...' : 'Já realizei o pagamento (Liberar Pro)'}
                </span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Garantia de 7 dias incondicional • Cancele quando quiser</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
