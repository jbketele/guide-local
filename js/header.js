async function initApp() {

    const response = await fetch("../components/header.html");
    const data = await response.text();

    document.querySelector("#header").innerHTML = data;

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