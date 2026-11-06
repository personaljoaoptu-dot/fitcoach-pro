import React, { useState } from 'react';
import { Dumbbell, Lock, Mail, User, ArrowRight, Database, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getSupabaseClient, getSupabaseCredentials } from '../lib/supabase';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
  onContinueGuest: () => void;
  onOpenConfig: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onContinueGuest,
  onOpenConfig,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { isConfigured } = getSupabaseCredentials();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isConfigured) {
      setErrorMessage('O banco Supabase ainda não foi configurado. Clique no botão de configuração abaixo para inserir sua URL e Anon Key.');
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setErrorMessage('Erro ao conectar com cliente Supabase.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Preencha seu e-mail e sua senha.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('E-mail ou senha incorretos.');
        } else {
          setErrorMessage(error.message);
        }
      } else if (data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isConfigured) {
      setErrorMessage('Configure as chaves do seu Supabase antes de cadastrar novos usuários.');
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setErrorMessage('Erro ao conectar com cliente Supabase.');
      return;
    }

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Preencha nome completo, e-mail e senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else if (data.user) {
        // If email confirmation is enabled in Supabase
        if (data.session) {
          onLoginSuccess(data.user);
        } else {
          setSuccessMessage('Conta criada com sucesso! Verifique seu e-mail para confirmar seu cadastro ou faça login.');
          setTab('login');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isConfigured) {
      setErrorMessage('O banco Supabase não está configurado.');
      return;
    }

    const client = getSupabaseClient();
    if (!client) return;

    if (!email.trim()) {
      setErrorMessage('Informe seu e-mail para recuperar a senha.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await client.auth.resetPasswordForEmail(email.trim());
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage('Link de recuperação enviado para o seu e-mail!');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-emerald-400 mb-3 shadow-lg">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">FitCoach Pro</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Gestão financeira, treinos e agenda para Personal Trainers
          </p>
        </div>

        {/* Supabase status indicator */}
        <div className="mb-4">
          {isConfigured ? (
            <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Banco Supabase Conectado
              </span>
              <button
                onClick={onOpenConfig}
                className="text-[10px] text-zinc-400 hover:text-white underline underline-offset-2"
              >
                Alterar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Supabase não conectado
              </span>
              <button
                onClick={onOpenConfig}
                className="text-[10px] font-semibold text-amber-300 hover:underline inline-flex items-center gap-1"
              >
                <Database className="w-3 h-3" />
                Configurar
              </button>
            </div>
          )}
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          {/* Tabs */}
          {tab !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800/80 mb-5">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                  tab === 'login'
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                  tab === 'register'
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Criar Conta
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  E-mail do Personal
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: joao.personal@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-zinc-400">
                    Sua Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-[10px] text-zinc-400 hover:text-emerald-400"
                  >
                    Esqueceu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? 'Acessando...' : 'Entrar no FitCoach'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Form: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Seu Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: João Silva"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Seu E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: joao.personal@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Crie uma Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? 'Cadastrando...' : 'Criar Minha Conta Grátis'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Form: FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <p className="text-xs text-zinc-300">
                Digite seu e-mail cadastrado para enviarmos as instruções de redefinição de senha.
              </p>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  E-mail cadastrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: joao.personal@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="flex-1 py-2 px-3 rounded-xl font-medium text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-3 rounded-xl font-semibold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Link'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Demo / Guest mode fallback */}
        <div className="mt-4 text-center space-y-2">
          <button
            onClick={onContinueGuest}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition py-1 px-3 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
          >
            Continuar em modo offline / teste local →
          </button>
        </div>
      </div>
    </div>
  );
};
