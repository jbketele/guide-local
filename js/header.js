function updateNavbarLanguage() {
    const isEnglish = document.documentElement.lang === "en";

    // Traduction des éléments du menu
    document.querySelectorAll("header nav [data-fr][data-en]").forEach(element => {
        if (element.classList.contains("dropdown-toggle")) {
            element.childNodes[0].textContent = isEnglish
                ? "Discover "
                : "Découvrir ";
        } else if (element.tagName === "A") {
            element.textContent = isEnglish
                ? element.dataset.en
                : element.dataset.fr;
        }
    });

    // Mise à jour des destinations des liens
    document.querySelectorAll("header nav a[data-href-fr][data-href-en]").forEach(link => {
        link.href = isEnglish
            ? link.dataset.hrefEn
            : link.dataset.hrefFr;
    });
}

async function initApp() {

    const response = await fetch("/components/header.html");
    const data = await response.text();

    document.querySelector("#header").innerHTML = data;

    // Adapter le menu à la langue de la page
    updateNavbarLanguage();

    // Mise à jour du sélecteur de langue
    if (typeof updateCurrentFlag === "function") {
        updateCurrentFlag();
    }

    if (typeof updateLanguageLinks === "function") {
        updateLanguageLinks();
    }

    // Burger
    const burger = document.querySelector(".burger");
    const nav = document.querySelector("header nav");

    burger.addEventListener("click", () => {

        const isOpen = burger.classList.toggle("active");

        nav.classList.toggle("active");

        burger.setAttribute("aria-expanded", isOpen);
    });


    // Dropdown
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    dropdownToggle.addEventListener("click", () => {

        const isOpen = dropdownMenu.classList.toggle("active");

        dropdownToggle.setAttribute("aria-expanded", isOpen);
    });
}

initApp();