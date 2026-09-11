const Treino = (() => {
  let ativo = false;
  let fila = [];
  let atual = null;
  let ouvindo = false;
  let extras = {};

  function msg(texto) {
    const el = document.getElementById("treino-msg");
    if (el) {
      el.textContent = texto;
      setTimeout(function () { if (el.textContent === texto) el.textContent = ""; }, 3000);
    }
  }

  function falar(texto) {
    return new Promise(function (resolve) {
      let done = false;
      const fim = function () { if (!done) { done = true; resolve(); } };
      try { Voz.falar(texto, null, fim); } catch (e) { fim(); }
      setTimeout(fim, 9000);
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

  function contarMemoria() {
    try { return (carregarConhecimento().faq || []).length; } catch (e) { return 0; }
  }

  function mostrarPergunta(texto, topico) {
    const el = document.getElementById("treino-pergunta");
    if (el) el.textContent = texto;
    const prog = document.getElementById("treino-progresso");
    if (prog) prog.textContent = ativo
      ? "Memória: " + contarMemoria() + " respostas" + (topico ? " · Tema: " + topico : "") + (fila.length ? " · faltam " + fila.length : "")
      : "";
  }

  function salvarFaq(pergunta, resposta) {
    const dados = carregarConhecimento();
    dados.faq = dados.faq || [];
    const chave = normalizarTexto(pergunta);
    const existente = dados.faq.find(function (f) { return normalizarTexto(f.pergunta) === chave; });
    if (existente) existente.resposta = resposta;
    else dados.faq.push({ pergunta: pergunta, resposta: resposta });
    salvarConhecimento(dados);
  }

  function salvarEvento(campo, resposta) {
    const dados = carregarConhecimento();
    dados.evento = dados.evento || {};
    if (campo === "estandes") {
      dados.evento.estandes = resposta.split(/[,;\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    } else {
      dados.evento[campo] = resposta;
    }
    salvarConhecimento(dados);
    salvarFaq("Feira: " + campo, resposta);
  }

  // Fila ordenada: escola → professores → evento → diversos → projetos (por último)
  function montarFila() {
    fila = [];
    extras = {};
    const dados = carregarConhecimento();
    const projetos = (dados.projetos || []).slice();

    const push = function (topico, texto, salvar) {
      fila.push({ tipo: "pergunta", topico: topico, texto: texto, salvar: salvar });
    };
    const checkpoint = function (topico, perguntaExtra, maxExtras) {
      fila.push({ tipo: "checkpoint", topico: topico, texto: "Mais alguma coisa sobre " + topico + "? Diga sim ou não.", perguntaExtra: perguntaExtra, maxExtras: maxExtras || 3 });
    };

    // 1. Escola
    push("escola", "Vamos começar pela escola. Qual é o nome da escola?", function (r) { salvarFaq("Qual é a escola?", r); });
    push("escola", "Onde fica a escola?", function (r) { salvarFaq("Onde fica a escola?", r); });
    push("escola", "Quais turmas participam da feira?", function (r) { salvarFaq("Quais turmas participam da feira?", r); });
    checkpoint("a escola", "O que mais sobre a escola eu devo saber?", 3);

    // 2. Professores
    push("professores", "Qual professor orienta projetos? Diga o nome e a matéria.", function (r) { salvarFaq("Professor orientador: " + r.slice(0, 60), r); });
    checkpoint("os professores", "Me fala outro professor: nome e matéria?", 8);

    // 3. Evento — Feira do Conhecimento (salva estruturado + FAQ)
    push("evento", "Qual é o nome oficial da feira?", function (r) { salvarEvento("nome", r); });
    push("evento", "Onde a feira acontece dentro da escola?", function (r) { salvarEvento("local", r); });
    push("evento", "Quais são os horários da feira?", function (r) { salvarEvento("horarios", r); });
    push("evento", "Como o visitante se localiza? Descreva o mapa.", function (r) { salvarEvento("mapa", r); });
    push("evento", "Onde ficam os banheiros?", function (r) { salvarEvento("banheiros", r); });
    push("evento", "Qual é a programação ou atração principal?", function (r) { salvarEvento("outras", r); });
    checkpoint("o evento", "O que mais sobre a feira eu devo saber?", 3);

    // 4. Assuntos diversos
    push("diversos", "Me conta algo importante que o visitante sempre pergunta?", function (r) { salvarFaq("Informação da feira: " + r.slice(0, 60), r); });
    checkpoint("assuntos diversos", "O que mais eu devo saber?", 3);

    // 5. Projetos POR ÚLTIMO (2 perguntas curtas por projeto)
    projetos.forEach(function (p) {
      push("projeto: " + p.nome, "Agora vamos falar do " + p.nome + ". O que ele faz?", function (r) {
        salvarFaq("O que faz o " + p.nome + "?", r + " [Projeto: " + p.nome + " — " + p.alunos + "]");
      });
      push("projeto: " + p.nome, "Qual é a parte mais legal do " + p.nome + "?", function (r) {
        salvarFaq("Parte mais legal do " + p.nome + "?", r + " [Projeto: " + p.nome + " — " + p.alunos + "]");
      });
    });
  }

  async function fazerPergunta() {
    if (!ativo) return;
    if (!fila.length) {
      const fim = "Treino concluído! Começamos pela escola e terminamos nos projetos. Obrigada!";
      mostrarPergunta(fim, "fim");
      log("Helê", fim);
      await falar(fim);
      parar(true);
      renderPendentes();
      return;
    }
    atual = fila[0];
    mostrarPergunta(atual.texto, atual.topico);
    log("Helê", atual.texto);
    await falar(atual.texto);
    if (!ativo) return;
    ouvirResposta();
  }

  function ouvirResposta() {
    if (!ativo || ouvindo) return;
    ouvindo = true;
    const prog = document.getElementById("treino-progresso");
    if (prog) prog.textContent = "Ouvindo... (ou digite abaixo e dê Enter)";
    Voz.ouvir(
      function (texto) {
        ouvindo = false;
        receberResposta(texto);
      },
      function (erro) {
        ouvindo = false;
        if (erro === "not-allowed" || erro === "service-not-allowed") {
          msg("Permita o microfone (use http://localhost) ou digite abaixo e dê Enter.");
          return;
        }
        if (ativo) setTimeout(function () { if (ativo) ouvirResposta(); }, 800);
      },
      function () {
        ouvindo = false;
        if (ativo) setTimeout(function () { if (ativo) ouvirResposta(); }, 800);
      }
    );
  }

  function ehSim(texto) {
    return /^(sim|s|quero|claro|bora|vamos|ok|aham|positivo|tem|tenho)\b/.test(normalizarTexto(texto));
  }

  function ehNao(texto) {
    return /^(nao|n|chega|para|parar|acabou|pronto|so isso|finalizar)\b/.test(normalizarTexto(texto));
  }

  function receberResposta(texto) {
    texto = (texto || "").trim();
    if (!texto || !ativo || !atual) return;
    try { Voz.pararDeOuvir(); } catch (e) { /* ignora */ }
    log("Você", texto);

    if (atual.tipo === "checkpoint") {
      if (ehSim(texto)) {
        const usados = extras[atual.topico] || 0;
        if (usados >= atual.maxExtras) {
          fila.shift();
          msg("Vamos seguir para o próximo tema.");
        } else {
          extras[atual.topico] = usados + 1;
          fila.shift();
          const extra = { tipo: "pergunta", topico: atual.topico, texto: atual.perguntaExtra, salvar: function (r) { salvarFaq("Sobre " + atual.topico + ": " + r.slice(0, 60), r); } };
          const volta = atual;
          fila.unshift(volta);
          fila.unshift(extra);
        }
      } else {
        fila.shift(); // "não" ou qualquer outra coisa: segue o fluxo
      }
      setTimeout(function () { if (ativo) fazerPergunta(); }, 500);
      return;
    }

    try {
      if (atual.salvar) atual.salvar(texto);
      msg("Guardado na memória!");
    } catch (e) { msg("Não consegui salvar, tente de novo."); return; }
    fila.shift();
    renderPendentes();
    setTimeout(function () { if (ativo) fazerPergunta(); }, 600);
  }

  function parar(silencioso) {
    ativo = false;
    ouvindo = false;
    try { Voz.pararFala(); Voz.pararDeOuvir(); } catch (e) { /* ignora */ }
    if (!silencioso) {
      const el = document.getElementById("treino-pergunta");
      if (el) el.textContent = "Treino pausado. Clique em Iniciar conversa para recomeçar do início.";
      mostrarPergunta(document.getElementById("treino-pergunta").textContent, "");
    }
  }

  function resetar() {
    if (!confirm("Apagar toda a memória treinada e recomeçar do padrão?")) return;
    salvarConhecimento(conhecimentoPadrao());
    salvarPendentes([]);
    renderPendentes();
    parar();
    document.getElementById("treino-conversa").innerHTML = "";
    msg("Memória resetada! Clique em Iniciar conversa.");
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
      montarFila();
      document.getElementById("treino-conversa").innerHTML = "";
      log("Helê", "Vamos treinar! Começamos pela escola e deixamos os projetos por último. Responda falando ou digitando.");
      fazerPergunta();
    });
    document.getElementById("btn-treino-parar").addEventListener("click", function () { parar(); });
    document.getElementById("btn-treino-reset").addEventListener("click", resetar);
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
