import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const suporte = searchParams.get("suporte");
        const supabase = await createClient();

        let query = supabase
            .from("atendentes")
            .select(`
        *,
        atendente_categorias!inner(suporte)
      `)
            .eq("ativo", true)
            .order("nome", { ascending: true });

        if (suporte) {
            query = query.eq("atendente_categorias.suporte", suporte);
        }

        const { data: atendentes, error } = await query;
        if (error) throw error;

        return NextResponse.json(atendentes);
    } catch (error) {
        console.error("Erro ao buscar atendentes:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { nome, email, categorias } = await req.json();
        const supabase = await createClient();

        if (!nome || !categorias || categorias.length === 0) {
            return NextResponse.json({ error: "Nome e categorias são obrigatórios" }, { status: 400 });
        }

        // Insert atendente
        const { data: atendente, error: atendenteError } = await supabase
            .from("atendentes")
            .insert({
                nome: nome.trim(),
                email: email?.trim().toLowerCase() || null,
                ativo: true
            })
            .select()
            .single();

        if (atendenteError) throw atendenteError;

        // Insert categorias
        const categoriasData = categorias.map((c: string) => ({
            atendenteId: atendente.id,
            suporte: c
        }));

        const { error: categoriasError } = await supabase
            .from("atendente_categorias")
            .insert(categoriasData);

        if (categoriasError) throw categoriasError;

        return NextResponse.json(atendente);
    } catch (error) {
        console.error("Erro ao criar atendente:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
