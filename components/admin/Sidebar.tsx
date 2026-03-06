"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, MessageSquareText, Link2, LogOut, Settings } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/atendentes", label: "Atendentes", icon: Users },
    { href: "/admin/avaliacoes", label: "Avaliações", icon: MessageSquareText },
    { href: "/admin/links", label: "Links Compartilháveis", icon: Link2 },
    { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <div className="w-64 h-screen fixed left-0 top-0 border-r border-white/10 p-4 flex flex-col z-10" style={{ backgroundColor: "oklch(0.05 0 0)" }}>
            <div className="flex items-center gap-3 px-2 py-4 mb-6">
                <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center glow-blue">
                    <MessageSquareText className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white tracking-wide">AVA-MILION</span>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-sm ${active
                                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(1,111,230,0.3)]"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-medium text-sm mt-auto mb-10"
            >
                <LogOut className="w-5 h-5" />
                Sair do painel
            </button>
        </div>
    );
}
