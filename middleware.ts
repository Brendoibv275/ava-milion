import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isAuthRoute = request.nextUrl.pathname.startsWith("/admin/login");
    const isPendenteRoute = request.nextUrl.pathname.startsWith("/admin/pendente");
    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin") && !isAuthRoute && !isPendenteRoute;

    // Se possui sessão válida
    if (user) {
        // Busca status de aprovação
        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('is_approved')
            .eq('id', user.id)
            .single();

        const isApproved = adminUser?.is_approved === true;

        if (!isApproved) {
            // Se está logado mas NÃO ESTÁ aprovado, deixa ir apenas para rota de pendente ou deslogar (que passa pelo middleware tbm sem a auth)
            if (!isPendenteRoute && request.nextUrl.pathname !== "/admin/login") {
                const url = request.nextUrl.clone();
                url.pathname = "/admin/pendente";
                return NextResponse.redirect(url);
            }
        } else {
            // Se ESTÁ logado e ESTÁ aprovado
            if (isAuthRoute || isPendenteRoute) {
                const url = request.nextUrl.clone();
                url.pathname = "/admin/dashboard";
                return NextResponse.redirect(url);
            }
        }
    } else {
        // NÃO está logado
        if (isAdminRoute || isPendenteRoute) {
            const url = request.nextUrl.clone();
            url.pathname = "/admin/login";
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/admin/:path*",
    ],
};
