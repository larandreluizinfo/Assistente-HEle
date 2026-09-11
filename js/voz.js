const Voz = (() => {
  let reconhecedor = null;
  let vozesPtBr = [];

  function obterVoz() {
    const vozes = "speechSynthesis" in window ? speechSynthesis.getVoices() : [];
    vozesPtBr = vozes.filter(function (voz) {
      return voz.lang && voz.lang.toLowerCase().startsWith("pt");
    });
    return (
      vozesPtBr.find(function (voz) { return voz.name.toLowerCase().includes("google"); }) ||
      vozesPtBr[0] ||
      null
    );
  }

  function prepararReconhecimento() {
    const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Reconhecimento) return null;
    const rec = new Reconhecimento();
    rec.lang = CONFIG.LOCALE_PT;
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    return rec;
  }

  function ouvir(aoResultado, aoErro, aoFim, dicas) {
    const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Reconhecimento) {
      if (aoErro) aoErro("reconhecimento_nao_suportado");
      return;
    }
    if (reconhecedor) {
      try {
        reconhecedor.onresult = null;
        reconhecedor.onerror = null;
        reconhecedor.onend = null;
        reconhecedor.abort();
      } catch (e) { /* ignorar */ }
    }
    reconhecedor = new Reconhecimento();
    reconhecedor.lang = CONFIG.LOCALE_PT;
    reconhecedor.interimResults = false;
    reconhecedor.continuous = false;
    reconhecedor.maxAlternatives = 3;
    // Gramática com nomes dos projetos: aumenta a precisão no Chrome
    try {
      const ListaGramatica = window.SpeechGrammarList || window.webkitSpeechGrammarList;
      if (ListaGramatica && dicas && dicas.length) {
        const lista = new ListaGramatica();
        const frases = dicas.map(function (d) { return d.toLowerCase(); }).join(" | ");
        lista.addFromString("#JSGF V1.0; grammar projetos; public <projeto> = " + frases + " ;", 1);
        reconhecedor.grammars = lista;
      }
    } catch (e) { /* gramática opcional */ }
    let finalizado = false;
    reconhecedor.onresult = function (evento) {
      if (finalizado) return;
      finalizado = true;
      const res = evento.results[0];
      let melhor = res[0];
      for (let i = 1; i < res.length; i++) {
        try {
          if ((res[i].confidence || 0) > (melhor.confidence || 0)) melhor = res[i];
        } catch (e) { /* ignora */ }
      }
      const texto = (melhor.transcript || "").trim();
      const confianca = melhor.confidence || 0;
      if (aoResultado && texto) aoResultado(texto, confianca);
      else if (aoFim) aoFim();
    };
    reconhecedor.onerror = function (evento) {
      if (finalizado) return;
      finalizado = true;
      if (aoErro) aoErro(evento.error);
    };
    reconhecedor.onend = function () {
      if (finalizado) return;
      finalizado = true;
      if (aoFim) aoFim();
    };
    try { reconhecedor.start(); } catch (erro) {
      finalizado = true;
      if (aoErro) aoErro("start-falhou");
    }
  }

  function pararDeOuvir() {
    if (reconhecedor) {
      try { reconhecedor.abort(); } catch (erro) { /* ignorar */ }
      reconhecedor = null;
    }
  }

  function falar(texto, aoIniciar, aoTerminar) {
    if (!("speechSynthesis" in window)) {
      if (aoTerminar) aoTerminar();
      return;
    }
    speechSynthesis.cancel();
    const enunciado = new SpeechSynthesisUtterance(texto);
    const voz = obterVoz();
    if (voz) enunciado.voice = voz;
    enunciado.lang = CONFIG.LOCALE_PT;
    enunciado.rate = 1.05;
    enunciado.onstart = function () { if (aoIniciar) aoIniciar(); };
    enunciado.onend = function () { if (aoTerminar) aoTerminar(); };
    enunciado.onerror = function () { if (aoTerminar) aoTerminar(); };
    speechSynthesis.speak(enunciado);
  }

  function pararFala() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  if ("speechSynthesis" in window) {
    speechSynthesis.onvoiceschanged = obterVoz;
    obterVoz();
  }

  return { ouvir: ouvir, pararDeOuvir: pararDeOuvir, falar: falar, pararFala: pararFala };
})();