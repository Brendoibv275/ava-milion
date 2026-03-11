import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: avaliacaoId } = await params;
        if (!avaliacaoId) {
            return NextResponse.json({ error: "ID da avaliação é obrigatório" }, { status: 400 });
        }

        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const { data: adminUser, error: adminError } = await supabase
            .from("admin_users")
            .select("is_approved")
            .eq("id", user.id)
            .single();

        if (adminError || !adminUser?.is_approved) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const { data: deleted, error: deleteError } = await supabase
            .from("avaliacoes_atendimento")
            .delete()
            .eq("id", avaliacaoId)
            .select("id")
            .maybeSingle();

        if (deleteError) {
            throw deleteError;
        }

        if (!deleted) {
            return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao excluir avaliação:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
