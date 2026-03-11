import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: adminId } = await params;
        if (!adminId) {
            return NextResponse.json({ error: "ID do administrador é obrigatório" }, { status: 400 });
        }

        const body = await req.json().catch(() => ({}));
        const confirmation = typeof body?.confirmation === "string" ? body.confirmation.trim() : "";
        if (confirmation !== "confirmar") {
            return NextResponse.json(
                { error: "Confirmação inválida. Digite 'confirmar' para excluir." },
                { status: 400 }
            );
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
            .from("admin_users")
            .delete()
            .eq("id", adminId)
            .select("id")
            .maybeSingle();

        if (deleteError) {
            throw deleteError;
        }

        if (!deleted) {
            return NextResponse.json({ error: "Administrador não encontrado" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao excluir administrador:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
