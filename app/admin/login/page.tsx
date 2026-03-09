"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

function getRegisterErrorMessage(err: unknown): string {
    const defaultMsg = "Erro ao criar conta. Tente novamente.";
    if (!err || typeof err !== "object") return defaultMsg;

    const errorObj = err as { message?: string; status?: number; code?: string };
    const rawMessage = (errorObj.message || "").toLowerCase();

    if (rawMessage.includes("user already registered") || rawMessage.includes("already registered")) {
        return "Este e-mail já está cadastrado. Tente entrar ou use outro e-mail.";
    }
    if (rawMessage.includes("password") && rawMessage.includes("at least")) {
        return "Senha fraca. Use uma senha mais forte com no mínimo 6 caracteres.";
    }
    if (rawMessage.includes("signups not allowed")) {
        return "Cadastro desabilitado no Supabase. Ative o Email Signup em Authentication > Sign In / Providers.";
    }
    if (rawMessage.includes("captcha")) {
        return "Falha de verificação de segurança (captcha). Verifique a configuração do Auth no Supabase.";
    }
    if (rawMessage.includes("database") || rawMessage.includes("trigger")) {
        return "Erro ao salvar o usuário no banco. Verifique o script de admin_approval no Supabase.";
    }
    if (errorObj.status === 422) {
        return "Dados inválidos para cadastro. Revise nome, e-mail e senha.";
    }
    if (errorObj.status === 429) {
        return "Muitas tentativas em sequência. Aguarde e tente novamente.";
    }
    if (rawMessage) {
        return `Não foi possível criar a conta: ${errorObj.message}`;
    }
    return defaultMsg;
}

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nome, setNome] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isRegistering) {
                if (nome.trim().length < 3) {
                    throw new Error("Nome inválido");
                }
                if (password.length < 6) {
                    throw new Error("Senha inválida");
                }

                // Registro (Cria a conta)
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            nome: nome.trim()
                        }
                    }
                });

                if (signUpError) throw signUpError;

                // Redireciona para aviso de conta criada e pendente
                router.push("/admin/pendente");

            } else {
                // Login normal
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (authError) throw authError;

                router.push("/admin/dashboard");
                router.refresh();
            }
        } catch (err: unknown) {
            if (isRegistering) {
                const maybeError = err as { message?: string };
                if (maybeError?.message === "Nome inválido") {
                    setError("Informe seu nome completo (mínimo 3 caracteres).");
                } else if (maybeError?.message === "Senha inválida") {
                    setError("A senha deve ter pelo menos 6 caracteres.");
                } else {
                    console.error("Erro detalhado no cadastro admin:", err);
                    setError(getRegisterErrorMessage(err));
                }
            } else {
                setError("Email ou senha inválidos. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[oklch(0.08_0_0)] text-white relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="glass p-8 rounded-3xl w-full max-w-md relative z-10 border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl gradient-blue flex items-center justify-center mx-auto mb-6 glow-blue shadow-[0_0_30px_rgba(1,111,230,0.5)]">
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Painel de Avaliação</h1>
                    <p className="text-gray-400">Gerenciamento administrativo</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => { setIsRegistering(false); setError(""); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${!isRegistering ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Entrar
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsRegistering(true); setError(""); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${isRegistering ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Criar Conta
                    </button>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Nome completo</label>
                            <input
                                type="text"
                                required
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-white/10 transition-all outline-none"
                                placeholder="Seu nome"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">E-mail</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-white/10 transition-all outline-none"
                            placeholder="admin@sistemamilionario.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Senha {isRegistering && "(mínimo 6 caracteres)"}</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-white/10 transition-all outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl gradient-blue text-white font-bold text-lg mt-6 hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all glow-blue flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : isRegistering ? "Finalizar Cadastro" : "Acessar Painel"}
                    </button>
                </form>
            </div>
        </div>
    );
}
