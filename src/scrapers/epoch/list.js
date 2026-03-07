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

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        // Bloqueia imagens/CSS para ser rápido como o seu OesteNews
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            if (["image", "stylesheet", "font", "media"].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto("https://www.epochtimesbrasil.com.br/", {
            waitUntil: "networkidle0",
            timeout: 30000
        });

        const html = await page.content();
        const $ = cheerio.load(html);
        const newsData = [];
        const seenUrls = new Set(); // Para evitar as duplicatas das 50 encontradas

        // Usando EXATAMENTE o seu seletor que funcionou para pegar 50
        $(".post-root-element, .embla__slide").each((i, el) => {
            const $el = $(el);

            // Pegamos o primeiro link e o primeiro h3 de dentro de cada bloco
            // O .first() resolve o bug dos títulos grudados
            const anchor = $el.find('a[href^="/p/"]').first();
            const url = anchor.attr("href");
            const title = $el.find("h3").first().text().trim();

            if (title && url) {
                // Normaliza a URL para o formato completo
                const fullUrl = url.startsWith("http") ? url : `https://www.epochtimesbrasil.com.br${url}`;

                // Verifica se já adicionamos para não repetir no JSON final
                if (!seenUrls.has(fullUrl)) {
                    seenUrls.add(fullUrl);

                    newsData.push({
                        id: newsData.length + 1,
                        title: title.replace(/\s+/g, " ").toUpperCase(),
                        url: fullUrl,
                        category: "Geral",
                        author: "Redação"
                    });
                }
            }
        });

        await browser.close();
        return newsData;

    } catch (err) {
        if (browser) await browser.close();
        return { error: err.message };
    }
}
