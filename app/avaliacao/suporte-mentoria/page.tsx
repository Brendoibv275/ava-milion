import FormAvaliacao from "@/components/FormAvaliacao";

export const metadata = { title: "Suporte Mentoria | Avaliação de Atendimento" };

export default function Page() {
    return (
        <FormAvaliacao
            tipo="MENTORIA"
            titulo="Suporte Mentoria"
            subtitulo="Avalie o atendimento recebido pelo suporte da Mentoria"
            cor="gradient-purple"
        />
    );
}
