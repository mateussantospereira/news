import fs from "fs";
import path from "path";
import { fetchOesteNews } from "./scrapers/oeste/list.js";
import { fetchEpochNews } from "./scrapers/epoch/list.js";
// import { fetchOutroNews } from './scrapers/outro-site.js'; // Exemplo para o futuro

const CACHE_DIR = "./cache";
const CACHE_EXPIRATION = 60 * 60 * 1000; // 1 hora em milissegundos
//const CACHE_EXPIRATION =  1000; // 1 hora em milissegundos

/**
 * Função para gerenciar o cache e a chamada dos scrapers
 */
async function getNews(source) {
    const cacheFile = path.join(CACHE_DIR, `${source}.json`);

    // 1. Verifica se existe cache válido
    if (fs.existsSync(cacheFile)) {
        //        console.log("Verificando o tempo do cache\n\n\n");
        const stats = fs.statSync(cacheFile);
        const isExpired = Date.now() - stats.mtimeMs > CACHE_EXPIRATION;

        if (!isExpired) {
            //          console.log("Carregando o cache\n\n\n");
            const cachedData = fs.readFileSync(cacheFile, "utf-8");
            return JSON.parse(cachedData);
        }
    }

    // console.log("Cache expirado!!!")

    // 2. Se não houver cache ou estiver expirado, executa o scraper correspondente
    let newsData = [];

    try {
        if (source === "oeste") {
            newsData = await fetchOesteNews();
        } else if (source === "epoch") {
            newsData = await fetchEpochNews();
        } else {
            throw new Error("Fonte desconhecida");
        }

        // 3. Salva o novo cache se a busca foi bem sucedida
        if (Array.isArray(newsData) && newsData.length > 0) {
            if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);
            fs.writeFileSync(cacheFile, JSON.stringify(newsData, null, 2));
        }

        return newsData;
    } catch (error) {
        console.error(
            `Erro ao buscar notícias da fonte ${source}:`,
            error.message
        );
        return [];
    }
}

// Lógica de execução via terminal: node index.js <fonte>
const sourceArg = process.argv[2]?.toLowerCase();

if (!sourceArg) {
    console.log(
        JSON.stringify({ error: "Informe a fonte. Ex: node index.js oeste" })
    );
    process.exit(1);
}

getNews(sourceArg).then((data) => {
    // Retorna o JSON puro para que qualquer programa (ou o terminal) possa ler
    console.log(JSON.stringify(data, null, 2));
});
