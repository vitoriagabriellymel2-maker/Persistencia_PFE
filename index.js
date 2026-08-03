const CHAVE_LOCALSTORAGE = 'trailfix_ultima_localizacao';

const btnCapturar = document.getElementById('btn-capturar');
const conteudoTela = document.getElementById('conteudo-tela');
const statusSatelite = document.getElementById('status-satelite');
const relogio = document.getElementById('relogio');
const mensagemErro = document.getElementById('mensagem-erro');

const itemPapel = document.getElementById('item-papel');
const zonaLixeira = document.getElementById('zona-lixeira');

function atualizarRelogio() {
  const agora = new Date();
  const horas = String(agora.getHours()).padStart(2, '0');
  const minutos = String(agora.getMinutes()).padStart(2, '0');
  relogio.textContent = `${horas}:${minutos}`;
}
atualizarRelogio();
setInterval(atualizarRelogio, 1000 * 15);

function formatarDataHora(timestamp) {
  const data = new Date(timestamp);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function exibirCoordenadas(latitude, longitude, timestamp, comoUltimaSalva) {
  const lat = latitude.toFixed(5);
  const lon = longitude.toFixed(5);

  const tituloLinha = comoUltimaSalva
    ? '&gt; Sua última localização'
    : '&gt; Localização atual';

  const subtituloLinha = comoUltimaSalva ? 'salva foi:' : 'capturada:';

  conteudoTela.innerHTML = `
    <p class="linha-lcd pequena">${tituloLinha}</p>
    <p class="linha-lcd pequena">${subtituloLinha}</p>
    <p class="linha-lcd destaque">LAT ${lat}</p>
    <p class="linha-lcd destaque">LON ${lon}</p>
    <p class="linha-lcd pequena">registrado em ${formatarDataHora(timestamp)}</p>
  `;

  statusSatelite.textContent = '● GPS FIXO';
  statusSatelite.classList.add('ativo');
}
function exibirTelaVazia() {
  conteudoTela.innerHTML = `
    <p class="linha-lcd">&gt; Aperte CAPTURAR</p>
    <p class="linha-lcd">&gt; para localizar</p>
  `;
  statusSatelite.textContent = '● SEM SINAL';
  statusSatelite.classList.remove('ativo');
}

function carregarUltimaLocalizacaoSalva() {
  const dadosSalvos = localStorage.getItem(CHAVE_LOCALSTORAGE);

  if (!dadosSalvos) {
    exibirTelaVazia();
    return;
  }

  try {
    const { latitude, longitude, timestamp } = JSON.parse(dadosSalvos);
    exibirCoordenadas(latitude, longitude, timestamp, true);
  } catch (erro) 

  {

    localStorage.removeItem(CHAVE_LOCALSTORAGE);
    exibirTelaVazia();
  }
}

btnCapturar.addEventListener('click', () => {
  mensagemErro.textContent = '';

  if (!navigator.geolocation) {
    mensagemErro.textContent = 'Seu navegador não suporta geolocalização.';
    return;
  }

  statusSatelite.textContent = '● BUSCANDO...';
  statusSatelite.classList.remove('ativo');

  navigator.geolocation.getCurrentPosition(
    (posicao) => {
      const { latitude, longitude } = posicao.coords;
      const timestamp = Date.now();

      localStorage.setItem(
        CHAVE_LOCALSTORAGE,
        JSON.stringify({ latitude, longitude, timestamp })
      );

      exibirCoordenadas(latitude, longitude, timestamp, false);
    },
    (erro) => {
      statusSatelite.textContent = '● SEM SINAL';
      statusSatelite.classList.remove('ativo');

      switch (erro.code) {
        case erro.PERMISSION_DENIED:
          mensagemErro.textContent = 'Permissão de localização negada pelo usuário.';
          break;
        case erro.POSITION_UNAVAILABLE:
          mensagemErro.textContent = 'Localização indisponível no momento.';
          break;
        case erro.TIMEOUT:
          mensagemErro.textContent = 'Tempo esgotado ao buscar localização.';
          break;
        default:
          mensagemErro.textContent = 'Não foi possível obter a localização.';
      }
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});


itemPapel.addEventListener('dragstart', (evento) => {
  itemPapel.classList.add('arrastando');
  evento.dataTransfer.setData('text/plain', 'papel-gps');
  evento.dataTransfer.effectAllowed = 'move';
});

itemPapel.addEventListener('dragend', () => {
  itemPapel.classList.remove('arrastando');
});

zonaLixeira.addEventListener('dragover', (evento) => {
  evento.preventDefault(); 
  zonaLixeira.classList.add('pode-soltar');
});

zonaLixeira.addEventListener('dragleave', () => {
  zonaLixeira.classList.remove('pode-soltar');
});

zonaLixeira.addEventListener('drop', (evento) => {
  evento.preventDefault();
  zonaLixeira.classList.remove('pode-soltar');
  zonaLixeira.classList.add('comendo');

  localStorage.removeItem(CHAVE_LOCALSTORAGE);

  itemPapel.classList.add('sumindo');
  exibirTelaVazia();
  mensagemErro.textContent = '';

  setTimeout(() => {
    zonaLixeira.classList.remove('comendo');
    itemPapel.classList.remove('sumindo');
  }, 500);
});

carregarUltimaLocalizacaoSalva();
