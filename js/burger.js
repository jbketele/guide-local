const burger = document.querySelector(".burger");
const nav = document.querySelector("header nav");

burger.addEventListener("click", () => {
    const isOpen = burger.classList.toggle("active");

    nav.classList.toggle("active");

    burger.setAttribute("aria-expanded", isOpen);
});