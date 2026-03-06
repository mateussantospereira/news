import puppeteer from "puppeteer";

export async function fetchContent(url) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

        const noticia = await page.evaluate(() => {
            // 1. CAPTURA DOS METADADOS (Antes da limpeza do DOM)
            const title =
                document.querySelector("h1")?.innerText.trim() || "Sem título";
            const author =
                document
                    .querySelector(".card-author__title")
                    ?.innerText.trim() || "Redação";

            // Lógica robusta para a data:
            const dateSpan = document.querySelector(".card-author__time--date");
            const timeTag = document.querySelector("time.card-author__time");

            let dataFinal = "";
            if (dateSpan) {
                // Pega o "06 mar 2026"
                dataFinal = dateSpan.innerText.trim();
            } else if (timeTag) {
                // Fallback: tenta pegar do atributo datetime (2026-03-06...)
                dataFinal =
                    timeTag.getAttribute("datetime")?.split("T")[0] || "";
            }

            // 2. LEAD / SUBTÍTULO
            const lead =
                document
                    .querySelector("h2:not(.wp-block-heading)")
                    ?.innerText.trim() || "";

            // 3. LIMPEZA DO ARTIGO
            const article = document.querySelector("article");
            if (!article) return null;

            const seletoresLixo = [
                "header",
                ".card-author__description",
                "#audiome-container",
                ".share",
                "figure",
                "script",
                "style",
                ".comments",
                ".related-posts",
            ];
            seletoresLixo.forEach((s) =>
                article.querySelectorAll(s).forEach((el) => el.remove())
            );

            // 4. CORPO DA NOTÍCIA (LINEAR: P + H2 + H3)
            const elementos = Array.from(
                article.querySelectorAll(
                    "p, h2.wp-block-heading, h3.wp-block-heading"
                )
            );

            const bodyLimpo = elementos
                .map((el) => {
                    const texto = el.innerText.trim();
                    if (el.tagName.startsWith("H")) {
                        return `\n[ ${texto.toUpperCase()} ]`;
                    }
                    return texto;
                })
                .filter(
                    (texto) =>
                        texto.length > 10 &&
                        !texto.includes("Leia também") &&
                        !texto.includes("Leia mais") &&
                        !texto.includes("+ Leia mais notícias")
                )
                .join("\n\n");

            return {
                title: title,
                author: author,
                date: dataFinal || "Data não encontrada",
                body: lead ? `${lead}\n\n${bodyLimpo}` : bodyLimpo,
            };
        });

        await browser.close();
        return noticia;
    } catch (error) {
        if (browser) await browser.close();
        return { title: "Erro", author: "N/A", date: "", body: error.message };
    }
}

// Execução de teste
if (process.argv[2]) {
    (async () => {
        const result = await fetchContent(process.argv[2]);
        console.log(`\n${result.title.toUpperCase()}\n`);
        console.log(`\n${result.date}\n`);
        console.log(`\nAutor: ${result.author}\n\n`);
        console.log(result.body);
    })();
}
