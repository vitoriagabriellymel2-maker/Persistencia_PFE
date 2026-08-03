// Elementos
const btnLocalizar = document.querySelector("#btn-localizar");
const statusLocalizacao = document.querySelector("#status-localizacao");
const papel = document.querySelector("#papel");
const lixeira = document.querySelector("#lixeira");

// Mostra última localização salva ao carregar a página
function mostrarUltimaLocalizacao() {
    const salva = localStorage.getItem("ultimaLocalizacao");
    if (salva) {
        statusLocalizacao.textContent = `Sua última localização salva foi: ${salva}`;
    } else {
        statusLocalizacao.textContent = "Nenhuma localização capturada ainda.";
    }
}
mostrarUltimaLocalizacao();

// Captura de posição
btnLocalizar.addEventListener("click", () => {
    if (!navigator.geolocation) {
        statusLocalizacao.textContent = "Geolocalização não é suportada nesse navegador.";
        return;
    }

    statusLocalizacao.textContent = "Buscando localização...";

    navigator.geolocation.getCurrentPosition(
        (posicao) => {
            const lat = posicao.coords.latitude.toFixed(6);
            const long = posicao.coords.longitude.toFixed(6);
            const coordenadas = `Lat: ${lat}, Long: ${long}`;

            localStorage.setItem("ultimaLocalizacao", coordenadas);
            statusLocalizacao.textContent = `Localização atual: ${coordenadas}`;
        },
        (erro) => {
            statusLocalizacao.textContent = `Erro ao obter localização: ${erro.message}`;
        }
    );
});

// Drag and Drop: arrastar papel até a lixeira limpa o localStorage
papel.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text", e.target.id);
});

lixeira.addEventListener("dragover", (e) => {
    e.preventDefault();
});

lixeira.addEventListener("drop", (e) => {
    e.preventDefault();

    localStorage.removeItem("ultimaLocalizacao");
    mostrarUltimaLocalizacao();

    papel.setAttribute("draggable", "false");
});