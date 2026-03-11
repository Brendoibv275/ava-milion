import Sidebar from "@/components/admin/Sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    let user = null;
    try {
        const supabase = await createClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch {
        redirect("/admin/login");
    }

    if (!user) {
        redirect("/admin/login");
    }

    return (
        <div className="min-h-screen flex text-white" style={{ background: "oklch(0.08 0 0)" }}>
            <Sidebar />
            <main className="flex-1 p-4 pt-20 md:pt-8 md:p-8 md:ml-64">{children}</main>
        </div>
    );
}
