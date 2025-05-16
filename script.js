const storageKeys = {
  pessoas: 'controle-chaves-pessoas',
  chaves: 'controle-chaves-chaves',
  registros: 'controle-chaves-registros'
};

let pessoas = JSON.parse(localStorage.getItem(storageKeys.pessoas)) || [];
let chaves = JSON.parse(localStorage.getItem(storageKeys.chaves)) || [];
let registros = JSON.parse(localStorage.getItem(storageKeys.registros)) || [];

const selectPessoa = document.getElementById('pessoa');
const selectChave = document.getElementById('chave');
const listaRetiradas = document.getElementById('lista-retiradas');

const formRegistro = document.getElementById('form-registro');
const formPessoa = document.getElementById('form-pessoa');
const formChave = document.getElementById('form-chave');

const inputNovaPessoa = document.getElementById('nova-pessoa');
const inputNovaChave = document.getElementById('nova-chave');

function salvarDados() {
  localStorage.setItem(storageKeys.pessoas, JSON.stringify(pessoas));
  localStorage.setItem(storageKeys.chaves, JSON.stringify(chaves));
  localStorage.setItem(storageKeys.registros, JSON.stringify(registros));
}

function preencherSelects() {
  if (!selectPessoa || !selectChave) return; // Evita erro na página registros.html

  selectPessoa.innerHTML = '<option value="">Selecione a pessoa</option>';
  pessoas.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    selectPessoa.appendChild(opt);
  });

  selectChave.innerHTML = '<option value="">Selecione a chave</option>';
  const chavesDisponiveis = chaves.filter(c => !registros.some(r => r.chave === c && !r.devolvido));
  chavesDisponiveis.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    selectChave.appendChild(opt);
  });
}

function atualizarListaRetiradas() {
  if (!listaRetiradas) return; // Evita erro na página registros.html

  listaRetiradas.innerHTML = '';

  const abertos = registros.filter(r => !r.devolvido);

  if (abertos.length === 0) {
    listaRetiradas.innerHTML = '<li>Nenhuma chave retirada no momento.</li>';
    return;
  }

  abertos.forEach(r => {
    const li = document.createElement('li');
    li.textContent = `${r.chave} — ${r.pessoa} — Retirada: ${new Date(r.retirada).toLocaleString()}`;

    const btnDevolver = document.createElement('button');
    btnDevolver.textContent = 'Devolver';
    btnDevolver.title = 'Registrar devolução da chave';

    const i = registros.indexOf(r);

    btnDevolver.addEventListener('click', () => {
      registros[i].devolvido = new Date().toISOString();
      salvarDados();
      preencherSelects();
      atualizarListaRetiradas();
    });

    li.appendChild(btnDevolver);
    listaRetiradas.appendChild(li);
  });
}

function atualizarTabelaRegistros() {
  const tabela = document.getElementById('tabela-registros');
  if (!tabela) return;

  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = '';

  registros.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.pessoa}</td>
      <td>${r.chave}</td>
      <td>${new Date(r.retirada).toLocaleString()}</td>
      <td>${r.devolvido ? new Date(r.devolvido).toLocaleString() : '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportarXLSX() {
  if (registros.length === 0) {
    alert('Nenhum registro para exportar.');
    return;
  }

  const dadosParaExportar = registros.map(r => ({
    Pessoa: r.pessoa,
    Chave: r.chave,
    'Data/Hora Retirada': new Date(r.retirada).toLocaleString(),
    'Data/Hora Devolução': r.devolvido ? new Date(r.devolvido).toLocaleString() : ''
  }));

  const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Registros");

  XLSX.writeFile(wb, "registros_chaves.xlsx");
}

formRegistro?.addEventListener('submit', e => {
  e.preventDefault();

  const pessoa = selectPessoa.value;
  const chave = selectChave.value;

  if (!pessoa || !chave) {
    alert('Selecione pessoa e chave.');
    return;
  }

  const chaveAberta = registros.some(r => r.chave === chave && !r.devolvido);
  if (chaveAberta) {
    alert('Chave já está retirada.');
    preencherSelects();
    atualizarListaRetiradas();
    return;
  }

  registros.push({
    pessoa,
    chave,
    retirada: new Date().toISOString(),
    devolvido: null
  });

  salvarDados();
  preencherSelects();
  atualizarListaRetiradas();
  formRegistro.reset();
});

formPessoa?.addEventListener('submit', e => {
  e.preventDefault();
  const nome = inputNovaPessoa.value.trim();

  if (!nome) {
    alert('Digite o nome da pessoa.');
    return;
  }

  if (pessoas.includes(nome)) {
    alert('Pessoa já cadastrada.');
    return;
  }

  pessoas.push(nome);
  salvarDados();
  preencherSelects();
  inputNovaPessoa.value = '';
});

formChave?.addEventListener('submit', e => {
  e.preventDefault();
  const chave = inputNovaChave.value.trim();

  if (!chave) {
    alert('Digite a identificação da chave.');
    return;
  }

  if (chaves.includes(chave)) {
    alert('Chave já cadastrada.');
    return;
  }

  chaves.push(chave);
  salvarDados();
  preencherSelects();
  inputNovaChave.value = '';
});

function init() {
  preencherSelects();
  atualizarListaRetiradas();
  atualizarTabelaRegistros();
}

// Função para inicializar a página de registros (registros.html)
function initRegistros() {
  registros = JSON.parse(localStorage.getItem(storageKeys.registros)) || [];
  atualizarTabelaRegistros();
}

window.onload = () => {
  // Se existir formulário de registro, é index.html
  if (formRegistro) {
    init();
  }
  // Se existir tabela registros, é registros.html
  else if (document.getElementById('tabela-registros')) {
    initRegistros();
  }
};

// Disponibiliza exportarXLSX globalmente para onclick no botão exportar
window.exportarXLSX = exportarXLSX;
