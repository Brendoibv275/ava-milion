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
        } = body;

        const supabase = await createClient();

        if (!tipo || !nomeCliente || !emailCliente || !motivoContato || !problemaResolvido || !atendenteId || nota === undefined) {
            return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
        }

        const { data: avaliacao, error } = await supabase
            .from("avaliacoes_atendimento")
            .insert({
                tipo,
                nomeCliente: nomeCliente.trim(),
                emailCliente: emailCliente.trim().toLowerCase(),
                motivoContato,
                motivoOutros: motivoOutros || null,
                problemaResolvido,
                atendenteId,
                nota: Number(nota),
                opiniaoPessoal: opiniaoPessoal || null,
                sugestoes: sugestoes && sugestoes.length > 0 ? sugestoes : null,
                sugestoesOutros: sugestoesOutros || null,
                recomenda: recomenda === "SIM" ? true : false,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, id: avaliacao.id });
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

        if (dias && dias !== "tudo") {
            const d = parseInt(dias);
            const sinceDate = new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
            query = query.gte("created_at", sinceDate);
        }

        const { data: avaliacoes, error } = await query;
        if (error) throw error;

        return NextResponse.json(avaliacoes);
    } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
