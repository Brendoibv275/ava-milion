"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMotivosContatoByTipo, SUGESTOES_AULA, type TipoSuporte } from "@/lib/utils";

interface Atendente {
    id: string;
    nome: string;
}

interface Props {
    tipo: TipoSuporte;
    titulo: string;
    subtitulo: string;
    cor: string; // gradient class
}

export default function FormAvaliacao({ tipo, titulo, subtitulo, cor }: Props) {
    const router = useRouter();
    const [atendentes, setAtendentes] = useState<Atendente[]>([]);
    const [loading, setLoading] = useState(false);
    const [nota, setNota] = useState(tipo === "AULA" ? 0 : 8);
    const [hoverNota, setHoverNota] = useState<number | null>(null);
    const [hoverCircleNota, setHoverCircleNota] = useState<number | null>(null);

    const [form, setForm] = useState({
        nomeCliente: "",
        emailCliente: "",
        motivoContato: "",
        motivoOutros: "",
        problemaResolvido: "",
        atendenteId: "",
        opiniaoPessoal: "",
        sugestoes: [] as string[],
        sugestoesOutros: "",
        recomenda: "",
        circleNota: "",
        circleSugestoes: "",
    });
    const motivosContato = getMotivosContatoByTipo(tipo);
    const isAula = tipo === "AULA";
    const isSuporte = tipo === "SISTEMA" || tipo === "MENTORIA";

    useEffect(() => {
        fetch(`/api/atendentes?suporte=${tipo}`)
            .then((r) => r.json())
            .then(setAtendentes);
    }, [tipo]);

    useEffect(() => {
        setNota(tipo === "AULA" ? 0 : 8);
        setHoverNota(null);
    }, [tipo]);

    const getProblemaResolvidoFromAulaNota = (valorNota: number) => {
        if (valorNota >= 4) return "SIM";
        if (valorNota === 3) return "PARCIALMENTE";
        return "NAO";
    };

    const handleSugestao = (val: string) => {
        const isUnselecting = form.sugestoes.includes(val);
        if (!isUnselecting && form.sugestoes.length >= 3) {
            alert("Você pode selecionar no máximo 3 sugestões.");
            return;
        }

        setForm((f) => ({
            ...f,
            sugestoes: f.sugestoes.includes(val)
                ? f.sugestoes.filter((s) => s !== val)
                : [...f.sugestoes, val],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nomeCliente || !form.emailCliente || !form.motivoContato || !form.problemaResolvido || !form.atendenteId || !form.recomenda) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        if (isSuporte && form.circleNota === "") {
            alert("Por favor, informe uma nota para a comunidade (Circle).");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/avaliacoes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    tipo,
                    nota,
                    circleNota: isSuporte ? Number(form.circleNota) : null,
                    circleSugestoes: isSuporte ? form.circleSugestoes : null,
                }),
            });

            if (res.ok) {
                router.push("/avaliacao/obrigado");
            } else {
                alert("Erro ao enviar avaliação. Tente novamente.");
            }
        } catch {
            alert("Erro de conexão. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const notaDisplay = hoverNota ?? nota;
    const notaColor = isAula
        ? notaDisplay >= 5
            ? "#22c55e"
            : notaDisplay >= 3
                ? "#f59e0b"
                : "#ef4444"
        : notaDisplay >= 8
            ? "#22c55e"
            : notaDisplay >= 5
                ? "#f59e0b"
                : "#ef4444";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "oklch(0.08 0 0)" }}>
            {/* Header */}
            <div className="w-full max-w-2xl mb-8 animate-fade-in">
                <div className={`h-1.5 w-24 rounded-full mb-6 ${cor}`} />
                <h1 className="text-3xl font-bold text-white mb-2">{titulo}</h1>
                <p className="text-gray-400">{subtitulo}</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-5 animate-fade-in">
                {/* Nome e Email */}
                <div className="glass rounded-2xl p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Seus dados</h2>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1.5">Nome completo *</label>
                        <input
                            type="text"
                            required
                            placeholder="Seu nome"
                            value={form.nomeCliente}
                            onChange={(e) => setForm({ ...form, nomeCliente: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-white/8 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1.5">E-mail *</label>
                        <input
                            type="email"
                            required
                            placeholder="seu@email.com"
                            value={form.emailCliente}
                            onChange={(e) => setForm({ ...form, emailCliente: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-white/8 transition-all"
                        />
                    </div>
                </div>

                {/* Motivo do Contato */}
                <div className="glass rounded-2xl p-6 space-y-3">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                        {isAula ? "Motivo de ter assistido a aula *" : "Motivo do contato *"}
                    </h2>
                    {isAula ? (
                        <textarea
                            required
                            placeholder="Descreva o motivo de ter assistido a aula..."
                            value={form.motivoContato}
                            onChange={(e) => setForm({ ...form, motivoContato: e.target.value })}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 transition-all resize-none"
                        />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {motivosContato.map((m) => (
                                    <button
                                        key={m.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, motivoContato: m.value, motivoOutros: "" })}
                                        className={`text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium ${form.motivoContato === m.value
                                            ? "border-blue-500 bg-blue-500/15 text-white"
                                            : "border-white/10 bg-white/3 text-gray-300 hover:border-white/20 hover:bg-white/5"
                                            }`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                            {form.motivoContato === "outros" && (
                                <textarea
                                    placeholder="Descreva o motivo do seu contato..."
                                    value={form.motivoOutros}
                                    onChange={(e) => setForm({ ...form, motivoOutros: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 transition-all resize-none"
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Problema Resolvido */}
                <div className="glass rounded-2xl p-6 space-y-3">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                        {isAula ? "Como você avalia o resultado da aula? *" : "Seu problema foi resolvido? *"}
                    </h2>
                    {isAula ? (
                        <>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Selecione um nível de avaliação</span>
                                <span className="text-2xl font-black transition-colors" style={{ color: notaColor }}>
                                    {notaDisplay === 0 ? "-" : notaDisplay}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                                {[
                                    { value: 1, label: "Ruim", cls: "red" },
                                    { value: 2, label: "Regular", cls: "red" },
                                    { value: 3, label: "Intermediário", cls: "yellow" },
                                    { value: 4, label: "Bom", cls: "green" },
                                    { value: 5, label: "Excelente", cls: "green" },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onMouseEnter={() => setHoverNota(opt.value)}
                                        onMouseLeave={() => setHoverNota(null)}
                                        onClick={() => {
                                            setNota(opt.value);
                                            setForm({
                                                ...form,
                                                problemaResolvido: getProblemaResolvidoFromAulaNota(opt.value),
                                            });
                                        }}
                                        className={`px-3 py-3 rounded-xl border transition-all text-sm font-semibold ${nota === opt.value
                                            ? opt.cls === "green"
                                                ? "border-green-500 bg-green-500/15 text-green-400"
                                                : opt.cls === "yellow"
                                                    ? "border-yellow-500 bg-yellow-500/15 text-yellow-400"
                                                    : "border-red-500 bg-red-500/15 text-red-400"
                                            : "border-white/10 bg-white/3 text-gray-300 hover:border-white/20"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: "SIM", label: "✅ Sim", cls: "green" },
                                { value: "PARCIALMENTE", label: "⚠️ Parcialmente", cls: "yellow" },
                                { value: "NAO", label: "❌ Não", cls: "red" },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setForm({ ...form, problemaResolvido: opt.value })}
                                    className={`py-3 rounded-xl border transition-all text-sm font-semibold ${form.problemaResolvido === opt.value
                                        ? opt.cls === "green"
                                            ? "border-green-500 bg-green-500/15 text-green-400"
                                            : opt.cls === "yellow"
                                                ? "border-yellow-500 bg-yellow-500/15 text-yellow-400"
                                                : "border-red-500 bg-red-500/15 text-red-400"
                                        : "border-white/10 bg-white/3 text-gray-300 hover:border-white/20"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recomenda */}
                <div className="glass rounded-2xl p-6 space-y-3">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Recomenda nosso serviço? *</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { value: "SIM", label: "✅ Sim", cls: "green" },
                            { value: "NAO", label: "❌ Não", cls: "red" },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm({ ...form, recomenda: opt.value })}
                                className={`py-3 rounded-xl border transition-all text-sm font-semibold ${form.recomenda === opt.value
                                    ? opt.cls === "green"
                                        ? "border-green-500 bg-green-500/15 text-green-400"
                                        : "border-red-500 bg-red-500/15 text-red-400"
                                    : "border-white/10 bg-white/3 text-gray-300 hover:border-white/20"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Atendente */}
                <div className="glass rounded-2xl p-6 space-y-3">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{isAula ? "Professor *" : "Atendente *"}</h2>
                    {atendentes.length === 0 ? (
                        <p className="text-gray-500 text-sm">{isAula ? "Carregando professores..." : "Carregando atendentes..."}</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {atendentes.map((a) => (
                                <button
                                    key={a.id}
                                    type="button"
                                    onClick={() => setForm({ ...form, atendenteId: a.id })}
                                    className={`px-3 py-2.5 rounded-xl border transition-all text-sm font-medium text-center ${form.atendenteId === a.id
                                        ? "border-blue-500 bg-blue-500/15 text-white"
                                        : "border-white/10 bg-white/3 text-gray-300 hover:border-white/20"
                                        }`}
                                >
                                    {a.nome}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Nota */}
                {!isAula && (
                    <div className="glass rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Nota do atendimento *</h2>
                            <span className="text-4xl font-black transition-colors" style={{ color: notaColor }}>
                                {notaDisplay}
                            </span>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                            {Array.from({ length: 11 }, (_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onMouseEnter={() => setHoverNota(i)}
                                    onMouseLeave={() => setHoverNota(null)}
                                    onClick={() => setNota(i)}
                                    className={`flex-1 min-w-[2rem] h-10 rounded-lg border text-sm font-bold transition-all ${i <= (hoverNota ?? nota)
                                        ? i >= 8
                                            ? "bg-green-500/20 border-green-500 text-green-400"
                                            : i >= 5
                                                ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                                                : "bg-red-500/20 border-red-500 text-red-400"
                                        : "bg-white/3 border-white/10 text-gray-400 hover:border-white/20"
                                        }`}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                            <span>Péssimo</span>
                            <span>Excelente</span>
                        </div>
                    </div>
                )}

                {isSuporte && (
                    <div className="glass rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Avaliação da comunidade (Circle)</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm text-gray-300">Nota da comunidade (0 a 10) *</label>
                                <span className="text-2xl font-black text-white">{hoverCircleNota ?? (form.circleNota === "" ? "-" : form.circleNota)}</span>
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                {Array.from({ length: 11 }, (_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onMouseEnter={() => setHoverCircleNota(i)}
                                        onMouseLeave={() => setHoverCircleNota(null)}
                                        onClick={() => setForm({ ...form, circleNota: String(i) })}
                                        className={`flex-1 min-w-[2rem] h-10 rounded-lg border text-sm font-bold transition-all ${i <= (hoverCircleNota ?? (form.circleNota === "" ? -1 : Number(form.circleNota)))
                                            ? i >= 8
                                                ? "bg-green-500/20 border-green-500 text-green-400"
                                                : i >= 5
                                                    ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                                                    : "bg-red-500/20 border-red-500 text-red-400"
                                            : "bg-white/3 border-white/10 text-gray-400 hover:border-white/20"
                                            }`}
                                    >
                                        {i}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Péssimo</span>
                                <span>Excelente</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1.5">Sugestões de melhoria da comunidade</label>
                            <textarea
                                placeholder="Descreva sugestões para melhorar a comunidade Circle..."
                                value={form.circleSugestoes}
                                onChange={(e) => setForm({ ...form, circleSugestoes: e.target.value })}
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 transition-all resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* Campos extras — somente AULA */}
                {tipo === "AULA" && (
                    <>
                        <div className="glass rounded-2xl p-6 space-y-3">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Sua opinião sobre a aula</h2>
                            <textarea
                                placeholder="Como foi sua experiência com a aula? Compartilhe sua opinião..."
                                value={form.opiniaoPessoal}
                                onChange={(e) => setForm({ ...form, opiniaoPessoal: e.target.value })}
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 transition-all resize-none"
                            />
                        </div>

                        <div className="glass rounded-2xl p-6 space-y-3">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Sugestões e melhorias</h2>
                            <p className="text-xs text-gray-500">Selecione até 3 opções.</p>
                            <div className="space-y-2">
                                {SUGESTOES_AULA.map((s) => {
                                    const isOtimo = s.value === "otimo";
                                    const isSelected = form.sugestoes.includes(s.value);
                                    let btnClass = isSelected
                                        ? "border-blue-500 bg-blue-500/15 text-white"
                                        : "border-white/10 bg-white/3 text-gray-300 hover:border-white/20";

                                    if (isOtimo && isSelected) {
                                        btnClass = "border-green-500 bg-green-500/15 text-green-400";
                                    } else if (isOtimo && !isSelected) {
                                        btnClass = "border-green-500/30 bg-green-500/5 text-green-400/80 hover:bg-green-500/10";
                                    }

                                    return (
                                        <button
                                            key={s.value}
                                            type="button"
                                            onClick={() => handleSugestao(s.value)}
                                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium ${btnClass}`}
                                        >
                                            <span className="mr-2">{isSelected ? "✓" : "○"}</span>
                                            {s.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {form.sugestoes.includes("outros") && (
                                <textarea
                                    placeholder="Descreva sua sugestão..."
                                    value={form.sugestoesOutros}
                                    onChange={(e) => setForm({ ...form, sugestoesOutros: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 transition-all resize-none"
                                />
                            )}
                        </div>
                    </>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all ${cor} hover:opacity-90 active:scale-98 disabled:opacity-50 glow-blue`}
                >
                    {loading ? "Enviando..." : "Enviar Avaliação"}
                </button>
            </form>
        </div>
    );
}
