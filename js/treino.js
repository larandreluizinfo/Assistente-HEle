const Treino = (() => {
  let ativo = false;
  let passo = 0;
  let projetoAtual = null;
  let alunoAtual = "";
  let ouvindo = false;

  // Conversa básica e curta. Se a resposta citar um projeto, vincula na memória.
  const PASSOS = [
    { id: "nome", pergunta: "Oi! Eu sou a Helê. Qual é o seu nome?", memoria: null },
    { id: "turma", pergunta: "De qual turma você é?", memoria: null },
    { id: "projeto", pergunta: "Qual projeto você apresenta?", memoria: null },
    { id: "o_que_faz", pergunta: "O que o projeto faz?", memoria: true },
    { id: "como_funciona", pergunta: "Como ele funciona?", memoria: true },
    { id: "parte_legal", pergunta: "Qual é a parte mais legal?", memoria: true },
    { id: "estande", pergunta: "Onde fica o estande de vocês?", memoria: true },
    { id: "outro", pergunta: "Quer falar de outro projeto? Diga o nome ou diga não.", memoria: null }
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
      try { Voz.falar(texto, null, resolve); }
      catch (e) { resolve(); }
      setTimeout(resolve, 8000); // trava de segurança
    });
  }

  function log(falante, texto) {
    const box = document.getElementById("treino-conversa");
    if (!box) return;
    const p = document.createElement("p");
    p.className = falante === "Helê" ? "turno-hele" : "turno-voce";
    p.textContent = (falante === "Helê" ? "Helê: " : "Você: ") + texto;
    box.appendChild(p);
    box.scrollTop = box.scrollHeight;
  }

  function mostrarPergunta(texto) {
    const el = document.getElementById("treino-pergunta");
    if (el) el.textContent = texto;
    const prog = document.getElementById("treino-progresso");
    if (prog) prog.textContent = ativo ? "Memória: " + contarMemoria() + " respostas · " + (projetoAtual ? "Projeto: " + projetoAtual.nome : "conversa inicial") : "";
  }

  function contarMemoria() {
    try { return (carregarConhecimento().faq || []).length; } catch (e) { return 0; }
  }

  function salvarMemoria(perguntaFeita, resposta, passoId) {
    const dados = carregarConhecimento();
    dados.faq = dados.faq || [];
    let perguntaFaq = perguntaFeita;
    if (projetoAtual && passoId !== "projeto" && passoId !== "outro") {
      perguntaFaq = perguntaFeita + " (" + projetoAtual.nome + ")";
      resposta = resposta + " [Projeto: " + projetoAtual.nome + " — " + projetoAtual.alunos + "]";
    }
    if (passoId === "nome") { alunoAtual = resposta; return; }
    const chave = normalizarTexto(perguntaFaq);
    const existente = dados.faq.find(function (f) { return normalizarTexto(f.pergunta) === chave; });
    if (existente) existente.resposta = resposta;
    else dados.faq.push({ pergunta: perguntaFaq, resposta: resposta });
    salvarConhecimento(dados);
  }

  function detectarProjeto(texto) {
    try {
      const dados = carregarConhecimento();
      return buscarProjeto(dados, texto);
    } catch (e) { return null; }
  }

  async function fazerPergunta() {
    if (!ativo) return;
    if (passo >= PASSOS.length) passo = 2; // após "outro=não", recomeça do projeto
    const item = PASSOS[passo];
    let texto = item.pergunta;
    if (projetoAtual && (item.id === "o_que_faz" || item.id === "como_funciona" || item.id === "parte_legal")) {
      texto = texto.replace("O que o projeto faz?", "O que o " + projetoAtual.nome + " faz?")
        .replace("Como ele funciona?", "Como o " + projetoAtual.nome + " funciona?")
        .replace("Qual é a parte mais legal?", "Qual é a parte mais legal do " + projetoAtual.nome + "?");
    }
    mostrarPergunta(texto);
    log("Helê", texto);
    await falar(texto);
    if (!ativo) return;
    ouvirResposta();
  }

  function ouvirResposta() {
    if (!ativo || ouvindo) return;
    ouvindo = true;
    mostrarOuvindo(true);
    Voz.ouvir(
      function (texto) {
        ouvindo = false;
        mostrarOuvindo(false);
        receberResposta(texto);
      },
      function (erro) {
        ouvindo = false;
        mostrarOuvindo(false);
        if (erro === "not-allowed" || erro === "service-not-allowed") {
          msg("Permita o microfone (use http://localhost) ou digite abaixo e dê Enter.");
          return;
        }
        // Silêncio: pergunta de novo sem travar
        if (ativo) setTimeout(function () { if (ativo) ouvirResposta(); }, 800);
      },
      function () {
        ouvindo = false;
        mostrarOuvindo(false);
        if (ativo) setTimeout(function () { if (ativo) ouvirResposta(); }, 800);
      }
    );
  }

  function mostrarOuvindo(on) {
    const prog = document.getElementById("treino-progresso");
    if (on && prog) prog.textContent = "Ouvindo... (ou digite abaixo e dê Enter)";
    else mostrarPergunta(document.getElementById("treino-pergunta").textContent);
  }

  async function receberResposta(texto) {
    texto = (texto || "").trim();
    if (!texto || !ativo) return;
    Voz.pararDeOuvir();
    log("Você", texto);
    const item = PASSOS[passo];
    const norm = normalizarTexto(texto);

    if (item.id === "projeto") {
      const p = detectarProjeto(texto);
      if (p) {
        projetoAtual = p;
        salvarMemoria("Quem apresenta " + p.nome + "?", (alunoAtual ? alunoAtual + " apresenta " : "") + p.nome + ". " + texto, "apresenta");
        passo = 3;
      } else {
        // Não achou projeto: salva mesmo assim e segue
        salvarMemoria(item.pergunta, texto, item.id);
        projetoAtual = null;
        passo = 3;
      }
    } else if (item.id === "outro") {
      const querOutro = /^(sim|s|quero|claro|bora|vamos|ok)\b/.test(norm) || detectarProjeto(texto);
      const disseNao = /^(nao|não|n|chega|para|parar)\b/.test(norm);
      if (querOutro) {
        const p = detectarProjeto(texto);
        if (p) projetoAtual = p;
        passo = 3;
        if (p) { mostrarPergunta("Legal! Vamos falar do " + p.nome + "."); }
      } else if (disseNao) {
        await falar("Obrigada! Já guardei tudo na memória.");
        log("Helê", "Obrigada! Já guardei tudo na memória.");
        parar();
        renderPendentes();
        return;
      } else {
        salvarMemoria(item.pergunta, texto, item.id);
        passo = 2;
      }
    } else {
      salvarMemoria(document.getElementById("treino-pergunta").textContent, texto, item.id);
      passo++;
    }
    mostrarPergunta(document.getElementById("treino-pergunta").textContent);
    renderPendentes();
    setTimeout(function () { if (ativo) fazerPergunta(); }, 600);
  }

  function parar() {
    ativo = false;
    ouvindo = false;
    try { Voz.pararFala(); Voz.pararDeOuvir(); } catch (e) { /* ignora */ }
    const el = document.getElementById("treino-pergunta");
    if (el) el.textContent = "Treino pausado. Clique em Iniciar conversa para continuar treinando a memória.";
    mostrarPergunta(el.textContent);
  }

  function renderPendentes() {
    const lista = document.getElementById("lista-pendentes");
    const count = document.getElementById("pendentes-count");
    if (!lista) return;
    let pendentes = [];
    try { pendentes = carregarPendentes(); } catch (e) { pendentes = []; }
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
        msg("Ensinado!");
        renderPendentes();
      });
      const btnX = document.createElement("button");
      btnX.type = "button";
      btnX.className = "btn btn-secundario";
      btnX.textContent = "Descartar";
      btnX.addEventListener("click", function () { removerPendente(i); renderPendentes(); });
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
      if (ativo) return;
      ativo = true;
      passo = 0;
      projetoAtual = null;
      document.getElementById("treino-conversa").innerHTML = "";
      log("Helê", "Vamos treinar minha memória! Responda falando ou digitando.");
      fazerPergunta();
    });
    document.getElementById("btn-treino-parar").addEventListener("click", parar);
    const form = document.getElementById("form-treino-texto");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      const campo = document.getElementById("treino-resposta");
      const v = campo ? campo.value.trim() : "";
      if (!v) return;
      campo.value = "";
      if (!ativo) { msg("Clique em Iniciar conversa primeiro."); return; }
      try { Voz.pararDeOuvir(); } catch (err) { /* ignora */ }
      ouvindo = false;
      receberResposta(v);
    });
    renderPendentes();
    window.addEventListener("storage", function (e) { if (e.key === CHAVE_PENDENTES) renderPendentes(); });
  }

  return { iniciar: iniciar };
})();

document.addEventListener("DOMContentLoaded", Treino.iniciar);
