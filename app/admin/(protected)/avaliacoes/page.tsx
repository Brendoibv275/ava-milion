"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Filter, Star } from "lucide-react";
import { SUGESTOES_AULA } from "@/lib/utils";

export default function AvaliacoesPage() {
    const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
    const [atendentes, setAtendentes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("TODOS");
    const [periodo, setPeriodo] = useState("30");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [atendenteId, setAtendenteId] = useState("");
    const [detalhesSelecionados, setDetalhesSelecionados] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();

        if (periodo !== "tudo") {
            params.set("dias", periodo);
        }

        if (filtro !== "TODOS") {
            params.set("tipo", filtro);
        }
        if (dataInicio) params.set("dataInicio", dataInicio);
        if (dataFim) params.set("dataFim", dataFim);
        if (atendenteId) params.set("atendenteId", atendenteId);

        const url = `/api/avaliacoes?${params.toString()}`;

        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                setAvaliacoes(data);
                setLoading(false);
            });
    }, [filtro, periodo, dataInicio, dataFim, atendenteId]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (filtro !== "TODOS") {
            params.set("suporte", filtro);
        }

        const url = `/api/atendentes${params.toString() ? `?${params.toString()}` : ""}`;

        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                const lista = Array.isArray(data) ? data : [];
                setAtendentes(lista);
                if (atendenteId && !lista.some((a: any) => a.id === atendenteId)) {
                    setAtendenteId("");
                }
            });
    }, [filtro]);

    const exportarCSV = () => {
        if (avaliacoes.length === 0) return;

        const formatarMotivoContato = (avaliacao: any) => {
            if (avaliacao.tipo === "AULA") return avaliacao.motivoContato || "";
            if (avaliacao.motivoContato === "outros") return avaliacao.motivoOutros || "";
            return (avaliacao.motivoContato || "").replace(/_/g, " ");
        };

        const cabecalho = [
            "ID", "Data", "Tipo", "Nome Cliente", "Email Cliente",
            "Motivo Contato", "Motivo Outros", "Problema Resolvido",
            "Atendente", "Nota", "Opiniao Pessoal", "Sugestoes",
            "Sugestoes Outros", "Recomenda", "Circle Nota", "Circle Sugestoes"
        ].join(",");

        const linhas = avaliacoes.map(a => {
            const dataStr = new Date(a.created_at).toISOString();

            let sugestoesFormatadas = "";
            if (a.sugestoes) {
                const arr = typeof a.sugestoes === 'string' ? JSON.parse(a.sugestoes) : a.sugestoes;
                sugestoesFormatadas = arr.join(";");
            }

            return [
                a.id,
                dataStr,
                a.tipo,
                `"${a.nomeCliente || ''}"`,
                `"${a.emailCliente || ''}"`,
                `"${formatarMotivoContato(a).replace(/"/g, '""')}"`,
                `"${(a.motivoOutros || '').replace(/"/g, '""')}"`,
                a.problemaResolvido,
                `"${(a.atendentes?.nome || '').replace(/"/g, '""')}"`,
                a.nota,
                `"${(a.opiniaoPessoal || '').replace(/"/g, '""')}"`,
                `"${sugestoesFormatadas}"`,
                `"${(a.sugestoesOutros || '').replace(/"/g, '""')}"`,
                a.recomenda === true ? 'SIM' : a.recomenda === false ? 'NAO' : '',
                a.circleNota ?? '',
                `"${(a.circleSugestoes || '').replace(/"/g, '""')}"`
            ].join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [cabecalho, ...linhas].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `avaliacoes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getNotaClasses = (tipo: string, nota: number) => {
        if (tipo === "AULA") {
            if (nota >= 4) return "border-green-500/30 text-green-400 bg-green-500/10";
            if (nota >= 3) return "border-yellow-500/30 text-yellow-500 bg-yellow-500/10";
            return "border-red-500/30 text-red-400 bg-red-500/10";
        }

        if (nota >= 8) return "border-green-500/30 text-green-400 bg-green-500/10";
        if (nota >= 5) return "border-yellow-500/30 text-yellow-500 bg-yellow-500/10";
        return "border-red-500/30 text-red-400 bg-red-500/10";
    };

    return (
        <>
            <div className="space-y-6 animate-fade-in max-w-6xl">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Histórico de Avaliações</h1>
                        <p className="text-gray-400 mt-1">Lista completa de todos os feedbacks recebidos.</p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
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
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${periodo === p.v ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {p.l}
                                </button>
                            ))}
                        </div>

                        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
                            {["TODOS", "SISTEMA", "MENTORIA", "AULA"].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFiltro(f)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filtro === f ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {f === "TODOS" ? "Todos" : f}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={exportarCSV}
                            disabled={avaliacoes.length === 0}
                            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium transition-colors hidden sm:flex items-center gap-2 glow-blue print:hidden"
                        >
                            Exportar CSV
                        </button>
                    </div>
                </div>

                <div className="glass rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <h2 className="text-sm font-semibold text-gray-200">Filtros Avançados</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Data inicial</label>
                            <input
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Data final</label>
                            <input
                                type="date"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Atendente</label>
                            <select
                                value={atendenteId}
                                onChange={(e) => setAtendenteId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                            >
                                <option value="" className="bg-white text-black">Todos</option>
                                {atendentes.map((atendente) => (
                                    <option key={atendente.id} value={atendente.id} className="bg-white text-black">
                                        {atendente.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setDataInicio("");
                                    setDataFim("");
                                    setAtendenteId("");
                                }}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 transition-colors"
                            >
                                Limpar filtros avançados
                            </button>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10 whitespace-nowrap">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-300">Data</th>
                                    <th className="p-4 text-sm font-semibold text-gray-300">Cliente</th>
                                    <th className="p-4 text-sm font-semibold text-gray-300">Motivo</th>
                                    <th className="p-4 text-sm font-semibold text-gray-300">Atendente</th>
                                    <th className="p-4 text-sm font-semibold text-gray-300">Canal</th>
                                    <th className="p-4 text-sm font-semibold text-gray-300">Resolvido?</th>
                                    <th className="p-4 text-sm font-semibold text-gray-300 text-right">Nota / Detalhes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-gray-500 animate-pulse">Carregando dados...</td></tr>
                                ) : avaliacoes.length === 0 ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">Nenhuma avaliação encontrada.</td></tr>
                                ) : (
                                    avaliacoes.map((A) => (
                                        <tr key={A.id} className="hover:bg-white/5 transition-colors whitespace-nowrap">
                                            <td className="p-4 text-gray-400 text-sm">
                                                {format(new Date(A.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-medium text-white">{A.nomeCliente}</p>
                                                <p className="text-xs text-blue-400">{A.emailCliente}</p>
                                            </td>
                                            <td className="p-4 text-gray-300 text-sm max-w-[200px] truncate" title={A.motivoContato}>
                                                {A.tipo === "AULA"
                                                    ? A.motivoContato
                                                    : A.motivoContato === "outros"
                                                        ? A.motivoOutros
                                                        : A.motivoContato.replace(/_/g, " ")}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-gray-200">{A.atendentes?.nome}</td>
                                            <td className="p-4">
                                                <span className="text-[10px] px-2 py-1 bg-white/10 rounded-md text-gray-300">{A.tipo}</span>
                                            </td>
                                            <td className="p-4">
                                                {A.problemaResolvido === "SIM" && <span className="text-green-400 text-sm font-bold">Sim</span>}
                                                {A.problemaResolvido === "NAO" && <span className="text-red-400 text-sm font-bold">Não</span>}
                                                {A.problemaResolvido === "PARCIALMENTE" && <span className="text-yellow-400 text-sm font-bold">Parcial</span>}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold border ${getNotaClasses(A.tipo, A.nota)}`}>
                                                        {A.nota} <Star className="w-3.5 h-3.5 fill-current" />
                                                    </div>
                                                    <button
                                                        onClick={() => setDetalhesSelecionados(A)}
                                                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors border border-white/10 print:hidden"
                                                        title="Ver Detalhes"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            {detalhesSelecionados && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center pt-10 px-4 pb-10 print:hidden">
                    <div className="glass p-6 rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl animate-scale-in h-fit relative">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">Detalhes da Avaliação</h2>
                                <p className="text-sm text-gray-400">
                                    {format(new Date(detalhesSelecionados.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} - {detalhesSelecionados.tipo}
                                </p>
                            </div>
                            <div className={`px-4 py-2 rounded-xl border text-lg font-black ${getNotaClasses(detalhesSelecionados.tipo, detalhesSelecionados.nota)}`}>
                                Nota {detalhesSelecionados.nota}
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Cliente</span>
                                    <p className="text-white font-medium">{detalhesSelecionados.nomeCliente}</p>
                                    <p className="text-blue-400 text-sm">{detalhesSelecionados.emailCliente}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <span className="text-xs text-gray-500 uppercase font-bold block mb-1">
                                        {detalhesSelecionados.tipo === "AULA" ? "Professor" : "Atendimento"}
                                    </span>
                                    <p className="text-white font-medium">{detalhesSelecionados.atendentes?.nome}</p>
                                    <p className="text-gray-400 text-sm">Problema resolvido: {detalhesSelecionados.problemaResolvido}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Motivo do Contato</span>
                                <p className="text-white">
                                    {detalhesSelecionados.tipo === "AULA"
                                        ? detalhesSelecionados.motivoContato || "Não especificado"
                                        : detalhesSelecionados.motivoContato === "outros"
                                        ? detalhesSelecionados.motivoOutros || "Não especificado"
                                        : detalhesSelecionados.motivoContato.replace(/_/g, " ")}
                                </p>
                            </div>

                            {detalhesSelecionados.opiniaoPessoal && (
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Opinião Pessoal (Aula)</span>
                                    <p className="text-white italic">{detalhesSelecionados.opiniaoPessoal}</p>
                                </div>
                            )}

                            {(detalhesSelecionados.sugestoes || detalhesSelecionados.sugestoesOutros) && (
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <span className="text-xs text-gray-500 uppercase font-bold block mb-2">Sugestões (Aula)</span>
                                    {detalhesSelecionados.sugestoes && (
                                        <ul className="list-disc list-inside text-white text-sm mb-2">
                                            {(typeof detalhesSelecionados.sugestoes === 'string'
                                                ? JSON.parse(detalhesSelecionados.sugestoes)
                                                : detalhesSelecionados.sugestoes).map((s: string) => {
                                                    const match = SUGESTOES_AULA.find(su => su.value === s);
                                                    return <li key={s}>{match ? match.label : s}</li>;
                                                })}
                                        </ul>
                                    )}
                                    {detalhesSelecionados.sugestoesOutros && (
                                        <p className="text-white text-sm mt-2"><span className="text-gray-400">Outros:</span> {detalhesSelecionados.sugestoesOutros}</p>
                                    )}
                                </div>
                            )}

                            {detalhesSelecionados.recomenda !== null && (
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Recomendaria?</span>
                                    <p className={`font-bold ${detalhesSelecionados.recomenda ? 'text-green-400' : 'text-red-400'}`}>
                                        {detalhesSelecionados.recomenda ? "Sim" : "Não"}
                                    </p>
                                </div>
                            )}

                            {(detalhesSelecionados.circleNota !== null || detalhesSelecionados.circleSugestoes) && (
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <span className="text-xs text-gray-500 uppercase font-bold block mb-2">Comunidade (Circle)</span>
                                    {detalhesSelecionados.circleNota !== null && (
                                        <p className="text-white text-sm">
                                            <span className="text-gray-400">Nota:</span> {detalhesSelecionados.circleNota}
                                        </p>
                                    )}
                                    {detalhesSelecionados.circleSugestoes && (
                                        <p className="text-white text-sm mt-2">
                                            <span className="text-gray-400">Sugestões:</span> {detalhesSelecionados.circleSugestoes}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <button onClick={() => setDetalhesSelecionados(null)} className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/10">
                            Fechar Detalhes
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}