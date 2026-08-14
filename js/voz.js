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

  function ouvir(aoResultado, aoErro) {
    if (!reconhecedor) reconhecedor = prepararReconhecimento();
    if (!reconhecedor) {
      if (aoErro) aoErro("reconhecimento_nao_suportado");
      return;
    }
    try { reconhecedor.stop(); } catch (erro) { /* nada a fazer */ }
    reconhecedor.onresult = function (evento) {
      const texto = evento.results[0][0].transcript.trim();
      if (aoResultado && texto) aoResultado(texto);
    };
    reconhecedor.onerror = function (evento) {
      if (aoErro) aoErro(evento.error);
    };
    try { reconhecedor.start(); } catch (erro) { /* já iniciado */ }
  }

  function pararDeOuvir() {
    if (reconhecedor) {
      try { reconhecedor.stop(); } catch (erro) { /* nada a fazer */ }
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