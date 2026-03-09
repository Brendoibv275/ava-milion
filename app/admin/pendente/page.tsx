"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { LogOut, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PendentePage() {
    const supabase = createClient();
    const router = useRouter();
    const [origem, setOrigem] = useState<string | null>(null);
    const veioDoLogin = origem === "login";
    const veioDoCadastro = origem === "cadastro";

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setOrigem(params.get("origem"));
    }, []);

    const handleSair = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[oklch(0.08_0_0)] text-white relative flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-600/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="glass p-8 rounded-3xl w-full max-w-lg text-center relative z-10 border border-white/10 shadow-2xl animate-scale-in">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-yellow-500 to-orange-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                    <Clock className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-3xl font-bold mb-4 text-white">Conta em análise</h1>
                <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                    {veioDoCadastro && (
                        <>Login criado com sucesso, aguardando aprovação. </>
                    )}
                    {veioDoLogin && (
                        <>Seu login foi identificado, mas ainda não está aprovado. </>
                    )}
                    O acesso ao painel de administração só será liberado após a aprovação de um <b>Administrador Geral</b>.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 text-sm text-gray-300">
                    Por favor, aguarde ou entre em contato com a equipe responsável caso precise de urgência na aprovação.
                </div>

                <button
                    onClick={handleSair}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" /> Sair
                </button>
            </div>
        </div>
    );
}
