import puppeteer from "puppeteer";

export async function fetchContent(url) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    try {
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

        const noticia = await page.evaluate(() => {
            // 1. TÍTULO (Busca o H1 principal)
            const title =
                document.querySelector("h1")?.innerText.trim() || "Sem título";

            // 2. AUTOR (Baseado no seu HTML: Beige Luciano-Adams está dentro de um link em um span)
            // Tentamos o link de autor primeiro, depois a classe genérica
            const author =
                document
                    .querySelector("a[href*='/authors/']")
                    ?.innerText.trim() ||
                document.querySelector(".post-author-name")?.innerText.trim() ||
                "Redação Epoch Times";

            // 3. DATA (No seu HTML aparece como '2026-03-04' dentro de um parágrafo)
            const dateText = Array.from(document.querySelectorAll("p"))
                .find((p) => /\d{4}-\d{2}-\d{2}/.test(p.innerText))
                ?.innerText.trim();

            // 4. CONTEÚDO PRINCIPAL (O ID 'content-blocks' é o tiro certeiro no Beehiiv)
            const articleBody =
                document.getElementById("content-blocks") ||
                document.querySelector(".post-content-node") ||
                document.querySelector(".post-body");

            if (!articleBody) return null;

            // 5. LIMPEZA DE RUÍDO
            const selectorsToHide = [
                "button",
                "form",
                "nav",
                ".share-buttons",
                "script",
                "style",
                "figure",
                ".adsbygoogle",
                ".subscribe-box",
            ];
            selectorsToHide.forEach((s) => {
                articleBody.querySelectorAll(s).forEach((el) => el.remove());
            });

            // 6. EXTRAÇÃO LINEAR
            // Pegamos P e os títulos H1, H2, H3 de dentro do conteúdo
            const elements = Array.from(
                articleBody.querySelectorAll("p, h1, h2, h3, h4")
            );

            const bodyLimpo = elements
                .map((el) => {
                    const text = el.innerText.trim();
                    if (text.length === 0) return null;

                    // Se for cabeçalho, destaca
                    if (el.tagName.startsWith("H")) {
                        return `\n[ ${text.toUpperCase()} ]`;
                    }
                    return text;
                })
                .filter(
                    (text) =>
                        text &&
                        text.length > 5 &&
                        !text.toLowerCase().includes("leia também") &&
                        !text
                            .toLowerCase()
                            .includes("ilustração do epoch times") &&
                        !text.toLowerCase().includes("inscreva-se")
                )
                .join("\n\n");

            return {
                title,
                author,
                date: dateText || "Data não disponível",
                body: bodyLimpo,
            };
        });

        await browser.close();
        return noticia;
    } catch (error) {
        if (browser) await browser.close();
        return {
            title: "Erro na Leitura",
            author: "N/A",
            date: "",
            body: `Erro: ${error.message}`,
        };
    }
}
