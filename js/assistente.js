const Assistente = (() => {
  let conhecimento = null;
  let ocupado = false;
  let temporizadorInatividade = null;
  let ultimoCumprimento = 0;
  let tentativasVazias = 0;

  function setStatus(texto) {
    const elemento = document.getElementById("status");
    if (elemento) elemento.textContent = texto;
  }

  function setFala(texto) {
    const elemento = document.getElementById("fala");
    if (elemento) elemento.textContent = texto;
  }

  function reiniciarInatividade() {
    if (temporizadorInatividade) clearTimeout(temporizadorInatividade);
    temporizadorInatividade = setTimeout(voltarAoIdle, CONFIG.TEMPO_INATIVIDADE_MS);
  }

  function voltarAoIdle() {
    ocupado = false;
    Voz.pararFala();
    Voz.pararDeOuvir();
    Avatar.pararFala();
    Avatar.definirEstado("idle");
    setStatus("Aguardando visita");
    setFala("");
  }

  function falarAsync(texto) {
    return new Promise(function (resolve) {
      Avatar.iniciarFala();
      Avatar.definirEstado("falando");
      Voz.falar(texto, null, function () {
        Avatar.pararFala();
        resolve();
      });
    });
  }

  async function chamarGemini(pergunta) {
    if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY.startsWith("COLE")) {
      return "Ainda n\xe3o configuraram minha chave de intelig\xe2ncia. Pe\xe7a ajuda aos alunos do estande!";
    }
    const contexto = montarContexto(conhecimento);
    const url = CONFIG.GEMINI_URL + "/" + CONFIG.GEMINI_MODELO + ":generateContent?key=" + encodeURIComponent(CONFIG.GEMINI_API_KEY);
    const corpo = {
      systemInstruction: {
        parts: [{
          text: "Você é " + CONFIG.NOME + ", uma assistente virtual simpática de uma feira de ciências. " +
            "Responda em português brasileiro com no máximo " + CONFIG.MAX_FRASES + " frases curtas, " +
            "usando apenas as informações abaixo. Se não souber, diga que vai pedir ajuda aos alunos.\n\n" + contexto
        }]
      },
      contents: [{ role: "user", parts: [{ text: pergunta }] }]
    };
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo)
    });
    if (!resposta.ok) throw new Error("Erro da API: " + resposta.status);
    const dados = await resposta.json();
    const partes = dados.candidates && dados.candidates[0] && dados.candidates[0].content &&
      dados.candidates[0].content.parts;
    if (!partes || !partes.length) throw new Error("Resposta vazia");
    return partes.map(function (parte) { return parte.text; }).join("").trim();
  }

  function ouvirDireto() {
    Avatar.pararFala();
    Avatar.definirEstado("ouvindo");
    setStatus("Ouvindo...");
    Voz.ouvir(
      async function (texto) {
        tentativasVazias = 0;
        if (texto) await responder(texto);
        else if (ocupado) ouvirDireto();
      },
      async function (erro) {
        // Erros fatais: para o loop e pede ação do usuário (evita spam de permissão)
        if (erro === "not-allowed" || erro === "service-not-allowed" || erro === "reconhecimento_nao_suportado") {
          ocupado = false;
          Avatar.definirEstado("idle");
          setStatus("Clique em Falar e permita o microfone (use http://localhost).");
          return;
        }
        if (erro === "audio-capture") {
          ocupado = false;
          Avatar.definirEstado("idle");
          setStatus("Nenhum microfone encontrado.");
          return;
        }
        if (erro === "aborted" || erro === "start-falhou") {
          if (ocupado) ouvirDireto();
          return;
        }
        // "no-speech" / "network" / outros: retry silencioso 2x antes de falar
        tentativasVazias++;
        if (tentativasVazias < 3) {
          setStatus("Ouvindo...");
          if (ocupado) ouvirDireto();
          return;
        }
        tentativasVazias = 0;
        const aviso = "Desculpe, não entendi. Pode repetir?";
        setStatus(aviso);
        await falarAsync(aviso);
        if (ocupado) ouvirDireto();
      },
      function () {
        // onend sem resultado (silêncio): retry silencioso, sem TTS
        if (ocupado) ouvirDireto();
      }
    );
  }

  async function responder(texto) {
    ocupado = true;
    reiniciarInatividade();
    Avatar.definirEstado("pensando");
    setStatus("Pensando...");
    try {
      const projeto = buscarProjeto(conhecimento, texto);
      if (projeto) {
        const resposta = projeto.nome + " — " + projeto.alunos + " (" + projeto.area + "). " + projeto.objetivo + " " + projeto.descricao;
        setStatus("Falando");
        setFala("HEle: " + resposta);
        await falarAsync(resposta);
      } else {
        const resposta = await chamarGemini(texto);
        setStatus("Falando");
        setFala("HEle: " + resposta);
        await falarAsync(resposta);
      }
    } catch (erro) {
      const mensagem = "Desculpe, tive um problema para pensar. Pode perguntar de novo?";
      setStatus("Erro");
      setFala(mensagem);
      await falarAsync(mensagem);
    }
    if (ocupado) {
      ouvirDireto();
    } else {
      Avatar.definirEstado("idle");
      setStatus("Aguardando visita");
    }
  }

  async function cumprimentar() {
    if (Date.now() - ultimoCumprimento < 8000) return;
    ultimoCumprimento = Date.now();
    ocupado = true;
    reiniciarInatividade();
    const saudacao = "Olá! Eu sou a " + CONFIG.NOME + ", a assistente desta feira de conhecimento. Conheço " + (conhecimento.projetos ? conhecimento.projetos.length : 0) + " projetos. Pode me perguntar sobre qualquer um deles!";
    setStatus("Falando");
    setFala(saudacao);
    await falarAsync(saudacao);
    if (!ocupado) return;
    ouvirDireto();
  }

  function visitanteDetectado() {
    reiniciarInatividade();
    if (ocupado) return;
    cumprimentar();
  }

  function pedirParaFalar() {
    reiniciarInatividade();
    tentativasVazias = 0;
    if (ocupado) {
      Voz.pararFala();
      Voz.pararDeOuvir();
      ocupado = true;
      ouvirDireto();
    } else {
      cumprimentar();
    }
  }

  function iniciar() {
    if (typeof CONFIG === "undefined") {
      setStatus("Falta o arquivo js/config.js — copie de js/config.example.js");
      setFala("Erro de configuração: js/config.js não encontrado.");
      return;
    }
    conhecimento = carregarConhecimento();
    const container = document.getElementById("avatar");
    if (container) Avatar.montar(container);
    Arduino.ativar();
    window.addEventListener("hele:visitante", visitanteDetectado);
    const botao = document.getElementById("btn-falar");
    if (botao) botao.addEventListener("click", pedirParaFalar);
    const suporteVoz = "speechSynthesis" in window;
    setStatus(suporteVoz ? "Aguardando visita" : "Navegador sem suporte a voz");
    setTimeout(cumprimentar, 800);
  }

  return { iniciar: iniciar };
})();

document.addEventListener("DOMContentLoaded", Assistente.iniciar);
