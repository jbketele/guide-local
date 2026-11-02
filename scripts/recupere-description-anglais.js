const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const rootDir = path.resolve(__dirname, "..");
const htmlDir = path.join(rootDir, "en");
const jsonDir = path.join(rootDir, "data");

let updated = 0;
let notFound = 0;
let missingJson = 0;
let errors = 0;

function normalize(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

function getHtmlFiles(directory) {
    if (!fs.existsSync(directory)) return [];

    return fs.readdirSync(directory, { withFileTypes: true })
        .flatMap(entry => {
            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                return getHtmlFiles(fullPath);
            }

            return entry.isFile() && entry.name.endsWith(".html")
                ? [fullPath]
                : [];
        });
}

function updateJsonFromHtml(htmlFile) {
    const relativePath = path.relative(htmlDir, htmlFile);
    const pageName = path.basename(relativePath, ".html");

    // Exemple : en/cabourg.html -> data/cabourg-en.json
    const jsonFile = path.join(jsonDir, `${pageName}-en.json`);

    if (!fs.existsSync(jsonFile)) {
        console.log(`⏭️ Aucun JSON associé à ${pageName}.html`);
        missingJson++;
        return;
    }

    let $;
    let json;

    try {
        const html = fs.readFileSync(htmlFile, "utf8");
        $ = cheerio.load(html);

        json = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
    } catch (error) {
        console.error(`❌ Erreur de lecture pour ${pageName} : ${error.message}`);
        errors++;
        return;
    }

    if (!json || typeof json !== "object" || Array.isArray(json)) {
        console.error(`❌ Structure JSON incorrecte : ${pageName}-en.json`);
        errors++;
        return;
    }

    // Les deux collections peuvent contenir des cartes
    const collections = ["lieux", "restaurants"];

    let fileUpdated = false;

    // Parcourir les sections qui possèdent un id
    $("section[id]").each((_, section) => {
        const sectionId = $(section).attr("id");

        $(section).find(".incontournable-card").each((_, element) => {
            const card = $(element);

            const name = card.find("h3").first().text().trim();

            const category = card
                .find(".category")
                .first()
                .text()
                .trim();

            const description = card
                .find(".incontournable-content p")
                .first()
                .text()
                .trim();

            if (!name || !description) return;

            let item = null;
            let collectionFound = null;

            for (const collection of collections) {
                if (!Array.isArray(json[collection])) continue;

                item = json[collection].find(entry =>
                    normalize(entry.name) === normalize(name)
                );

                if (item) {
                    collectionFound = collection;
                    break;
                }
            }

            if (!item) {
                console.log(`⚠️ Lieu non trouvé dans ${pageName}-en.json : ${name}`);
                notFound++;
                return;
            }

            item.description = description;

            if (category) {
                item.category = category;
            }

            // Le type est défini par l'id de la section,
            // uniquement pour les lieux.
            if (collectionFound === "lieux" && sectionId) {
                item.type = sectionId;
            }

            updated++;
            fileUpdated = true;

            console.log(`✅ ${pageName} : ${name}`);
        });
    });

    if (fileUpdated) {
        try {
            fs.writeFileSync(
                jsonFile,
                JSON.stringify(json, null, 2) + "\n",
                "utf8"
            );

            console.log(`💾 JSON mis à jour : ${pageName}-en.json\n`);
        } catch (error) {
            console.error(`❌ Erreur d'écriture pour ${pageName} : ${error.message}`);
            errors++;
        }
    }
}

// Exécution
if (!fs.existsSync(htmlDir)) {
    console.error(`❌ Dossier HTML introuvable : ${htmlDir}`);
    process.exit(1);
}

if (!fs.existsSync(jsonDir)) {
    console.error(`❌ Dossier JSON introuvable : ${jsonDir}`);
    process.exit(1);
}

const htmlFiles = getHtmlFiles(htmlDir);

console.log(`📂 ${htmlFiles.length} fichier(s) HTML trouvé(s).\n`);

for (const htmlFile of htmlFiles) {
    updateJsonFromHtml(htmlFile);
}

console.log("\n========== RÉCAPITULATIF ==========");
console.log(`Descriptions et catégories mises à jour : ${updated}`);
console.log(`Lieux non trouvés : ${notFound}`);
console.log(`Pages sans JSON associé : ${missingJson}`);
console.log(`Erreurs : ${errors}`);
console.log("===================================");