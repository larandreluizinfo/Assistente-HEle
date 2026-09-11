const Treino = (() => {
  let fila = [];
  let atual = null;
  let ativo = false;
  let modoVoz = false;

  const ROTEIRO = [
    { chave: "definicao", texto: function (p) { return "O que é o projeto " + p.nome + "? Me conta com suas palavras."; } },
    { chave: "curiosidade", texto: function (p) { return "Qual é a parte mais legal do " + p.nome + " que o visitante não pode perder?"; } },
    { chave: "alunos", texto: function (p) { return "Quem fez o " + p.nome + " e de qual turma vocês são?"; } }
  ];

  function msg(texto) {
    const el = document.getElementById("treino-msg");
    if (el) {
      el.textContent = texto;
      setTimeout(function () { if (el.textContent === texto) el.textContent = ""; }, 3000);
    }
  }

  function falar(texto) {
    return new Promise(function (resolve) {
      Voz.falar(texto, null, resolve);
    });
  }

  function montarFila() {
    const dados = carregarConhecimento();
    const projetos = (dados.projetos || []).slice();
    fila = [];
    projetos.forEach(function (p) {
      ROTEIRO.forEach(function (r) {
        fila.push({ projeto: p, passo: r });
      });
    });
    // Embaralha para não ficar repetitivo
    for (let i = fila.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const aux = fila[i]; fila[i] = fila[j]; fila[j] = aux;
    }
  }

  function progresso() {
    const el = document.getElementById("treino-progresso");
    if (el) el.textContent = ativo && atual
      ? "Projeto: " + atual.projeto.nome + " (" + atual.projeto.alunos + ")"
      : "";
  }

  async function proxima() {
    const campo = document.getElementById("treino-resposta");
    if (campo) campo.value = "";
    if (!fila.length) {
      const el = document.getElementById("treino-pergunta");
      if (el) el.textContent = "Entrevista concluída! A Helê aprendeu muito. Inicie de novo para reforçar.";
      ativo = false;
      atual = null;
      progresso();
      return;
    }
    atual = fila.shift();
    const pergunta = atual.passo.texto(atual.projeto);
    const el = document.getElementById("treino-pergunta");
    if (el) el.textContent = pergunta;
    progresso();
    try { await falar(pergunta); } catch (e) { /* sem voz */ }
  }

  function salvarAtual() {
    const campo = document.getElementById("treino-resposta");
    const resposta = campo ? campo.value.trim() : "";
    if (!atual) { msg("Inicie a entrevista primeiro."); return; }
    if (!resposta) { msg("Escreva ou dite a resposta antes de salvar."); return; }
    const dados = carregarConhecimento();
    dados.faq = dados.faq || [];
    const perguntaFaq = "Sobre " + atual.projeto.nome + ": " + atual.passo.chave;
    const existente = dados.faq.find(function (f) { return f.pergunta === perguntaFaq; });
    if (existente) existente.resposta = resposta;
    else dados.faq.push({ pergunta: perguntaFaq, resposta: resposta + " (Projeto: " + atual.projeto.nome + " — " + atual.projeto.alunos + ")" });
    salvarConhecimento(dados);
    msg("Salvo na memória!");
    proxima();
  }

  function ouvirResposta() {
    const campo = document.getElementById("treino-resposta");
    setStatusTreino("Ouvindo sua resposta...");
    Voz.ouvir(
      function (texto) {
        if (campo) campo.value = (campo.value ? campo.value + " " : "") + texto;
        setStatusTreino("");
        msg("Transcrito! Revise e salve.");
      },
      function (erro) {
        setStatusTreino("");
        msg(erro === "not-allowed" ? "Permita o microfone (use http://localhost)." : "Não entendi, tente de novo.");
      },
      function () { setStatusTreino(""); }
    );
  }

  function setStatusTreino(texto) {
    const el = document.getElementById("treino-progresso");
    if (el && texto) el.textContent = texto;
    else progresso();
  }

  function renderPendentes() {
    const lista = document.getElementById("lista-pendentes");
    const count = document.getElementById("pendentes-count");
    if (!lista) return;
    const pendentes = carregarPendentes();
    if (count) count.textContent = String(pendentes.length);
    lista.innerHTML = "";
    if (!pendentes.length) {
      lista.innerHTML = '<p class="treino-vazio">Nenhuma pergunta pendente. Quando a Helê não souber algo no atendimento, aparece aqui.</p>';
      return;
    }
    pendentes.forEach(function (item, i) {
      const div = document.createElement("div");
      div.className = "pendente-card";
      const titulo = document.createElement("p");
      titulo.className = "pendente-pergunta";
      titulo.textContent = item.pergunta + (item.vezes > 1 ? " (" + item.vezes + "x)" : "");
      const area = document.createElement("textarea");
      area.placeholder = "Resposta que a Helê deve aprender...";
      const linha = document.createElement("div");
      linha.className = "acoes";
      const btnSalvar = document.createElement("button");
      btnSalvar.type = "button";
      btnSalvar.className = "btn";
      btnSalvar.textContent = "Ensinar";
      btnSalvar.addEventListener("click", function () {
        if (!area.value.trim()) { msg("Escreva a resposta antes."); return; }
        responderPendente(i, area.value.trim());
        msg("Ensinado! Pergunta removida da lista.");
        renderPendentes();
      });
      const btnX = document.createElement("button");
      btnX.type = "button";
      btnX.className = "btn btn-secundario";
      btnX.textContent = "Descartar";
      btnX.addEventListener("click", function () {
        removerPendente(i);
        renderPendentes();
      });
      linha.appendChild(btnSalvar);
      linha.appendChild(btnX);
      div.appendChild(titulo);
      div.appendChild(area);
      div.appendChild(linha);
      lista.appendChild(div);
    });
  }

  function iniciar() {
    document.getElementById("btn-treino-iniciar").addEventListener("click", function () {
      montarFila();
      ativo = true;
      proxima();
    });
    document.getElementById("btn-treino-salvar").addEventListener("click", salvarAtual);
    document.getElementById("btn-treino-pular").addEventListener("click", function () {
      if (!ativo) return;
      proxima();
    });
    document.getElementById("btn-treino-parar").addEventListener("click", function () {
      ativo = false;
      atual = null;
      Voz.pararFala();
      Voz.pararDeOuvir();
      document.getElementById("treino-pergunta").textContent = "Entrevista pausada.";
      progresso();
    });
    document.getElementById("btn-treino-voz").addEventListener("click", function () {
      if (!ativo || !atual) { msg("Inicie a entrevista primeiro."); return; }
      ouvirResposta();
    });
    renderPendentes();
    window.addEventListener("storage", function (e) {
      if (e.key === CHAVE_PENDENTES) renderPendentes();
    });
  }

  return { iniciar: iniciar };
})();

document.addEventListener("DOMContentLoaded", Treino.iniciar);
