import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dias = parseInt(searchParams.get("dias") || "30");
        const tipo = searchParams.get("tipo");

        const supabase = await createClient();
        const sinceDate = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();

        // 1. Get Avaliações
        let queryAvaliacoes = supabase
            .from("avaliacoes_atendimento")
            .select("nota, problemaResolvido, tipo, created_at, atendenteId")
            .gte("created_at", sinceDate);

        if (tipo && tipo !== "TODOS") {
            queryAvaliacoes = queryAvaliacoes.eq("tipo", tipo);
        }

        const { data: avaliacoes, error: avaliacoesError } = await queryAvaliacoes;
        if (avaliacoesError) throw avaliacoesError;

        // 2. Get Atendentes 
        const { data: atendentes, error: atendentesError } = await supabase
            .from("atendentes")
            .select(`
        id,
        nome,
        ativo,
        atendente_categorias(suporte)
      `);

        if (atendentesError) throw atendentesError;

        const total = avaliacoes.length;
        const mediaGeral = total > 0
            ? avaliacoes.reduce((s: any, a: any) => s + a.nota, 0) / total
            : 0;

        const resolvidos = avaliacoes.filter((a: any) => a.problemaResolvido === "SIM").length;
        const pctResolvidos = total > 0 ? Math.round((resolvidos / total) * 100) : 0;

        // Build atendentes ranking manually
        const atendentesMap = new Map();
        atendentes.forEach((a: any) => {
            atendentesMap.set(a.id, {
                id: a.id,
                nome: a.nome,
                categorias: a.atendente_categorias.map((c: any) => c.suporte),
                avaliacoes: []
            });
        });

        avaliacoes.forEach((a: any) => {
            if (atendentesMap.has(a.atendenteId)) {
                atendentesMap.get(a.atendenteId).avaliacoes.push(a);
            }
        });

        const rankingAtendentes = Array.from(atendentesMap.values())
            .filter(a => a.avaliacoes.length > 0)
            .map(a => ({
                id: a.id,
                nome: a.nome,
                total: a.avaliacoes.length,
                media: a.avaliacoes.reduce((s: any, av: any) => s + av.nota, 0) / a.avaliacoes.length,
                categorias: a.categorias,
            }))
            .sort((a, b) => {
                // Prioriza quem mais atende; nota média entra apenas como desempate.
                if (b.total !== a.total) return b.total - a.total;
                if (b.media !== a.media) return b.media - a.media;
                return a.nome.localeCompare(b.nome, "pt-BR");
            });

        // Timeline chart
        const porDia: Record<string, { notas: number[]; tipo: string }> = {};
        for (const av of avaliacoes) {
            const key = av.created_at.slice(0, 10);
            if (!porDia[key]) porDia[key] = { notas: [], tipo: av.tipo };
            porDia[key].notas.push(av.nota);
        }

        const grafico = Object.entries(porDia)
            .map(([data, { notas }]) => ({
                data,
                media: notas.reduce((s, n) => s + n, 0) / notas.length,
                total: notas.length,
            }))
            .sort((a, b) => a.data.localeCompare(b.data));

        return NextResponse.json({
            total,
            mediaGeral: Math.round(mediaGeral * 10) / 10,
            pctResolvidos,
            atendenteAtivos: atendentes.filter((a: any) => a.ativo).length,
            rankingAtendentes,
            grafico,
        });
    } catch (error) {
        console.error("Dashboard erro:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
