import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { ativo } = await req.json();
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("atendentes")
            .update({ ativo })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
