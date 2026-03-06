export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(date));
}

export const MOTIVOS_CONTATO = [
    { value: "suporte_tecnico", label: "🔧 Suporte Técnico" },
    { value: "cancelamento", label: "❌ Cancelamento" },
    { value: "reembolso", label: "💰 Reembolso" },
    { value: "duvidas_conteudo", label: "❓ Dúvidas sobre conteúdo" },
    { value: "acesso_plataforma", label: "🔑 Acesso à plataforma / Login" },
    { value: "problema_compra", label: "📦 Problema com compra/pedido" },
    { value: "troca_plano", label: "🔄 Troca de plano / Upgrade" },
    { value: "nota_fiscal", label: "🧾 Nota fiscal / Documentação" },
    { value: "outros", label: "📝 Outros" },
] as const;

export const SUGESTOES_AULA = [
    { value: "otimo", label: "Está ótimo o conteúdo!" },
    { value: "didatica", label: "Melhorar didática do instrutor" },
    { value: "exemplos", label: "Adicionar mais exemplos práticos" },
    { value: "audio_video", label: "Melhorar qualidade de áudio/vídeo" },
    { value: "exercicios", label: "Incluir mais exercícios e quizzes" },
    { value: "legendas", label: "Adicionar legendas / transcrições" },
    { value: "duracao", label: "Aumentar duração da aula" },
    { value: "material", label: "Material complementar (PDF, slides)" },
    { value: "outros", label: "Outros" },
] as const;

export const LABEL_SUPORTE: Record<string, string> = {
    SISTEMA: "Suporte Sistema Milionário",
    MENTORIA: "Suporte Mentoria",
    AULA: "Avaliação de Aula",
};
