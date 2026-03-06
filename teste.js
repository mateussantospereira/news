import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import fs from "fs";

export async function fetchEpochNews() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox"],
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        console.log("Acessando o site...");
        await page.goto("https://www.epochtimesbrasil.com.br/", {
            waitUntil: "networkidle0",
            timeout: 30000
        });

        const html = await page.content();

        // Debug para você conferir
        fs.writeFileSync("./debug_epoch.html", html, "utf-8");

        const $ = cheerio.load(html);
        const newsData = [];
        const seenUrls = new Set(); // Para matar as duplicatas

        // O SEGREDO: Pegamos o container, mas limpamos o que pegamos de dentro
        $(".post-root-element, .embla__slide").each((i, el) => {
            const $el = $(el);

            // Pegamos apenas o PRIMEIRO link e o PRIMEIRO h3 de cada bloco
            // O .first() impede que ele junte títulos de notícias vizinhas
            const anchor = $el.find('a[href^="/p/"]').first();
            const url = anchor.attr("href");
            const title = $el.find("h3").first().text().trim();

            // Validação
            if (title && url) {
                // Monta URL completa
                const fullUrl = url.startsWith("http") ? url : `https://www.epochtimesbrasil.com.br${url}`;

                // Se já adicionamos essa URL, ignoramos para não repetir no JSON
                if (!seenUrls.has(fullUrl)) {
                    seenUrls.add(fullUrl);

                    newsData.push({
                        id: newsData.length + 1,
                        title: title.replace(/\s+/g, " ").toUpperCase(),
                        url: fullUrl
                    });
                }
            }
        });

        await browser.close();
        return newsData;

    } catch (err) {
        console.error("❌ Erro:", err.message);
        if (browser) await browser.close();
        return { error: err.message };
    }
}

fetchEpochNews().then(res => console.log("Resultado final limpo:", res));
