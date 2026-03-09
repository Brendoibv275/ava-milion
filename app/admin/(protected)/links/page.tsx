"use client";

import { useState, useEffect } from "react";
import { Link2, Copy, CheckCircle2, ExternalLink } from "lucide-react";

const linkColorStyles: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400",
    purple: "bg-purple-500/10 text-purple-400",
    teal: "bg-teal-500/10 text-teal-400",
};

export default function LinksPage() {
    const [copied, setCopied] = useState<string | null>(null);
    const [baseUrl, setBaseUrl] = useState("");

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const links = [
        {
            id: "SISTEMA",
            name: "Suporte Sistema Milionário",
            url: `${baseUrl}/avaliacao/suporte-sistema`,
            color: "blue"
        },
        {
            id: "MENTORIA",
            name: "Suporte Mentoria",
            url: `${baseUrl}/avaliacao/suporte-mentoria`,
            color: "purple"
        },
        {
            id: "AULA",
            name: "Avaliação de Aula",
            url: `${baseUrl}/avaliacao/aula`,
            color: "teal"
        }
    ];

    const handleCopy = (id: string, url: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url);
        } else {
            // Fallback for non-HTTPS connections (like local IP on mobile)
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "absolute";
            textArea.style.left = "-999999px";
            document.body.prepend(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (error) {
                console.error(error);
            } finally {
                textArea.remove();
            }
        }
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in max-w-4xl">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Links Compartilháveis</h1>
                    <p className="text-gray-400 mt-1">
                        Copie os links abaixo e envie para os clientes ou adicione nos botões da plataforma.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {links.map((link) => (
                    <div key={link.id} className="glass p-4 md:p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-4 md:gap-6 items-start sm:items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-3 md:gap-4 w-full">
                            <div className={`p-3 md:p-4 rounded-xl ${linkColorStyles[link.color] ?? "bg-white/10 text-white"}`}>
                                <Link2 className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold text-white mb-1">{link.name}</h3>
                                <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1 break-all">
                                    <span className="break-all">{link.url}</span> <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                            </div>
                        </div>

                        <div className="flex w-full sm:w-auto gap-2">
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="touch-target inline-flex items-center justify-center gap-2 px-4 rounded-xl font-medium transition-all border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Abrir
                            </a>
                            <button
                                onClick={() => handleCopy(link.id, link.url)}
                                className={`touch-target inline-flex items-center gap-2 px-5 rounded-xl font-medium transition-all w-full sm:w-auto justify-center ${copied === link.id
                                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                                    }`}
                            >
                                {copied === link.id ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                {copied === link.id ? "Copiado!" : "Copiar"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
