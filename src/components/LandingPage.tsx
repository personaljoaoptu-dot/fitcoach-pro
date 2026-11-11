import React, { useState } from 'react';
import {
  Dumbbell,
  Check,
  ArrowRight,
  MessageCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Smartphone,
  Flame,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onStartFree: () => void;
  onLogin: () => void;
  onOpenCheckout?: (plan?: 'monthly' | 'yearly') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartFree,
  onLogin,
  onOpenCheckout,
}) => {
  // Calculator state
  const [studentCount, setStudentCount] = useState<number>(12);
  const [averageFee, setAverageFee] = useState<number>(350);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Calculations
  const monthlyRevenue = studentCount * averageFee;
  const hoursSavedPerMonth = Math.round(studentCount * 1.5);
  const costPro = 19.90;
  const costPercentage = ((costPro / (monthlyRevenue || 1)) * 100).toFixed(1);

  const faqs = [
    {
      q: 'Preciso pagar para começar?',
      a: 'Não! O FitCoach Pro possui um plano gratuito permanente para até 5 alunos com todas as funções liberadas. Você só assina o Pro (R$ 19,90/mês) quando ultrapassar 5 alunos.',
    },
    {
      q: 'Funciona no iPhone e no Android?',
      a: 'Sim! O FitCoach Pro é um PWA moderno. Você pode acessá-lo pelo navegador ou adicioná-lo à tela de início do seu celular com um toque, funcionando exatamente como um aplicativo nativo.',
    },
    {
      q: 'Meus dados ficam seguros na nuvem?',
      a: 'Sim. Seus dados são salvos em um banco de dados PostgreSQL dedicado com criptografia e segurança de nível bancário (Row-Level Security). Nenhum outro usuário ou personal tem acesso aos seus alunos ou finanças.',
    },
    {
      q: 'Como funciona a cobrança com Pix no WhatsApp?',
      a: 'Com apenas um clique, o app gera uma mensagem educada e personalizada com o nome do aluno, valor da mensalidade e sua chave Pix pronta para copiar. Para alunos avulsos, ele ainda lista as datas exatas das aulas realizadas no mês.',
    },
    {
      q: 'Posso cancelar a assinatura Pro quando quiser?',
      a: 'Sim, sem fidelidade e sem multas. Você cancela com um clique a qualquer momento.',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Top Navigation */}
      <nav className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="font-bold text-white tracking-tight text-base">FitCoach Pro</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogin}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
            >
              Entrar
            </button>
            <button
              onClick={onStartFree}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 transition active:scale-95 shadow-xs"
            >
              Começar Grátis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 pt-14 pb-16 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Feito sob medida para o Personal Trainer brasileiro</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-3xl mx-auto">
          Toda a sua rotina de personal organizada.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            Sem planilhas perdidas, sem calotes no Pix.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Controle mensalidades, alunos presenciais e consultorias, fichas de treino com cárdio e despesas em um só lugar. No celular e no computador.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartFree}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <span>Criar Minha Conta Grátis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onLogin}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition"
          >
            Já tenho uma conta
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 pt-2">
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Grátis até 5 alunos
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Sem cartão para testar
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Instala no celular
          </span>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section className="px-4 py-12 bg-zinc-900/50 border-y border-zinc-800/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Simule seus ganhos
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Quanto tempo e dinheiro você economiza por mês?
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Arraste os seletores para ver o impacto direto na sua rotina.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-xs font-semibold text-zinc-300">Quantidade de Alunos</label>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {studentCount} alunos
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-xs font-semibold text-zinc-300">Mensalidade Média</label>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    R$ {averageFee.toLocaleString('pt-BR')} / mês
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="20"
                  value={averageFee}
                  onChange={(e) => setAverageFee(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs text-zinc-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  O plano Pro (R$ 19,90) se paga com apenas <strong>15 minutos</strong> de uma única aula no mês inteiro.
                </span>
              </div>
            </div>

            {/* Results Output */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Faturamento Mensal Estimado
                </span>
                <div className="text-3xl font-extrabold text-white tracking-tight mt-1">
                  R$ {monthlyRevenue.toLocaleString('pt-BR')},00
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                <div>
                  <span className="text-[11px] text-zinc-500 block">Tempo Economizado</span>
                  <span className="text-lg font-bold text-emerald-400">~{hoursSavedPerMonth}h / mês</span>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Menos tempo cobrando e organizando</p>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-500 block">Custo do FitCoach Pro</span>
                  <span className="text-lg font-bold text-white">{costPercentage}%</span>
                  <p className="text-[10px] text-zinc-500 mt-0.5">do seu faturamento mensal</p>
                </div>
              </div>

              <button
                onClick={onStartFree}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95 text-center mt-2"
              >
                Começar a Organizar Meus {studentCount} Alunos Agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Feito para quem vive na academia
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Resolva as 4 maiores dores da sua rotina
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Cobrança WhatsApp */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Cobrança e Recibo Pix em 1 Clique</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Chega de ficar com vergonha de cobrar ou esquecer quem já pagou. O app monta a mensagem personalizada com chave Pix e envia direto no WhatsApp do aluno. Pagou? Gere o recibo na hora.
            </p>
          </div>

          {/* Card 2: Alunos Avulsos e Reposições */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Alunos Avulsos & Banco de Reposições</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Para quem paga por aula realizada, o app anota os dias certinhos e soma o valor automaticamente. Aluno faltou? O app credita reposição automática para ninguém se perder.
            </p>
          </div>

          {/* Card 3: Musculação + Cárdio com Pace */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Fichas de Treino com Cárdio Completo</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Monte treinos A, B, C e D em segundos. Além de cargas de musculação, registre esteira, bike, km, tempo, ritmo (pace) e frequência cardíaca. Seu aluno ainda recebe o treino no celular!
            </p>
          </div>

          {/* Card 4: Fluxo de Caixa e Despesas */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Lucro Líquido Real no Bolso</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Controle suas despesas profissionais (CREF, transporte, suplementos, academia). Veja quanto realmente sobrou no seu bolso no mês: <em>Recebido menos Despesas Pagas</em>.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-16 bg-zinc-900/40 border-t border-zinc-800/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Planos transparentes
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Comece de graça. Escale quando crescer.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free Plan */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-400">Plano Gratuito</span>
                <div className="text-3xl font-bold text-white mt-1 mb-2">R$ 0</div>
                <p className="text-xs text-zinc-400 mb-5">
                  Ideal para quem está começando e quer organizar os primeiros alunos.
                </p>

                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Até 5 alunos cadastrados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cobrança via WhatsApp com Pix</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Fichas A/B/C/D e Cárdio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Controle de despesas básicas</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onStartFree}
                className="w-full mt-6 py-2.5 rounded-xl font-semibold text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition active:scale-95"
              >
                Criar Conta Grátis
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-zinc-900 border-2 border-emerald-500 rounded-3xl p-6 flex flex-col justify-between relative shadow-xl shadow-emerald-500/5">
              <span className="absolute -top-3 right-6 bg-emerald-500 text-zinc-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Mais Popular
              </span>

              <div>
                <span className="text-xs font-semibold text-emerald-400">FitCoach Pro</span>
                <div className="flex items-baseline gap-1 mt-1 mb-2">
                  <span className="text-3xl font-bold text-white">R$ 19,90</span>
                  <span className="text-xs text-zinc-500">/ mês</span>
                </div>
                <p className="text-xs text-zinc-400 mb-5">
                  Ou R$ 149,00 no plano anual (sai a apenas <strong>R$ 12,41/mês</strong>).
                </p>

                <div className="space-y-2.5 text-xs text-zinc-200">
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Alunos ILIMITADOS (sem teto)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Backup ilimitado na nuvem Supabase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Portal exclusivo de treino para o aluno</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Relatório financeiro mensal completo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Suporte prioritário via WhatsApp</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onOpenCheckout) {
                    onOpenCheckout('monthly');
                  } else {
                    onStartFree();
                  }
                }}
                className="w-full mt-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95 shadow-md shadow-emerald-500/20"
              >
                Assinar FitCoach Pro (Pix Instantâneo)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Tire suas dúvidas
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-zinc-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="px-4 py-16 bg-gradient-to-b from-zinc-950 to-zinc-900 border-t border-zinc-800 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight max-w-xl mx-auto">
          Pronto para profissionalizar sua rotina de personal?
        </h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Comece agora mesmo em menos de 1 minuto, sem precisar cadastrar cartão de crédito.
        </p>
        <button
          onClick={onStartFree}
          className="px-8 py-3.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95 shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2"
        >
          <span>Criar Minha Conta Grátis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 px-4 text-center text-xs text-zinc-600">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-white">FitCoach Pro</span>
            <span>• O app do Personal Trainer</span>
          </div>
          <div className="text-[11px] text-zinc-500">
            © {new Date().getFullYear()} FitCoach Pro. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};
