const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

const excludedDirs = [
    ".git",
    "node_modules",
    ".netlify",
    "dist",
    "build"
];

const scriptTag = '    <script src="/js/langues.js"></script>';

let modified = 0;
let skipped = 0;

function processDirectory(directory) {
    const entries = fs.readdirSync(directory, {
        withFileTypes: true
    });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            if (excludedDirs.includes(entry.name)) continue;

            processDirectory(fullPath);
            continue;
        }

        if (!entry.isFile() || !entry.name.endsWith(".html")) continue;

        let content = fs.readFileSync(fullPath, "utf8");

        // Ignorer si langues.js est déjà chargé
        if (/<script\b[^>]*\bsrc=["'][^"']*langues\.js(?:[?#][^"']*)?["']/i.test(content)) {
            console.log(`⏭️ Déjà présent : ${fullPath}`);
            skipped++;
            continue;
        }

        // Ignorer si </body> est absent
        if (!/<\/body\s*>/i.test(content)) {
            console.log(`⏭️ Pas de balise </body> : ${fullPath}`);
            skipped++;
            continue;
        }

        // Calculer le chemin relatif du script depuis la page HTML
        const relativeScriptPath = path
            .relative(path.dirname(fullPath), path.join(rootDir, "js", "langues.js"))
            .split(path.sep)
            .join("/");

        const tag = `    <script src="${relativeScriptPath.startsWith(".") ? relativeScriptPath : "./" + relativeScriptPath}"></script>`;

        // Insérer le script juste avant </body>
        content = content.replace(/<\/body\s*>/i, `${tag}\n</body>`);

        fs.writeFileSync(fullPath, content, "utf8");

        console.log(`✅ Ajout effectué : ${fullPath}`);
        modified++;
    }
}

processDirectory(rootDir);

console.log("\n---------- RÉSUMÉ ----------");
console.log(`Pages modifiées : ${modified}`);
console.log(`Pages ignorées  : ${skipped}`);
