const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const HTML_DIR = path.join(ROOT, "decouvrir");
const BACKUP_DIR = path.join(ROOT, "data-backup");

// Correspondance entre les fichiers JSON et HTML
const cities = [
    { json: "cabourg.json", html: "cabourg.html" },
    { json: "deauville.json", html: "deauville.html" },
    { json: "dives.json", html: "dives.html" },
    { json: "honfleur.json", html: "honfleur.html" },
    { json: "houlgate.json", html: "houlgate.html" },
    { json: "merville.json", html: "merville-franceville.html" },
    { json: "trouville.json", html: "trouville.html" },
    { json: "villers.json", html: "villers.html" }
];

function normalize(value = "") {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

// Extraction des cartes contenant une image et un h3
function extractImages(html) {
    const images = [];

    const cardRegex =
        /<(article|div|a)\b[^>]*class=["'][^"']*(?:card|lieu|restaurant)[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi;

    let cardMatch;

    while ((cardMatch = cardRegex.exec(html)) !== null) {
        const cardHTML = cardMatch[2];

        const imgMatch = cardHTML.match(/<img\b[^>]*>/i);

        if (!imgMatch) continue;

        const srcMatch = imgMatch[0].match(
            /\bsrc=["']([^"']+)["']/i
        );

        const altMatch = imgMatch[0].match(
            /\balt=["']([^"']*)["']/i
        );

        const h3Match = cardHTML.match(
            /<h3\b[^>]*>([\s\S]*?)<\/h3>/i
        );

        if (!srcMatch) continue;

        const title = h3Match
            ? h3Match[1]
                .replace(/<[^>]*>/g, "")
                .replace(/&amp;/g, "&")
                .trim()
            : "";

        images.push({
            src: srcMatch[1],
            title,
            alt: altMatch ? altMatch[1].trim() : ""
        });
    }

    return images;
}

// Transforme le chemin HTML en chemin utilisable dans le JSON
function normalizeImagePath(src) {
    const filename = path.basename(src.split("?")[0]);

    return `/images/${filename}`;
}

// Recherche une image par nom exact du h3, puis par alt
function findImage(item, imageIndex) {
    const nameKey = normalize(item.name);

    // Priorité au h3
    const imageByTitle = imageIndex.find(
        image => image.titleKey === nameKey
    );

    if (imageByTitle) return imageByTitle.src;

    // Correspondance complémentaire avec alt
    const imageByAlt = imageIndex.find(
        image => image.altKey === nameKey
    );

    if (imageByAlt) return imageByAlt.src;

    return null;
}

// Réorganise les propriétés avec image en première position
function putImageFirst(item, imagePath) {
    const updatedItem = {};

    updatedItem.image = imagePath;

    for (const [key, value] of Object.entries(item)) {
        if (key !== "image") {
            updatedItem[key] = value;
        }
    }

    return updatedItem;
}

function main() {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });

    for (const city of cities) {
        const htmlPath = path.join(HTML_DIR, city.html);
        const jsonPath = path.join(DATA_DIR, city.json);

        if (!fs.existsSync(htmlPath) || !fs.existsSync(jsonPath)) {
            console.log(`⚠️ Fichier manquant : ${city.json} ou ${city.html}`);
            continue;
        }

        const html = fs.readFileSync(htmlPath, "utf8");
        const data = JSON.parse(
            fs.readFileSync(jsonPath, "utf8")
        );

        // Sauvegarde du JSON original
        const backupPath = path.join(BACKUP_DIR, city.json);

        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(jsonPath, backupPath);
        }

        const images = extractImages(html).map(image => ({
            src: normalizeImagePath(image.src),
            titleKey: normalize(image.title),
            altKey: normalize(image.alt)
        }));

        let added = 0;
        let reordered = 0;
        let unmatched = 0;

        for (const collectionName of ["lieux", "restaurants"]) {
            const collection = data[collectionName];

            if (!Array.isArray(collection)) continue;

            data[collectionName] = collection.map(item => {
                const imagePath = findImage(item, images);

                // Une image existante est conservée si aucune correspondance n'est trouvée
                const finalImage = imagePath || item.image;

                if (!finalImage) {
                    unmatched++;
                    console.log(`❓ ${city.json} : aucune image pour ${item.name}`);
                    return item;
                }

                if (!item.image) {
                    added++;
                    console.log(`✅ ${city.json} : ${item.name} → ${finalImage}`);
                } else if (imagePath && item.image !== imagePath) {
                    console.log(`🔄 ${city.json} : ${item.name} → ${finalImage}`);
                }

                const wasFirst = Object.keys(item)[0] === "image";

                if (!wasFirst) reordered++;

                return putImageFirst(item, finalImage);
            });
        }

        fs.writeFileSync(
            jsonPath,
            JSON.stringify(data, null, 2) + "\n",
            "utf8"
        );

        console.log(
            `\n${city.json} : ${added} image(s) ajoutée(s), ` +
            `${reordered} objet(s) réordonné(s), ` +
            `${unmatched} élément(s) sans image.\n`
        );
    }

    console.log("Terminé ! Sauvegardes disponibles dans data-backup/.");
}

main();