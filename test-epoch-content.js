// teste_epoch_content.js
import { fetchContent } from "./src/scrapers/epoch/content.js";

// Pegue uma URL real do Epoch para o teste
const urlTeste = "https://www.epochtimesbrasil.com.br/p/uma-pequena-ilha-mediterra-nea-sente-o-calor-da-guerra-dos-minerais-com-a-china";

async function rodarTeste() {
    console.log("🚀 Iniciando minerador Epoch Content...");
    console.log(`🔗 Alvo: ${urlTeste}\n`);

    try {
        const resultado = await fetchContent(urlTeste);

        if (!resultado || resultado.title === "Erro") {
            console.error("❌ Falha na extração. Verifique os seletores.");
            console.log(resultado);
            return;
        }

        console.log("✅ EXTRAÇÃO BEM-SUCEDIDA!");
        console.log("--------------------------------------------------");
        console.log(`TÍTULO: ${resultado.title.toUpperCase()}`);
        console.log(`AUTOR:  ${resultado.author}`);
        console.log(`DATA:   ${resultado.date}`);
        console.log("--------------------------------------------------");
        console.log("\nCONTEÚDO:\n");
        console.log(resultado.body);
        console.log("\n--------------------------------------------------");
        
        // Verifica se o corpo não está vazio
        if (resultado.body.length < 100) {
            console.warn("⚠️  Aviso: O corpo da notícia parece muito curto. Verifique o seletor .post-body.");
        }

    } catch (err) {
        console.error("💥 Erro fatal no teste:", err.message);
    }
}

rodarTeste();
