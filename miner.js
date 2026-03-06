import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export async function extrairTextoRapido(url) {
    try {
        // Busca o HTML puro sem abrir navegador
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const h1s = Array.from(document.querySelectorAll('h1'));
        const titulo = h1s.find(h => h.textContent.trim().length > 0)?.textContent.trim() || "Sem título";
        
        const paragrafos = Array.from(document.querySelectorAll('article p, .entry-content p'));
        const conteudo = paragrafos
            .map(p => p.textContent.trim())
            .filter(t => t.length > 25)
            .join('\n\n');

        return { titulo, conteudo };
    } catch (e) {
        return { titulo: "Erro", conteudo: "Não foi possível carregar o preview." };
    }
}
