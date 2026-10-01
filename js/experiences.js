const modal = document.querySelector("#experienceModal");
const modalContent = document.querySelector("#modalContent");
const closeButton = document.querySelector(".modal-close");
const overlay = document.querySelector(".modal-overlay");

document.querySelectorAll(".experience-card").forEach(card => {

    card.addEventListener("click", async () => {

        const page = card.dataset.page;

        const response = await fetch(page);
        const html = await response.text();

        modalContent.innerHTML = html;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
    });

});

function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modalContent.innerHTML = "";
}

closeButton.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);