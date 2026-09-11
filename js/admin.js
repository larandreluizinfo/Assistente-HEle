function escapeHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function criarCampoFaq(pergunta, resposta) {
  const div = document.createElement("div");
  div.className = "faq-item";
  div.innerHTML =
    '<label>Pergunta <input type="text" class="faq-pergunta" value="' + escapeHtml(pergunta) + '" /></label>' +
    '<label>Resposta <textarea class="faq-resposta">' + escapeHtml(resposta) + "</textarea></label>" +
    '<button type="button" class="btn btn-remover">Remover</button>';
  div.querySelector(".btn-remover").addEventListener("click", function () { div.remove(); });
  return div;
}

function popular(dados) {
  document.getElementById("projeto-nome").value = dados.projeto.nome || "";
  document.getElementById("projeto-descricao").value = dados.projeto.descricao || "";
  document.getElementById("projeto-detalhes").value = dados.projeto.detalhes || "";
  document.getElementById("projeto-creditos").value = dados.projeto.creditos || "";
  document.getElementById("evento-nome").value = dados.evento.nome || "";
  document.getElementById("evento-local").value = dados.evento.local || "";
  document.getElementById("evento-horarios").value = dados.evento.horarios || "";
  document.getElementById("evento-mapa").value = dados.evento.mapa || "";
  document.getElementById("evento-estandes").value = (dados.evento.estandes || []).join("\n");
  document.getElementById("evento-banheiros").value = dados.evento.banheiros || "";
  document.getElementById("evento-outras").value = dados.evento.outras || "";
  const listaFaq = document.getElementById("lista-faq");
  listaFaq.innerHTML = "";
  (dados.faq || []).forEach(function (faq) {
    listaFaq.appendChild(criarCampoFaq(faq.pergunta, faq.resposta));
  });
  if (!(dados.faq || []).length) {
    listaFaq.appendChild(criarCampoFaq("", ""));
  }
}

function coletar() {
  const estandesTexto = document.getElementById("evento-estandes").value;
  const faqs = Array.from(document.querySelectorAll(".faq-item")).map(function (item) {
    return {
      pergunta: item.querySelector(".faq-pergunta").value.trim(),
      resposta: item.querySelector(".faq-resposta").value.trim()
    };
  }).filter(function (faq) { return faq.pergunta && faq.resposta; });
  // Preserva os projetos: o painel não edita projetos, então mantém os já salvos
  let projetos = PROJETOS_FEIRA;
  try {
    const atual = carregarConhecimento();
    if (atual && atual.projetos && atual.projetos.length) projetos = atual.projetos;
  } catch (erro) { /* usa padrão */ }
  return {
    projeto: {
      nome: document.getElementById("projeto-nome").value.trim(),
      descricao: document.getElementById("projeto-descricao").value.trim(),
      detalhes: document.getElementById("projeto-detalhes").value.trim(),
      creditos: document.getElementById("projeto-creditos").value.trim()
    },
    evento: {
      nome: document.getElementById("evento-nome").value.trim(),
      local: document.getElementById("evento-local").value.trim(),
      horarios: document.getElementById("evento-horarios").value.trim(),
      mapa: document.getElementById("evento-mapa").value.trim(),
      estandes: estandesTexto.split("\n").map(function (linha) { return linha.trim(); }).filter(Boolean),
      banheiros: document.getElementById("evento-banheiros").value.trim(),
      outras: document.getElementById("evento-outras").value.trim()
    },
    projetos: projetos,
    faq: faqs
  };
}

function mostrarMensagem(texto) {
  const msg = document.getElementById("msg");
  msg.textContent = texto;
  setTimeout(function () { msg.textContent = ""; }, 2500);
}

function iniciarPainel() {
  const form = document.getElementById("form-conhecimento");
  const btnAddFaq = document.getElementById("btn-add-faq");
  const btnReset = document.getElementById("btn-reset");
  const listaFaq = document.getElementById("lista-faq");

  btnAddFaq.addEventListener("click", function () {
    listaFaq.appendChild(criarCampoFaq("", ""));
  });

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    salvarConhecimento(coletar());
    mostrarMensagem("Salvo com sucesso!");
  });

  btnReset.addEventListener("click", function () {
    if (confirm("Restaurar o conhecimento padrão?")) {
      const padrao = conhecimentoPadrao();
      salvarConhecimento(padrao);
      popular(padrao);
      mostrarMensagem("Conhecimento restaurado.");
    }
  });

  popular(carregarConhecimento());
}

document.addEventListener("DOMContentLoaded", iniciarPainel);