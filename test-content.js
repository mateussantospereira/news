import { fetchContent } from './scrapers/content.js';

// URL de teste (pode trocar por qualquer uma da Oeste que você pegou no outro scraper)
const testUrl = 'https://revistaoeste.com/politica/policia-federal-investiga-irregularidades-em-r-390-milhoes-do-fundo-previdenciario-do-amazonas/';

console.log("--- Iniciando extração de conteúdo ---");

fetchContent(testUrl).then(res => {
    if (res.error) {
        console.error("Erro:", res.error);
    } else {
        console.log(res.body)
        console.log("\n--- Fim da Notícia ---");
    }
});
