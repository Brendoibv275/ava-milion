import Sidebar from "@/components/admin/Sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/admin/login");
    }

    return (
        <div className="min-h-screen flex text-white" style={{ background: "oklch(0.08 0 0)" }}>
            <Sidebar />
            <main className="flex-1 ml-64 p-8">{children}</main>
        </div>
    );
}
