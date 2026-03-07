import { fetchContent } from "./scrapers/content.js";

// URL de teste (pode trocar por qualquer uma da Oeste que você pegou no outro scraper)
const testUrl =
    "https://www.epochtimesbrasil.com.br/p/uma-pequena-ilha-mediterra-nea-sente-o-calor-da-guerra-dos-minerais-com-a-china";

console.log("--- Iniciando extração de conteúdo ---");

fetchContent(testUrl).then((res) => {
    if (res.error) {
        console.error("Erro:", res.error);
    } else {
        console.log(res.title);
        console.log(res.date);
        console.log(res.author);
        console.log(res.body);
        console.log("\n--- Fim da Notícia ---");
    }
});
