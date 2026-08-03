const CHAVE_LOCALSTORAGE = 'ultima_localizacao';


const btnCapturar = document.getElementById('btn-capturar');
const statusSatelite = document.getElementById('status-satelite');
const textoStatus = document.getElementById('texto-status');
const valorLat = document.getElementById('valor-lat');
const valorLon = document.getElementById('valor-lon');
const legendaInfo = document.getElementById('legenda-info');
const mensagemErro = document.getElementById('mensagem-erro');

const itemPapel = document.getElementById('item-papel');
const zonaLixeira = document.getElementById('zona-lixeira');

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
  valorLat.textContent = latitude.toFixed(5);
  valorLon.textContent = longitude.toFixed(5);

  const prefixo = comoUltimaSalva
    ? 'Sua última localização salva foi'
    : 'Localização capturada';

  legendaInfo.textContent = `${prefixo} em ${formatarDataHora(timestamp)}`;

  statusSatelite.classList.add('ativo');
  textoStatus.textContent = 'Localização encontrada';
}

function exibirTelaVazia() {
  valorLat.textContent = '—';
  valorLon.textContent = '—';
  legendaInfo.textContent = 'Nenhuma localização salva ainda.';
  statusSatelite.classList.remove('ativo');
  textoStatus.textContent = 'Sem localização';
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
  } catch (erro) {
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

  textoStatus.textContent = 'Buscando localização...';
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
      statusSatelite.classList.remove('ativo');
      textoStatus.textContent = 'Sem localização';

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
  evento.dataTransfer.setData('text/plain', 'papel-localizacao');
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
