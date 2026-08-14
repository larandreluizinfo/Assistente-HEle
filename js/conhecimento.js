const CHAVE_STORAGE = "hele_conhecimento";

function conhecimentoPadrao() {
  return {
    projeto: {
      nome: "Assistente HEle",
      descricao: "Uma assistente virtual que conversa com os visitantes da feira de ciências.",
      detalhes: "Ela fala e escuta usando o navegador, tem um avatar animado e é ativada por um sensor de presença no Arduino.",
      creditos: "Desenvolvida pelos alunos como projeto da feira de ciências."
    },
    evento: {
      nome: "Feira de Ciências",
      local: "Escola",
      horarios: "Das 9h às 17h",
      mapa: "Informe a localização dos estandes no mapa do evento.",
      estandes: [],
      banheiros: "Informe a localização dos banheiros.",
      outras: "Informe outras informações do evento."
    },
    faq: [
      {
        pergunta: "Quem desenvolveu a HEle?",
        resposta: "Foi desenvolvida pelos alunos como projeto da feira de ciências."
      },
      {
        pergunta: "Como a HEle funciona?",
        resposta: "Ela usa o microfone e a caixa de som do computador para ouvir e falar com você."
      }
    ]
  };
}

function carregarConhecimento() {
  try {
    const bruto = localStorage.getItem(CHAVE_STORAGE);
    if (!bruto) {
      const padrao = conhecimentoPadrao();
      salvarConhecimento(padrao);
      return padrao;
    }
    return JSON.parse(bruto);
  } catch (erro) {
    return conhecimentoPadrao();
  }
}

function salvarConhecimento(dados) {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dados));
}

function montarContexto(conhecimento) {
  const linhas = [];
  const projeto = conhecimento.projeto;
  const evento = conhecimento.evento;

  linhas.push("PROJETO:");
  linhas.push("- Nome: " + projeto.nome);
  linhas.push("- O que é: " + projeto.descricao);
  linhas.push("- Detalhes: " + projeto.detalhes);
  linhas.push("- Créditos: " + projeto.creditos);

  linhas.push("EVENTO:");
  linhas.push("- Nome: " + evento.nome);
  linhas.push("- Local: " + evento.local);
  linhas.push("- Horários: " + evento.horarios);
  linhas.push("- Mapa: " + evento.mapa);
  if (evento.estandes && evento.estandes.length) {
    linhas.push("- Estandes: " + evento.estandes.join("; "));
  }
  linhas.push("- Banheiros: " + evento.banheiros);
  linhas.push("- Outras informações: " + evento.outras);

  if (conhecimento.faq && conhecimento.faq.length) {
    linhas.push("PERGUNTAS FREQUENTES:");
    for (const faq of conhecimento.faq) {
      linhas.push("- " + faq.pergunta + " => " + faq.resposta);
    }
  }

  return linhas.join("\n");
}