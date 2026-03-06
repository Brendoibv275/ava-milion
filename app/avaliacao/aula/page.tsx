import FormAvaliacao from "@/components/FormAvaliacao";

export const metadata = { title: "Avaliação de Aula | Avaliação de Atendimento" };

export default function Page() {
    return (
        <FormAvaliacao
            tipo="AULA"
            titulo="Avaliação de Aula"
            subtitulo="Avalie a aula e nos ajude a melhorar continuamente o conteúdo"
            cor="gradient-teal"
        />
    );
}
