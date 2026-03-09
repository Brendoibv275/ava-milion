import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata = { title: "Obrigado | Sistema Milionário" };

export default function ObrigadoPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 text-center animate-fade-in" style={{ backgroundColor: "oklch(0.08 0 0)" }}>
            <div className="glass-blue p-8 rounded-3xl max-w-md w-full glow-blue">
                <CheckCircle2 className="w-20 h-20 text-blue-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-white mb-3">Avaliação Enviada!</h1>
                <p className="text-gray-400 mb-8">
                    Agradecemos pelo seu tempo! Sua opinião é fundamental para continuarmos melhorando nosso atendimento.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                        href="/avaliacao/suporte-sistema"
                        className="touch-target inline-flex items-center justify-center rounded-xl bg-blue-600 text-white font-semibold px-4 hover:bg-blue-500 transition-colors"
                    >
                        Nova avaliação
                    </Link>
                    <Link
                        href="/"
                        className="touch-target inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 text-gray-200 font-semibold px-4 hover:bg-white/10 transition-colors"
                    >
                        Voltar ao início
                    </Link>
                </div>
            </div>
        </div>
    );
}
