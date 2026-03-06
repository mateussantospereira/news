import fs from "fs";
import path from "path";
import { fetchContent } from "./scrapers/content.js";

// Configuração de pastas
const PASTA_CASH = "./cache/artigos";

// Cria a pasta se ela não existir
if (!fs.existsSync(PASTA_CASH)) {
    fs.mkdirSync(PASTA_CASH, { recursive: true });
}

async function gerenciar() {
    const urlOriginal = process.argv[2];

    if (!urlOriginal) {
        console.log("Erro: Nenhuma URL fornecida.");
        process.exit(1);
    }

    // 1. HIGIENIZAÇÃO DA URL (Transforma a URL no nome do arquivo .txt)
    // Ex: https://site.com/noticia-pf -> site_com_noticia_pf.txt
    const nomeArquivo =
        urlOriginal
            .replace(/^https?:\/\//, "") // Remove o http://
            .replace(/[^a-z0-9]/gi, "_") // Troca símbolos por _
            .toLowerCase() // Tudo minúsculo
            .substring(0, 150) + ".txt"; // Limita o tamanho do nome

    const caminhoCompleto = path.join(PASTA_CASH, nomeArquivo);

    // 2. CHECK DE CASH (Prioridade Máxima)
    if (fs.existsSync(caminhoCompleto)) {
        // Se o arquivo já existe, lê e cospe no terminal na hora
        const conteudoLocal = fs.readFileSync(caminhoCompleto, "utf-8");
        process.stdout.write(conteudoLocal);
        process.exit(0);
    }

    // 3. MINERAÇÃO (Só acontece se o arquivo não existir no cash)
    try {
        // Chama o seu scraper original (Puppeteer)
        const noticia = await fetchContent(urlOriginal);

        if (noticia && noticia.body) {
            const textoParaSalvar = `\n\n\n${noticia.title.toUpperCase()}\n\n${
                noticia.date
            }\n\n${noticia.author}\n\n${noticia.body}`;

            // Salva no disco para a próxima vez ser instantâneo
            fs.writeFileSync(caminhoCompleto, textoParaSalvar, "utf-8");

            // Exibe o conteúdo para o fzf/vim capturar
            process.stdout.write(textoParaSalvar);
        } else {
            process.stdout.write("Erro: O conteúdo da notícia veio vazio.");
        }
    } catch (erro) {
        process.stdout.write(`Erro na mineração: ${erro.message}`);
    }

    process.exit(0);
}

gerenciar();
