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

  function ouvir(aoResultado, aoErro, aoFim) {
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
    reconhecedor.maxAlternatives = 1;
    let finalizado = false;
    reconhecedor.onresult = function (evento) {
      if (finalizado) return;
      finalizado = true;
      const texto = evento.results[0][0].transcript.trim();
      if (aoResultado && texto) aoResultado(texto);
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