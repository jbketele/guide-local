async function initFooter() {

    const response = await fetch("../components/footer.html");
    const data = await response.text();

    document.querySelector("#footer").innerHTML = data;
}

initFooter();