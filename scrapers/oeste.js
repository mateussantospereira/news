import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

export async function fetchOesteNews() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox"],
    });

    try {
        const page = await browser.newPage();

        // Bloqueia imagens e CSS para o carregamento ser instantâneo
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            if (
                ["image", "stylesheet", "font", "media"].includes(
                    req.resourceType()
                )
            ) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        // Vai para a editoria de Política
        await page.goto("https://revistaoeste.com/politica/", {
            waitUntil: "domcontentloaded",
        });

        const html = await page.content();
        const $ = cheerio.load(html);
        const newsData = [];
        const seenUrls = new Set(); // Para evitar notícias repetidas

        // Seleciona tanto os posts normais quanto os destaques (featured)
        $("article.card-post, article.featured-articles__card").each(
            (i, el) => {
                const $el = $(el);
                let title, url, category, author;

                // Tenta extrair dados idependente da classe do card
                const titleElement = $el.find(
                    ".card-post__title, .featured-articles__title"
                );

                title =
                    titleElement.find("h2").text().trim() ||
                    titleElement.attr("title");
                url = titleElement.attr("href");
                category = $el
                    .find(".card-post__category, .featured-articles__category")
                    .text()
                    .trim();
                author =
                    $el.find(".featured-articles__author-name").text().trim() ||
                    "Redação";

                // Só adiciona se tiver título/URL e se ainda não foi processada
                if (title && url && !seenUrls.has(url)) {
                    seenUrls.add(url);
                    newsData.push({
                        id: newsData.length + 1,
                        title: title.replace(/\s+/g, " ").toUpperCase(), // Remove quebras de linha do texto
                        url,
                        category: category || "Política",
                        author,
                    });
                }
            }
        );

        await browser.close();
        return newsData;
    } catch (err) {
        if (browser) await browser.close();
        return { error: err.message };
    }
}
