const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const excludedDirs = [
    ".git",
    "node_modules",
    ".netlify",
    "dist",
    "build",
];

const cdn =
    '    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/css/flag-icons.min.css">';

let modified = 0;
let skipped = 0;

function processDirectory(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        // Ignorer les dossiers exclus
        if (entry.isDirectory()) {
            if (excludedDirs.includes(entry.name)) continue;

            processDirectory(fullPath);
            continue;
        }

        // Ne traiter que les fichiers HTML
        if (!entry.isFile() || !entry.name.endsWith(".html")) continue;

        let content = fs.readFileSync(fullPath, "utf8");

        // Ignorer si le CDN est déjà présent
        if (content.includes("flag-icons")) {
            console.log(`⏭️ CDN déjà présent : ${fullPath}`);
            skipped++;
            continue;
        }

        // Ignorer si la balise </head> est absente
        if (!/<\/head\s*>/i.test(content)) {
            console.log(`⏭️ Pas de balise </head> : ${fullPath}`);
            skipped++;
            continue;
        }

        // Ajouter le CDN avant </head>
        content = content.replace(/<\/head\s*>/i, `${cdn}\n</head>`);

        fs.writeFileSync(fullPath, content, "utf8");

        console.log(`✅ CDN ajouté : ${fullPath}`);
        modified++;
    }
}

processDirectory(rootDir);

console.log("\n---------- RÉSUMÉ ----------");
console.log(`Pages modifiées : ${modified}`);
console.log(`Pages ignorées  : ${skipped}`);
