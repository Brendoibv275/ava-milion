"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UserCheck, UserX, Loader2, KeyRound } from "lucide-react";

export default function ConfiguracoesPage() {
    const supabase = createClient();
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passLoading, setPassLoading] = useState(false);
    const [passMsg, setPassMsg] = useState({ type: "", text: "" });

    const loadUsuarios = async () => {
        setLoading(true);
        const { data } = await supabase.from("admin_users").select("*").order("created_at", { ascending: false });
        if (data) {
            setUsuarios(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUsuarios();
    }, []);

    const toggleAprovacao = async (id: string, atual: boolean) => {
        const { error } = await supabase
            .from("admin_users")
            .update({ is_approved: !atual })
            .eq("id", id);

        if (!error) {
            loadUsuarios();
        } else {
            alert("Erro ao alterar usuário.");
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassMsg({ type: "", text: "" });

        if (newPassword.length < 6) {
            setPassMsg({ type: "error", text: "A senha precisa ter pelo menos 6 caracteres." });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPassMsg({ type: "error", text: "As senhas não coincidem." });
            return;
        }

        setPassLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            setPassMsg({ type: "error", text: "Erro ao atualizar senha. Tente novamente." });
        } else {
            setPassMsg({ type: "success", text: "Senha atualizada com sucesso!" });
            setNewPassword("");
            setConfirmPassword("");
        }
        setPassLoading(false);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold text-white">Configurações</h1>
                <p className="text-gray-400 mt-1">Gerencie sua conta e controle de acesso ao painel.</p>
            </div>

            {/* Mudar Senha */}
            <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <KeyRound className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Alterar Senha</h2>
                        <p className="text-sm text-gray-400">Atualize a senha de acesso da sua conta.</p>
                    </div>
                </div>

                <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                    {passMsg.text && (
                        <div className={`p-3 rounded-xl border text-sm ${passMsg.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-green-500/10 border-green-500/20 text-green-400"}`}>
                            {passMsg.text}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Nova Senha</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-white/10 transition-all outline-none"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-white/10 transition-all outline-none"
                            placeholder="Repita a nova senha"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={passLoading}
                        className="py-3 px-6 rounded-xl gradient-blue text-white font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {passLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Salvar Nova Senha
                    </button>
                </form>
            </div>

            {/* Administradores */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Administradores do Painel</h2>

                <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-300">Data Cadastro</th>
                                <th className="p-4 text-sm font-semibold text-gray-300">Nome</th>
                                <th className="p-4 text-sm font-semibold text-gray-300">Email</th>
                                <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-300 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Carregando usuários...</td></tr>
                            ) : usuarios.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum administrador encontrado.</td></tr>
                            ) : (
                                usuarios.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-gray-400 text-sm">
                                            {format(new Date(u.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                        </td>
                                        <td className="p-4 font-medium text-white">{u.nome || "Não definido"}</td>
                                        <td className="p-4 text-blue-400 text-sm">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${u.is_approved ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                                                {u.is_approved ? "APROVADO" : "PENDENTE"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => toggleAprovacao(u.id, u.is_approved)}
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${u.is_approved
                                                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                                                    : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20"
                                                    }`}
                                            >
                                                {u.is_approved ? <><UserX className="w-4 h-4" /> Revogar</> : <><UserCheck className="w-4 h-4" /> Aprovar</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
