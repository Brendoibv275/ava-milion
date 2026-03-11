import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            tipo,
            nomeCliente,
            emailCliente,
            motivoContato,
            motivoOutros,
            problemaResolvido,
            atendenteId,
            nota,
            opiniaoPessoal,
            sugestoes,
            sugestoesOutros,
            recomenda,
            circleNota,
            circleSugestoes,
        } = body;

        const supabase = await createClient();

        if (!tipo || !nomeCliente || !emailCliente || !motivoContato || !problemaResolvido || !atendenteId || nota === undefined) {
            return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
        }

        const circleNotaNormalizada =
            tipo === "MENTORIA"
                ? (circleNota === null || circleNota === undefined || circleNota === "" ? null : Number(circleNota))
                : null;
        const notaNormalizada = Number(nota);

        if (Number.isNaN(notaNormalizada)) {
            return NextResponse.json({ error: "Nota inválida" }, { status: 400 });
        }
        if (tipo === "AULA" && (notaNormalizada < 0 || notaNormalizada > 10)) {
            return NextResponse.json({ error: "A avaliação da aula deve ser entre 0 e 10" }, { status: 400 });
        }
        if ((tipo === "SISTEMA" || tipo === "MENTORIA") && (notaNormalizada < 0 || notaNormalizada > 10)) {
            return NextResponse.json({ error: "A nota do atendimento deve ser entre 0 e 10" }, { status: 400 });
        }
        if (circleNotaNormalizada !== null && (Number.isNaN(circleNotaNormalizada) || circleNotaNormalizada < 0 || circleNotaNormalizada > 10)) {
            return NextResponse.json({ error: "Nota da comunidade inválida" }, { status: 400 });
        }

        const { error } = await supabase
            .from("avaliacoes_atendimento")
            .insert({
                tipo,
                nomeCliente: nomeCliente.trim(),
                emailCliente: emailCliente.trim().toLowerCase(),
                motivoContato,
                motivoOutros: motivoOutros || null,
                problemaResolvido,
                atendenteId,
                nota: notaNormalizada,
                opiniaoPessoal: opiniaoPessoal || null,
                sugestoes: sugestoes && sugestoes.length > 0 ? sugestoes : null,
                sugestoesOutros: sugestoesOutros || null,
                recomenda: recomenda === "SIM" ? true : false,
                circleNota: circleNotaNormalizada,
                circleSugestoes: tipo === "MENTORIA" ? (circleSugestoes || null) : null,
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao salvar avaliação:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tipo = searchParams.get("tipo");
        const atendenteId = searchParams.get("atendenteId");
        const dias = searchParams.get("dias");
        const dataInicio = searchParams.get("dataInicio");
        const dataFim = searchParams.get("dataFim");

        const supabase = await createClient();

        let query = supabase
            .from("avaliacoes_atendimento")
            .select(`
        *,
        atendentes ( id, nome )
      `)
            .order("created_at", { ascending: false });

        if (tipo) query = query.eq("tipo", tipo);
        if (atendenteId) query = query.eq("atendenteId", atendenteId);

        if (dataInicio) {
            const inicio = new Date(`${dataInicio}T00:00:00`);
            if (!Number.isNaN(inicio.getTime())) {
                query = query.gte("created_at", inicio.toISOString());
            }
        }

        if (dataFim) {
            const fim = new Date(`${dataFim}T23:59:59.999`);
            if (!Number.isNaN(fim.getTime())) {
                query = query.lte("created_at", fim.toISOString());
            }
        }

        if (!dataInicio && !dataFim && dias && dias !== "tudo") {
            const d = parseInt(dias);
            if (!Number.isNaN(d)) {
                const sinceDate = new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
                query = query.gte("created_at", sinceDate);
            }
        }

        const { data: avaliacoes, error } = await query;
        if (error) throw error;

        return NextResponse.json(avaliacoes);
    } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
