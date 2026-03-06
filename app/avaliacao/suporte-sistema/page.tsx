import FormAvaliacao from "@/components/FormAvaliacao";

export const metadata = { title: "Suporte Sistema Milionário | Avaliação de Atendimento" };

export default function Page() {
    return (
        <FormAvaliacao
            tipo="SISTEMA"
            titulo="Suporte Sistema Milionário"
            subtitulo="Avalie o atendimento recebido pelo suporte do Sistema Milionário"
            cor="gradient-blue"
        />
    );
}
