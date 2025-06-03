const storageKeys = {
  setores: 'controle-chaves-setores',
  cargos: 'controle-chaves-cargos',
  pessoas: 'controle-chaves-pessoas',
  chaves: 'controle-chaves-chaves',
  registros: 'controle-chaves-registros'
};

// Arrays para armazenar dados
let setores = JSON.parse(localStorage.getItem(storageKeys.setores)) || [];
let cargos = JSON.parse(localStorage.getItem(storageKeys.cargos)) || [];
let pessoas = JSON.parse(localStorage.getItem(storageKeys.pessoas)) || [];
let chaves = JSON.parse(localStorage.getItem(storageKeys.chaves)) || [];
let registros = JSON.parse(localStorage.getItem(storageKeys.registros)) || [];

// ELEMENTOS DOM index.html
const selectPessoa = document.getElementById('pessoa');
const selectChave = document.getElementById('chave');
const listaRetiradas = document.getElementById('lista-retiradas');
const formRegistro = document.getElementById('form-registro');

// ELEMENTOS DOM cadastro.html
const selectSetorCargo = document.getElementById('cargo-setor');
const selectSetorPessoa = document.getElementById('pessoa-setor');
const selectCargoPessoa = document.getElementById('pessoa-cargo');
const selectSetoresChave = document.getElementById('chave-setores');

const formSetor = document.getElementById('form-setor');
const formCargo = document.getElementById('form-cargo');
const formPessoa = document.getElementById('form-pessoa');
const formChave = document.getElementById('form-chave');

const inputNovoSetor = document.getElementById('novo-setor');
const inputNovoCargo = document.getElementById('novo-cargo');
const inputNovaPessoa = document.getElementById('nova-pessoa');
const inputNovaChave = document.getElementById('nova-chave');

// Função para salvar tudo no localStorage
function salvarDados() {
  localStorage.setItem(storageKeys.setores, JSON.stringify(setores));
  localStorage.setItem(storageKeys.cargos, JSON.stringify(cargos));
  localStorage.setItem(storageKeys.pessoas, JSON.stringify(pessoas));
  localStorage.setItem(storageKeys.chaves, JSON.stringify(chaves));
  localStorage.setItem(storageKeys.registros, JSON.stringify(registros));
}

// --- Funções de preenchimento dos selects ---

// Preencher select de pessoas no index
function preencherSelectPessoa() {
  if (!selectPessoa) return;

  selectPessoa.innerHTML = '<option value="">Selecione a pessoa</option>';

  // Só mostrar pessoas com cargo válido
  pessoas.forEach(p => {
    const cargo = cargos.find(c => c.nome === p.cargo);
    if (cargo) {
      const option = document.createElement('option');
      option.value = p.nome;
      option.textContent = `${p.nome} (${p.cargo})`;
      selectPessoa.appendChild(option);
    }
  });
}

// Preencher select de chaves disponíveis no index
function preencherSelectChave() {
  if (!selectChave) return;

  selectChave.innerHTML = '<option value="">Selecione a chave</option>';

  // Filtrar chaves que não estão retiradas
  const chavesDisponiveis = chaves.filter(chaveObj =>
    !registros.some(r => r.chave === chaveObj.numero && !r.devolvido)
  );

  chavesDisponiveis.forEach(c => {
    const option = document.createElement('option');
    option.value = c.numero;
    option.textContent = `${c.numero} (${c.local})`;
    selectChave.appendChild(option);
  });
}

// Preencher lista de retiradas abertas no index
function atualizarListaRetiradas() {
  if (!listaRetiradas) return;

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
      preencherSelectChave();
      atualizarListaRetiradas();
    });

    li.appendChild(btnDevolver);
    listaRetiradas.appendChild(li);
  });
}

// --- Funções para cadastro e selects da página cadastro.html ---

// Preencher select de setores (uso geral)
function preencherSelectSetores() {
  if (selectSetorCargo) {
    selectSetorCargo.innerHTML = '<option value="">Selecione o setor</option>';
    setores.forEach(setor => {
      const opt = document.createElement('option');
      opt.value = setor;
      opt.textContent = setor;
      selectSetorCargo.appendChild(opt);
    });
  }

  if (selectSetorPessoa) {
    selectSetorPessoa.innerHTML = '<option value="">Selecione o setor</option>';
    setores.forEach(setor => {
      const opt = document.createElement('option');
      opt.value = setor;
      opt.textContent = setor;
      selectSetorPessoa.appendChild(opt);
    });
  }
}

// Preencher select de cargos (uso geral)
function preencherSelectCargos() {
  if (selectCargoPessoa) {
    selectCargoPessoa.innerHTML = '<option value="">Selecione o cargo</option>';
    cargos.forEach(cargo => {
      const opt = document.createElement('option');
      opt.value = cargo.nome;
      opt.textContent = cargo.nome;
      selectCargoPessoa.appendChild(opt);
    });
  }
}

// Preencher select múltiplo de setores autorizados na chave
function preencherSelectSetoresChave() {
  if (!selectSetoresChave) return;

  selectSetoresChave.innerHTML = '';

  setores.forEach(setor => {
    const opt = document.createElement('option');
    opt.value = setor;
    opt.textContent = setor;
    selectSetoresChave.appendChild(opt);
  });
}

// Preencher select de pessoas no cadastro para mostrar (se precisar)
function preencherSelectPessoas() {
  // Se quiser, implementar para outras ações
}

// --- Eventos cadastro ---

// Cadastrar setor
formSetor?.addEventListener('submit', e => {
  e.preventDefault();
  const nomeSetor = inputNovoSetor.value.trim();
  if (!nomeSetor) {
    alert('Digite o nome do setor.');
    return;
  }
  if (setores.includes(nomeSetor)) {
    alert('Setor já cadastrado.');
    return;
  }
  setores.push(nomeSetor);
  salvarDados();
  preencherSelectSetores();
  inputNovoSetor.value = '';
});

// Cadastrar cargo com autorização de setores
formCargo?.addEventListener('submit', e => {
  e.preventDefault();
  const nomeCargo = inputNovoCargo.value.trim();
  const setorSelecionado = selectSetorCargo.value;

  if (!nomeCargo) {
    alert('Digite o nome do cargo.');
    return;
  }
  if (!setorSelecionado) {
    alert('Selecione o setor autorizado para este cargo.');
    return;
  }

  if (cargos.some(c => c.nome === nomeCargo)) {
    alert('Cargo já cadastrado.');
    return;
  }

  cargos.push({ nome: nomeCargo, setoresAutorizados: [setorSelecionado] });
  salvarDados();
  preencherSelectCargos();
  inputNovoCargo.value = '';
  selectSetorCargo.value = '';
});

// Cadastrar pessoa com cargo
formPessoa?.addEventListener('submit', e => {
  e.preventDefault();
  const nomePessoa = inputNovaPessoa.value.trim();
  const cargoPessoa = selectCargoPessoa.value;

  if (!nomePessoa) {
    alert('Digite o nome da pessoa.');
    return;
  }
  if (!cargoPessoa) {
    alert('Selecione o cargo da pessoa.');
    return;
  }

  if (pessoas.some(p => p.nome === nomePessoa)) {
    alert('Pessoa já cadastrada.');
    return;
  }

  pessoas.push({ nome: nomePessoa, cargo: cargoPessoa });
  salvarDados();
  inputNovaPessoa.value = '';
  selectCargoPessoa.value = '';
});

// Cadastrar chave com setores autorizados (múltiplos)
formChave?.addEventListener('submit', e => {
  e.preventDefault();
  const numeroChave = inputNovaChave.value.trim();
  const setoresSelecionados = Array.from(selectSetoresChave.selectedOptions).map(opt => opt.value);

  if (!numeroChave) {
    alert('Digite a identificação da chave.');
    return;
  }
  if (setoresSelecionados.length === 0) {
    alert('Selecione ao menos um setor autorizado para esta chave.');
    return;
  }
  if (chaves.some(c => c.numero === numeroChave)) {
    alert('Chave já cadastrada.');
    return;
  }

  chaves.push({ numero: numeroChave, local: '-', setoresAutorizados: setoresSelecionados });
  salvarDados();
  inputNovaChave.value = '';
  // Se tiver algum lugar para atualizar lista de chaves, atualizar aqui
});

// --- Validação na hora da retirada ---

formRegistro?.addEventListener('submit', e => {
  e.preventDefault();

  const pessoaNome = selectPessoa.value;
  const chaveNumero = selectChave.value;

  if (!pessoaNome || !chaveNumero) {
    alert('Selecione pessoa e chave.');
    return;
  }

  // Busca objetos completos
  const pessoaObj = pessoas.find(p => p.nome === pessoaNome);
  const chaveObj = chaves.find(c => c.numero === chaveNumero);
  if (!pessoaObj || !chaveObj) {
    alert('Pessoa ou chave inválida.');
    return;
  }

  // Verifica se a chave já está retirada
  if (registros.some(r => r.chave === chaveNumero && !r.devolvido)) {
    alert('Chave já está retirada.');
    return;
  }

  // Busca cargo da pessoa
  const cargoPessoa = cargos.find(c => c.nome === pessoaObj.cargo);
  if (!cargoPessoa) {
    alert('Cargo da pessoa não encontrado.');
    return;
  }

  // Verifica autorização: se algum setor da chave está autorizado para o cargo da pessoa
  const autorizada = chaveObj.setoresAutorizados.some(setorChave =>
    cargoPessoa.setoresAutorizados.includes(setorChave)
  );

  if (!autorizada) {
    alert('Pessoa não tem autorização para retirar essa chave.');
    return;
  }

  // Adiciona registro
  registros.push({
    pessoa: pessoaNome,
    chave: chaveNumero,
    retirada: new Date().toISOString(),
    devolvido: null
  });

  salvarDados();
  preencherSelectChave();
  atualizarListaRetiradas();

  formRegistro.reset();
});

// --- Inicialização ---

function initIndex() {
  preencherSelectPessoa();
  preencherSelectChave();
  atualizarListaRetiradas();
}

function initCadastro() {
  preencherSelectSetores();
  preencherSelectCargos();
  preencherSelectSetoresChave();
}

window.onload = () => {
  if (formRegistro) {
    initIndex();
  } else if (formSetor || formCargo || formPessoa || formChave) {
    initCadastro();
  }
};
