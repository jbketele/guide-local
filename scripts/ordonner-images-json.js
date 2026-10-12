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

    // Déplace image en première position dans chaque objet
    function moveImageFirst(items) {
        if (!Array.isArray(items)) return;

        for (const item of items) {
            if (
                item &&
                typeof item === "object" &&
                !Array.isArray(item) &&
                Object.prototype.hasOwnProperty.call(item, "image")
            ) {
                const reorderedItem = {
                    image: item.image,
                    ...item
                };

                // Reconstruit l'objet en conservant l'ordre des propriétés
                for (const key of Object.keys(item)) {
                    delete item[key];
                }

                Object.assign(item, reorderedItem);

                modified++;
            }
        }
    }

    moveImageFirst(data.lieux);
    moveImageFirst(data.restaurants);

    if (modified > 0) {
        fs.writeFileSync(
            filePath,
            JSON.stringify(data, null, 2) + "\n",
            "utf8"
        );
    }

    console.log(`${file} : ${modified} objet(s) réordonné(s).`);
}