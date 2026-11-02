// =========================
// GESTION DES LIENS DE LANGUE
// =========================

function updateLanguageLinks() {
    const currentPath = window.location.pathname;

    const frenchLink = document.querySelector(".language-link-fr");
    const englishLink = document.querySelector(".language-link-en");

    if (!frenchLink || !englishLink) return;

    // Correspondances des pages françaises et anglaises
    const pageMappings = {
        "/decouvrir/cabourg.html": "/en/cabourg.html",
        "/decouvrir/trouville.html": "/en/trouville.html",
        "/decouvrir/houlgate.html": "/en/houlgate.html",
        "/decouvrir/deauville.html": "/en/deauville.html",
        "/decouvrir/villers.html": "/en/villers.html",
        "/decouvrir/dives.html": "/en/dives.html",
        "/decouvrir/merville-franceville.html": "/en/merville-franceville.html",
        "/decouvrir/honfleur.html": "/en/honfleur.html",
        "/experiences/index.html": "/en/experiences/index.html",
        "/pratique.html": "/en/pratique.html"
    };

    // Accueil
    if (currentPath === "/" || currentPath === "/en/" || currentPath === "/en") {
        frenchLink.href = "/";
        englishLink.href = "/en/";
        return;
    }

    // Page anglaise
    if (currentPath.startsWith("/en/")) {
        const frenchPath = Object.keys(pageMappings).find(
            path => pageMappings[path] === currentPath
        );

        frenchLink.href = frenchPath || "/";
        englishLink.href = currentPath;
        return;
    }

    // Page française
    if (pageMappings[currentPath]) {
        frenchLink.href = currentPath;
        englishLink.href = pageMappings[currentPath];
        return;
    }

    // Autres pages
    frenchLink.href = currentPath;
    englishLink.href = "/en/";
}

// =========================
// DRAPEAU SELON LA LANGUE
// =========================

function updateCurrentFlag() {
    const currentLanguage = document.documentElement.lang;
    console.log("Langue actuelle :", currentLanguage);
    const flag = document.querySelector(".current-flag");

    if (!flag) return;

    flag.classList.remove("fi-fr", "fi-gb");
    flag.classList.add(currentLanguage === "en" ? "fi-gb" : "fi-fr");
}

// =========================
// SÉLECTEUR DE LANGUE
// =========================

document.addEventListener("click", function (event) {
    const toggle = event.target.closest(".language-toggle");

    // Clic sur le bouton de langue
    if (toggle) {
        const switcher = toggle.closest(".language-switcher");
        const menu = switcher.querySelector(".language-menu");

        const isOpen = menu.classList.contains("active");

        menu.classList.toggle("active", !isOpen);
        toggle.setAttribute("aria-expanded", String(!isOpen));

        return;
    }

    // Fermer le menu si clic à l'extérieur
    document.querySelectorAll(".language-switcher").forEach((switcher) => {
        if (!switcher.contains(event.target)) {
            const toggle = switcher.querySelector(".language-toggle");
            const menu = switcher.querySelector(".language-menu");

            if (toggle && menu) {
                menu.classList.remove("active");
                toggle.setAttribute("aria-expanded", "false");
            }
        }
    });
});

// Fermer avec Échap
document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    document.querySelectorAll(".language-switcher").forEach((switcher) => {
        const toggle = switcher.querySelector(".language-toggle");
        const menu = switcher.querySelector(".language-menu");

        if (toggle && menu) {
            menu.classList.remove("active");
            toggle.setAttribute("aria-expanded", "false");
        }
    });
});

