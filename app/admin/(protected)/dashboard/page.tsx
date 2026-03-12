"use client";

import { useState, useEffect } from "react";
import { Users, CheckCircle, Star, TrendingUp } from "lucide-react";

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("TODOS");
    const [periodo, setPeriodo] = useState("30");

    useEffect(() => {
        setLoading(true);
        const url = filtro === "TODOS" ? `/api/dashboard?dias=${periodo}` : `/api/dashboard?dias=${periodo}&tipo=${filtro}`;
        fetch(url)
            .then((r) => r.json())
            .then((d) => {
                setData(d);
                setLoading(false);
            });
    }, [filtro, periodo]);

    if (loading) return <div className="animate-pulse flex items-center justify-center p-12 text-gray-400">Carregando dashboard...</div>;

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in w-full min-w-0">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Dashboard Escalação</h1>
                    <p className="text-gray-400 mt-1">Visão geral das métricas de atendimento.</p>
                </div>
                <div className="flex flex-col gap-3 min-w-0">
                    <div className="overflow-x-auto max-w-full scrollbar-thin pb-1">
                        <div className="flex w-max bg-white/5 border border-white/10 p-1 rounded-xl">
                        {[
                            { v: "7", l: "7 Dias" },
                            { v: "30", l: "Último Mês" },
                            { v: "90", l: "Trimestre" },
                            { v: "365", l: "1 Ano" },
                            { v: "tudo", l: "Tudo" }
                        ].map(p => (
                            <button
                                key={p.v}
                                onClick={() => setPeriodo(p.v)}
                                className={`px-4 py-2 min-h-11 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${periodo === p.v ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                {p.l}
                            </button>
                        ))}
                    </div>
                    </div>

                    <div className="overflow-x-auto max-w-full scrollbar-thin pb-1">
                        <div className="flex w-max bg-white/5 border border-white/10 p-1 rounded-xl">
                        {["TODOS", "SISTEMA", "MENTORIA", "AULA"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFiltro(f)}
                                className={`px-4 py-2 min-h-11 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filtro === f ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                {f === "TODOS" ? "Todos" : f}
                            </button>
                        ))}
                    </div>
                    </div>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Users className="w-5 h-5" /></div>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">Total de Avaliações</h3>
                    <p className="text-3xl font-bold text-white mt-1">{data?.total || 0}</p>
                </div>

                <div className="glass p-6 rounded-2xl border border-white/10 hover:border-green-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 text-green-400 rounded-xl"><Star className="w-5 h-5" /></div>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">Nota Média Geral</h3>
                    <p className="text-3xl font-bold text-white mt-1">{data?.mediaGeral?.toFixed(1) || "0.0"}</p>
                </div>

                <div className="glass p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><CheckCircle className="w-5 h-5" /></div>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">Problemas Resolvidos</h3>
                    <p className="text-3xl font-bold text-white mt-1">{data?.pctResolvidos || 0}%</p>
                </div>

                <div className="glass p-6 rounded-2xl border border-white/10 hover:border-orange-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">Atendentes Ativos</h3>
                    <p className="text-3xl font-bold text-white mt-1">{data?.atendenteAtivos || 0}</p>
                </div>
            </div>

            {/* Ranking */}
            <div className="glass p-4 md:p-6 rounded-2xl border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6">Ranking de Atendentes</h2>
                <p className="text-sm text-gray-400 mb-4">
                    Ordenado por quantidade de atendimentos no período; a nota média é usada como critério de desempate.
                </p>
                <div className="overflow-x-auto max-w-full">
                    <table className="w-full min-w-[680px] text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-3 font-medium">Posição</th>
                                <th className="pb-3 font-medium">Atendente</th>
                                <th className="pb-3 font-medium">Canais</th>
                                <th className="pb-3 font-medium">Avaliações</th>
                                <th className="pb-3 font-medium">Nota Média</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {data?.rankingAtendentes?.map((atendente: any, i: number) => (
                                <tr key={atendente.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 font-bold text-gray-500">#{i + 1}</td>
                                    <td className="py-4 font-medium text-white">{atendente.nome}</td>
                                    <td className="py-4">
                                        <div className="flex gap-2">
                                            {atendente.categorias.map((c: string) => (
                                                <span key={c} className="text-xs px-2 py-1 bg-white/10 rounded-md text-gray-300">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-4 text-gray-400">{atendente.total} avaliações</td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="font-bold text-white">{atendente.media.toFixed(1)}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!data?.rankingAtendentes || data.rankingAtendentes.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">Nenhum dado encontrado no período.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
