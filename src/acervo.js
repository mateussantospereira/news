import fs from "fs";
import path from "path";
// Importamos os mineradores específicos das subpastas
import { fetchContent as fetchOeste } from "./scrapers/oeste/content.js";
import { fetchContent as fetchEpoch } from "./scrapers/epoch/content.js";

// Configuração de pastas (Rodando da raiz do projeto)
const PASTA_CACHE = "../cache/artigos";

if (!fs.existsSync(PASTA_CACHE)) {
    fs.mkdirSync(PASTA_CACHE, { recursive: true });
}

async function gerenciar() {
    const urlOriginal = process.argv[2];

    if (!urlOriginal) {
        process.stdout.write("Erro: Nenhuma URL fornecida.");
        process.exit(1);
    }

    // 1. GERAÇÃO DO NOME DO ARQUIVO (CACHE)
    const nomeArquivo =
        urlOriginal
            .replace(/^https?:\/\//, "")
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase()
            .substring(0, 150) + ".txt";

    const caminhoCompleto = path.join(PASTA_CACHE, nomeArquivo);

    // 2. CHECK DE CACHE (Se já existe, não gasta banda nem tempo)
    if (fs.existsSync(caminhoCompleto)) {
        const conteudoLocal = fs.readFileSync(caminhoCompleto, "utf-8");
        process.stdout.write(conteudoLocal);
        process.exit(0);
    }

    // 3. MINERAÇÃO (Escolha do minerador por domínio)
    try {
        let noticia;

        if (urlOriginal.includes("epochtimesbrasil.com.br")) {
            // Se for Epoch, usa o minerador que acabamos de testar
            noticia = await fetchEpoch(urlOriginal);
        } else {
            // Caso contrário, assume que é Oeste (ou seu padrão original)
            noticia = await fetchOeste(urlOriginal);
        }

        if (noticia && noticia.body && noticia.body.length > 100) {
            const textoParaSalvar =
                `\n\n\n${noticia.title.toUpperCase()}\n\n\n` +
                `${noticia.date}\n\n` +
                `${noticia.author}\n\n\n` +
                `${noticia.body}\n\n` +
                `Fonte: ${urlOriginal}\n`;

            // Salva no disco
            fs.writeFileSync(caminhoCompleto, textoParaSalvar, "utf-8");

            // Cospe para o terminal (fzf/less capturarem)
            process.stdout.write(textoParaSalvar);
        } else {
            process.stdout.write(
                "Erro: O minerador não conseguiu extrair o texto da notícia."
            );
        }
    } catch (erro) {
        process.stdout.write(`Erro na mineração: ${erro.message}`);
    }

    process.exit(0);
}

gerenciar();
