const Avatar = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  let raiz = null;
  let boca = null;
  let estadoAtual = "idle";
  let temporizadorPiscar = null;
  let intervaloBoca = null;

  function criarEl(nome, atributos) {
    const el = document.createElementNS(SVG_NS, nome);
    for (const chave in atributos) {
      el.setAttribute(chave, atributos[chave]);
    }
    return el;
  }

  function iniciarPiscar() {
    pararPiscar();
    temporizadorPiscar = setInterval(function () {
      const olhos = raiz ? raiz.querySelectorAll(".olho") : [];
      olhos.forEach(function (olho) {
        olho.style.transform = "scaleY(0.1)";
      });
      setTimeout(function () {
        olhos.forEach(function (olho) {
          olho.style.transform = "scaleY(1)";
        });
      }, 150);
    }, 3500);
  }

  function pararPiscar() {
    if (temporizadorPiscar) clearInterval(temporizadorPiscar);
    temporizadorPiscar = null;
  }

  function montar(container) {
    raiz = criarEl("svg", { viewBox: "0 0 200 200", "class": "avatar-svg" });
    raiz.appendChild(criarEl("circle", { cx: "100", cy: "100", r: "80", fill: "#ffd166" }));
    raiz.appendChild(criarEl("ellipse", { cx: "75", cy: "90", rx: "14", ry: "16", fill: "#264653", "class": "olho olho-esq" }));
    raiz.appendChild(criarEl("ellipse", { cx: "125", cy: "90", rx: "14", ry: "16", fill: "#264653", "class": "olho olho-dir" }));
    raiz.appendChild(criarEl("circle", { cx: "80", cy: "84", r: "4", fill: "#ffffff", "class": "brilho" }));
    raiz.appendChild(criarEl("circle", { cx: "130", cy: "84", r: "4", fill: "#ffffff", "class": "brilho" }));
    raiz.appendChild(criarEl("circle", { cx: "60", cy: "112", r: "10", fill: "#f4a261", opacity: "0.5", "class": "bochecha" }));
    raiz.appendChild(criarEl("circle", { cx: "140", cy: "112", r: "10", fill: "#f4a261", opacity: "0.5", "class": "bochecha" }));
    boca = criarEl("path", {
      d: "M 85 130 Q 100 145 115 130",
      stroke: "#264653",
      "stroke-width": "5",
      fill: "none",
      "stroke-linecap": "round",
      "class": "boca"
    });
    raiz.appendChild(boca);
    container.appendChild(raiz);
    iniciarPiscar();
  }

  function definirEstado(estado) {
    estadoAtual = estado;
    if (raiz) raiz.setAttribute("class", "avatar-svg estado-" + estado);
  }

  function iniciarFala() {
    pararPiscar();
    if (intervaloBoca) clearInterval(intervaloBoca);
    intervaloBoca = setInterval(function () {
      if (!boca) return;
      const aberta = Math.random() > 0.5;
      boca.setAttribute("d", aberta ? "M 80 130 Q 100 158 120 130" : "M 85 130 Q 100 142 115 130");
    }, 120);
  }

  function pararFala() {
    if (intervaloBoca) clearInterval(intervaloBoca);
    intervaloBoca = null;
    if (boca) boca.setAttribute("d", "M 85 130 Q 100 145 115 130");
    if (estadoAtual === "falando") definirEstado("idle");
    iniciarPiscar();
  }

  return { montar: montar, definirEstado: definirEstado, iniciarFala: iniciarFala, pararFala: pararFala };
})();