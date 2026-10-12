const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");

const files = fs.readdirSync(DATA_DIR)
    .filter(file => file.endsWith(".json"));

for (const file of files) {
    const filePath = path.join(DATA_DIR, file);

    const data = JSON.parse(
        fs.readFileSync(filePath, "utf8")
    );

    let modified = 0;

    function correctImagePaths(items) {
        if (!Array.isArray(items)) return;

        for (const item of items) {
            if (!item || typeof item !== "object" || !item.image) {
                continue;
            }

            const oldPath = item.image;

            // Remplace ./images/ ou ../images/ par /images/
            const newPath = oldPath.replace(
                /^(?:\.\.\/|\.\/)+images\//,
                "/images/"
            );

            if (newPath !== oldPath) {
                item.image = newPath;
                modified++;

                console.log(
                    `${file} : ${item.name} | ${oldPath} → ${newPath}`
                );
            }
        }
    }

    correctImagePaths(data.lieux);
    correctImagePaths(data.restaurants);

    if (modified > 0) {
        fs.writeFileSync(
            filePath,
            JSON.stringify(data, null, 2) + "\n",
            "utf8"
        );
    }

    console.log(`${file} : ${modified} chemin(s) corrigé(s).\n`);
}

console.log("Correction des chemins terminée !");