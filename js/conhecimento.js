const CHAVE_STORAGE = "hele_conhecimento";

const PROJETOS_FEIRA = [
  {
    id: 1,
    nome: "Horta Inteligente",
    alunos: "Ana Clara, Miguel e João",
    area: "Ciência e Tecnologia",
    objetivo: "Desenvolver uma horta automatizada e sustentável.",
    descricao: "Sistema que utiliza sensores de umidade para identificar quando as plantas precisam de água e acionar automaticamente a irrigação."
  },
  {
    id: 2,
    nome: "Arte com Reciclagem",
    alunos: "Beatriz, Laura e Pedro",
    area: "Artes e Sustentabilidade",
    objetivo: "Demonstrar como materiais descartáveis podem se transformar em obras de arte.",
    descricao: "Criação de esculturas e instalações utilizando garrafas PET, papelão, tampinhas e outros materiais recicláveis."
  },
  {
    id: 3,
    nome: "Robô Explorador",
    alunos: "Lucas, Gabriel e Enzo",
    area: "Tecnologia",
    objetivo: "Construir um robô capaz de percorrer diferentes ambientes.",
    descricao: "Protótipo de robô equipado com sensores que identifica obstáculos e muda sua direção automaticamente."
  },
  {
    id: 4,
    nome: "O Universo em Cores",
    alunos: "Sofia, Helena e Marina",
    area: "Artes e Ciência",
    objetivo: "Representar fenômenos do espaço por meio da arte.",
    descricao: "Produção de pinturas e painéis inspirados em planetas, estrelas, nebulosas e galáxias, acompanhados de explicações científicas."
  },
  {
    id: 5,
    nome: "Energia do Futuro",
    alunos: "Arthur, Matheus e Rafael",
    area: "Ciência e Tecnologia",
    objetivo: "Apresentar alternativas de geração de energia limpa.",
    descricao: "Construção de pequenos modelos demonstrando energia solar, eólica e hidráulica."
  },
  {
    id: 6,
    nome: "Cidade Inteligente",
    alunos: "Júlia, Manuela e Nicolas",
    area: "Tecnologia",
    objetivo: "Criar uma representação de uma cidade sustentável e tecnológica.",
    descricao: "Maquete com iluminação automatizada, sensores, áreas verdes, transporte sustentável e sistemas de reaproveitamento de água."
  },
  {
    id: 7,
    nome: "Teatro Científico",
    alunos: "Camila, Isabela, Thiago e Felipe",
    area: "Artes e Ciência",
    objetivo: "Utilizar o teatro como ferramenta para divulgar conhecimentos científicos.",
    descricao: "Peça teatral que apresenta, de forma divertida, descobertas científicas e situações relacionadas ao meio ambiente e à tecnologia."
  },
  {
    id: 8,
    nome: "Museu do Futuro",
    alunos: "Mariana, Alice e Bernardo",
    area: "Artes e Tecnologia",
    objetivo: "Imaginar como será a vida das pessoas no futuro.",
    descricao: "Exposição com objetos, desenhos, protótipos e instalações que representam tecnologias que poderão fazer parte do cotidiano."
  },
  {
    id: 9,
    nome: "Água: Nosso Bem Maior",
    alunos: "Valentina, Davi e Gustavo",
    area: "Ciência e Sustentabilidade",
    objetivo: "Conscientizar sobre a importância da preservação da água.",
    descricao: "Experimentos e maquetes demonstrando o ciclo da água, formas de poluição e métodos simples de captação e reutilização."
  },
  {
    id: 10,
    nome: "Música e Tecnologia",
    alunos: "Luiza, Henrique e Samuel",
    area: "Artes e Tecnologia",
    objetivo: "Explorar a relação entre música, criatividade e tecnologia.",
    descricao: "Criação de músicas utilizando instrumentos tradicionais e ferramentas digitais, demonstrando como a tecnologia pode transformar a produção musical."
  },
  {
    id: 11,
    nome: "Ciência na Cozinha",
    alunos: "Manuela, Caio e Eduardo",
    area: "Ciência",
    objetivo: "Demonstrar fenômenos científicos presentes na alimentação.",
    descricao: "Experimentos envolvendo fermentação, mudanças de estado, densidade, acidez e outras reações observadas no cotidiano."
  },
  {
    id: 12,
    nome: "Fotografia: Olhares sobre a Escola",
    alunos: "Clara, Gabriel e André",
    area: "Artes",
    objetivo: "Registrar e apresentar diferentes perspectivas do ambiente escolar.",
    descricao: "Exposição fotográfica mostrando espaços, pessoas e situações do cotidiano escolar a partir do olhar dos estudantes."
  },
  {
    id: 13,
    nome: "Inteligência Artificial na Educação",
    alunos: "Pedro Henrique, Sofia e Daniel",
    area: "Tecnologia",
    objetivo: "Investigar como a inteligência artificial pode auxiliar no aprendizado.",
    descricao: "Apresentação de exemplos de utilização de IA para pesquisas, criação de conteúdos, organização dos estudos e desenvolvimento de projetos."
  },
  {
    id: 14,
    nome: "Planeta Sustentável",
    alunos: "Lara, Miguel e Júlio",
    area: "Ciência, Arte e Tecnologia",
    objetivo: "Integrar conhecimentos de diferentes áreas para pensar soluções ambientais.",
    descricao: "Maquete de um planeta sustentável combinando arte, energia renovável, reciclagem, agricultura e tecnologias inteligentes."
  },
  {
    id: 15,
    nome: "Luz, Cor e Ilusão",
    alunos: "Beatriz, João e Rafael",
    area: "Artes e Ciência",
    objetivo: "Explorar os fenômenos físicos relacionados à luz e às cores.",
    descricao: "Experimentos com prismas, sombras, reflexos e mistura de cores, acompanhados de produções artísticas dos alunos."
  },
  {
    id: 16,
    nome: "Aplicativo Escola Conectada",
    alunos: "Nicolas, Arthur e Helena",
    area: "Tecnologia",
    objetivo: "Desenvolver uma solução digital para facilitar a comunicação escolar.",
    descricao: "Protótipo de aplicativo com calendário de eventos, avisos, atividades e informações importantes para alunos e professores."
  },
  {
    id: 17,
    nome: "Corpo Humano Interativo",
    alunos: "Laura, Felipe e Mateus",
    area: "Ciência e Tecnologia",
    objetivo: "Conhecer o funcionamento dos principais sistemas do corpo humano.",
    descricao: "Modelo interativo do corpo humano utilizando recursos digitais para apresentar órgãos e sistemas de forma visual e dinâmica."
  },
  {
    id: 18,
    nome: "Grafite e Sociedade",
    alunos: "Enzo, Mariana e Lucas",
    area: "Artes",
    objetivo: "Utilizar a arte urbana para expressar ideias sobre a sociedade.",
    descricao: "Produção de painéis inspirados na arte urbana, abordando temas como diversidade, respeito, meio ambiente e convivência."
  },
  {
    id: 19,
    nome: "Detector de Qualidade do Ar",
    alunos: "João Pedro, Gustavo e Alice",
    area: "Ciência e Tecnologia",
    objetivo: "Investigar a qualidade do ar em diferentes ambientes.",
    descricao: "Protótipo utilizando sensores para medir características do ambiente e apresentar os dados coletados de maneira visual."
  },
  {
    id: 20,
    nome: "Feira do Futuro",
    alunos: "Todos os alunos participantes",
    area: "Artes, Ciência e Tecnologia",
    objetivo: "Integrar os conhecimentos desenvolvidos pelos estudantes durante a feira.",
    descricao: "Espaço coletivo que reúne as principais descobertas, criações artísticas, experimentos e tecnologias desenvolvidas pelos alunos."
  }
];

function conhecimentoPadrao() {
  return {
    projeto: {
      nome: "Assistente Helê",
      descricao: "Uma assistente virtual que conversa com os visitantes da Feira de Conhecimento.",
      detalhes: "Ela fala e escuta usando o navegador, tem um avatar animado e é ativada por um sensor de presença no Arduino. Conhece todos os 20 projetos da feira.",
      creditos: "Desenvolvida pelos alunos como projeto da feira de ciências."
    },
    evento: {
      nome: "Feira de Conhecimento — Arte, Ciência e Tecnologia",
      local: "Escola",
      horarios: "Das 9h às 17h",
      mapa: "Informe a localização dos estandes no mapa do evento.",
      estandes: PROJETOS_FEIRA.map(function (p) { return p.nome; }),
      banheiros: "Informe a localização dos banheiros.",
      outras: "Evento com 20 projetos interativos das áreas de Arte, Ciência e Tecnologia."
    },
    projetos: PROJETOS_FEIRA,
    faq: [
      {
        pergunta: "Quem desenvolveu a Helê?",
        resposta: "Foi desenvolvida pelos alunos como projeto da feira de ciências."
      },
      {
        pergunta: "Como a Helê funciona?",
        resposta: "Ela usa o microfone e a caixa de som do computador para ouvir e falar com você."
      },
      {
        pergunta: "Quantos projetos tem na feira?",
        resposta: "São 20 projetos nas áreas de Arte, Ciência e Tecnologia, como Horta Inteligente, Robô Explorador, Energia do Futuro e muitos outros."
      },
      {
        pergunta: "O que é a Horta Inteligente?",
        resposta: "É um sistema que utiliza sensores de umidade para identificar quando as plantas precisam de água e acionar automaticamente a irrigação, desenvolvido por Ana Clara, Miguel e João."
      },
      {
        pergunta: "O que é o Robô Explorador?",
        resposta: "É um protótipo de robô equipado com sensores que identifica obstáculos e muda sua direção automaticamente, desenvolvido por Lucas, Gabriel e Enzo."
      },
      {
        pergunta: "O que é o Detector de Qualidade do Ar?",
        resposta: "É um protótipo utilizando sensores para medir características do ambiente e apresentar os dados coletados de maneira visual, desenvolvido por João Pedro, Gustavo e Alice."
      },
      {
        pergunta: "O que você pode fazer?",
        resposta: "Posso apresentar os 20 projetos da feira, falar sobre horários, local, estandes e responder suas perguntas. É só perguntar pelo nome de um projeto ou pelo evento!"
      },
      {
        pergunta: "Quem é você?",
        resposta: "Sou a Helê, a assistente virtual da feira de ciências. Conheço os 20 projetos e adoro conversar com os visitantes!"
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
    const dados = JSON.parse(bruto);
    // Migração: salvamentos antigos do painel não tinham `projetos` — restaura sem apagar o resto
    if (!dados.projetos || !dados.projetos.length) {
      dados.projetos = PROJETOS_FEIRA;
      salvarConhecimento(dados);
    }
    return dados;
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

  if (conhecimento.projetos && conhecimento.projetos.length) {
    linhas.push("PROJETOS DA FEIRA:");
    for (const p of conhecimento.projetos) {
      linhas.push("- [" + p.id + "] " + p.nome + " (" + p.area + ") - Alunos: " + p.alunos);
      linhas.push("  Objetivo: " + p.objetivo);
      linhas.push("  " + p.descricao);
    }
  }

  if (conhecimento.faq && conhecimento.faq.length) {
    linhas.push("PERGUNTAS FREQUENTES:");
    for (const faq of conhecimento.faq) {
      linhas.push("- " + faq.pergunta + " => " + faq.resposta);
    }
  }

  return linhas.join("\n");
}

function normalizarTexto(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function distanciaEdicao(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = new Array(m + 1);
  for (let i = 0; i <= m; i++) dp[i] = [i].concat(new Array(n).fill(0));
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + custo);
    }
  }
  return dp[m][n];
}

const STOPWORDS = {};
["para", "pode", "podem", "fazer", "fazes", "fala", "fale", "falar", "diga", "dizem", "sobre", "projeto", "projetos", "qual", "quais", "quanto", "quantos", "quantas", "como", "muito", "muita", "muitos", "muitas", "mesmo", "mesma", "coisa", "coisas", "esse", "essa", "esses", "essas", "este", "esta", "estes", "estas", "isso", "isto", "aquele", "aquela", "feira", "escola", "aluno", "alunos", "todos", "todas", "todo", "toda", "onde", "quando", "quem", "qualquer", "voces", "deles", "delas", "nele", "nela", "neles", "nelas", "aqui", "entao", "tambem", "ainda", "entre", "outro", "outra", "outros", "outras", "sejam", "serem", "foram", "estao", "estamos", "tenho", "temos", "posso", "consegue", "sabe", "sabem"].forEach(function (w) { STOPWORDS[w] = true; });

function palavrasUteis(t) {
  return t.split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 4 && !STOPWORDS[w]; });
}

function pontuacaoExata(p, t, palavrasPergunta) {
  const nome = normalizarTexto(p.nome || "");
  if (!nome) return 0;
  if (nome && t.indexOf(nome) !== -1) return 100;
  if (t.length >= 3 && nome.indexOf(t) !== -1) return 80;
  const palavrasNome = nome.split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 4; });
  const acertosNome = palavrasNome.filter(function (w) { return t.indexOf(w) !== -1; }).length;
  if (acertosNome) return 50 + acertosNome * 10;
  const outrosPalavras = normalizarTexto([(p.alunos || ""), (p.area || ""), (p.objetivo || ""), (p.descricao || "")].join(" "))
    .split(/[^a-z0-9]+/).filter(Boolean);
  const acertosOutros = palavrasPergunta.filter(function (w) { return outrosPalavras.indexOf(w) !== -1; }).length;
  if (acertosOutros) return 10 + acertosOutros;
  return 0;
}

function buscarProjeto(conhecimento, termo) {
  if (!conhecimento || !conhecimento.projetos || !termo) return null;
  const t = normalizarTexto(termo).trim();
  if (!t) return null;
  const palavrasPergunta = palavrasUteis(t);
  // Passada 1: exato no NOME (evita hijack de perguntas genéricas como "o que você pode fazer")
  let melhor = null, melhorPts = 0;
  for (const p of conhecimento.projetos) {
    const pts = pontuacaoExata(p, t, palavrasPergunta);
    if (pts > melhorPts) { melhorPts = pts; melhor = p; }
  }
  // Só responde direto se o nome do projeto foi mencionado (50+).
  // Menor que isso (ex: 11 pts por "pode" na descrição) vai para a Gemini, que explica melhor.
  if (melhor && melhorPts >= 50) return melhor;
  if (melhor && melhorPts >= 10 && palavrasPergunta.length >= 2) {
    // 2+ palavras úteis nos outros campos (ex: "ana clara" nos alunos) ainda vale
    const confirma = palavrasPergunta.filter(function (w) {
      const outros = normalizarTexto([(melhor.alunos || ""), (melhor.area || "")].join(" "));
      return outros.indexOf(w) !== -1;
    }).length;
    if (confirma) return melhor;
  }
  // Passada 2: fuzzy só no NOME (tolera erro de transcrição)
  for (const p of conhecimento.projetos) {
    const nome = normalizarTexto(p.nome || "");
    const palavrasNomeTodas = nome.split(/[^a-z0-9]+/).filter(Boolean);
    for (const wp of palavrasPergunta) {
      if (wp.length < 5) continue;
      for (const wn of palavrasNomeTodas) {
        if (wn.length < 5) continue;
        if (Math.abs(wp.length - wn.length) > 2) continue;
        if (distanciaEdicao(wp, wn) <= 2) return p;
      }
    }
  }
  return null;
}

function listaProjetosTexto(conhecimento) {
  if (!conhecimento.projetos) return "";
  return conhecimento.projetos.map(function (p) {
    return p.id + ". " + p.nome + " — " + p.alunos + " (" + p.area + ")";
  }).join("\n");
}
