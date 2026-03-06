import fs from 'fs';
import path from 'path';
import wrap from 'word-wrap';

const ARTICLE_CACHE = './cache/artigos';

function readArticle(url) {
    // Gera o mesmo hash que o index.js usa para encontrar o arquivo
    const hash = Buffer.from(url).toString('base64').substring(0, 20).replace(/\//g, '_');
    const filePath = path.join(ARTICLE_CACHE, `${hash}.txt`);

    if (!fs.existsSync(filePath)) {
        console.log("❌ Artigo não encontrado no cache. Baixe-o primeiro.");
        return;
    }

    const rawContent = fs.readFileSync(filePath, 'utf-8');

    // Formatação para leitura
    const formatted = wrap(rawContent, {
        width: 80,      // Largura clássica de leitura
        indent: '  '    // Margem esquerda para não colar no canto
    });

    console.clear(); // Limpa o terminal para focar na leitura
    console.log("\n" + "=".repeat(80));
    console.log(formatted);
    console.log("=".repeat(80) + "\n");
    console.log(" [ Pressione CTRL+C para sair ]\n");
}

const urlArg = process.argv[2];
if (urlArg) {
    readArticle(urlArg);
} else {
    console.log("Uso: node reader.js [URL]");
}
