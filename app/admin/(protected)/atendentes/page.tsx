"use client";

import { useState, useEffect } from "react";
import { Plus, Check, X } from "lucide-react";

export default function AtendentesPage() {
    const [atendentes, setAtendentes] = useState<any[]>([]);
    const [novoModal, setNovoModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ nome: "", email: "", categorias: [] as string[] });

    const fecthAtendentes = () => {
        fetch("/api/atendentes").then(r => r.json()).then(setAtendentes);
    };

    useEffect(() => {
        fecthAtendentes();
    }, []);

    const toggleCategoria = (c: string) => {
        setForm(f => ({
            ...f,
            categorias: f.categorias.includes(c) ? f.categorias.filter(x => x !== c) : [...f.categorias, c]
        }));
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nome || form.categorias.length === 0) return alert("Preencha o nome e pelo menos 1 categoria.");

        setLoading(true);
        await fetch("/api/atendentes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });
        setLoading(false);
        setNovoModal(false);
        setForm({ nome: "", email: "", categorias: [] });
        fecthAtendentes();
    };

    const toggleAtivo = async (id: string, ativoAtual: boolean) => {
        await fetch(`/api/atendentes/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ativo: !ativoAtual })
        });
        fecthAtendentes();
    };

    return (
        <div className="space-y-8 animate-fade-in relative max-w-4xl">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Equipe de Atendimento</h1>
                    <p className="text-gray-400 mt-1">Gerencie os atendentes e seus canais de suporte.</p>
                </div>
                <button
                    onClick={() => setNovoModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 glow-blue"
                >
                    <Plus className="w-5 h-5" /> Adicionar Atendente
                </button>
            </div>

            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-300">Nome</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Canais Autorizados</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
                            <th className="p-4 text-sm font-semibold text-gray-300 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {atendentes.map(a => (
                            <tr key={a.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-white">{a.nome}</td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {a.atendente_categorias.map((c: any) => (
                                            <span key={c.suporte} className="text-xs px-2 py-1 bg-white/10 text-gray-300 rounded-md">
                                                {c.suporte}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-lg ${a.ativo ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-500"}`}>
                                        {a.ativo ? "ATIVO" : "INATIVO"}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => toggleAtivo(a.id, a.ativo)}
                                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${a.ativo ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                                            }`}
                                    >
                                        {a.ativo ? "Desativar" : "Reativar"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {atendentes.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">Nenhum atendente cadastrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Novo Atendente */}
            {novoModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <form onSubmit={handleSalvar} className="glass p-6 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl animate-scale-in">
                            <h2 className="text-xl font-bold text-white mb-6">Novo Atendente</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Nome Completo</label>
                                    <input
                                        type="text" required
                                        value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Email (Opcional)</label>
                                    <input
                                        type="email"
                                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Canais Autorizados</label>
                                    <div className="flex flex-col gap-2">
                                        {["SISTEMA", "MENTORIA", "AULA"].map(c => (
                                            <button
                                                key={c} type="button" onClick={() => toggleCategoria(c)}
                                                className={`flex justify-between items-center px-4 py-3 rounded-lg border text-sm transition-colors ${form.categorias.includes(c) ? "border-blue-500 bg-blue-500/10 text-white" : "border-white/10 bg-white/5 text-gray-400"
                                                    }`}
                                            >
                                                {c}
                                                {form.categorias.includes(c) && <Check className="w-4 h-4 text-blue-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button type="button" onClick={() => setNovoModal(false)} className="flex-1 py-3 text-gray-400 hover:bg-white/5 rounded-xl transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white hover:bg-blue-500 rounded-xl font-medium transition-colors">
                                    {loading ? "Salvando..." : "Salvar Atendente"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
