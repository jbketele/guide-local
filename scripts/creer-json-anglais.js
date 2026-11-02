const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../data");

function createEnglishJsonFiles() {
    if (!fs.existsSync(dataDir)) {
        console.error("Le dossier data est introuvable.");
        return;
    }

    const files = fs.readdirSync(dataDir).filter(file =>
        file.endsWith(".json") &&
        !file.endsWith("-en.json")
    );

    let created = 0;
    let skipped = 0;

    for (const file of files) {
        const frenchPath = path.join(dataDir, file);

        const englishFile = file.replace(/\.json$/, "-en.json");
        const englishPath = path.join(dataDir, englishFile);

        // Ne pas écraser un fichier anglais déjà existant
        if (fs.existsSync(englishPath)) {
            console.log(`⏭️ Déjà existant : ${englishFile}`);
            skipped++;
            continue;
        }

        try {
            const content = fs.readFileSync(frenchPath, "utf8");
            const json = JSON.parse(content);

            fs.writeFileSync(
                englishPath,
                JSON.stringify(json, null, 4) + "\n",
                "utf8"
            );

            console.log(`✅ Créé : ${englishFile}`);
            created++;
        } catch (error) {
            console.error(`❌ Erreur avec ${file} :`, error.message);
        }
    }

    console.log("\n--- Résultat ---");
    console.log(`Fichiers créés : ${created}`);
    console.log(`Fichiers ignorés : ${skipped}`);
}

createEnglishJsonFiles();