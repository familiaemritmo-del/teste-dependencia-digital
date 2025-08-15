/*
  Mock data and scoring logic for Teste de Dependência Digital Infantil
  NOTE: This is FRONTEND-ONLY mock. No backend calls are made yet.
  We store progress and results in localStorage to simulate persistence.
*/

export const BRAND = {
  name: "Teste de Dependência Digital Infantil",
  colors: {
    black: "#000000",
    navy: "#1D3557",
    yellow: "#FFD60A",
    light: "#F1F1F1",
  },
  courseUrl: "https://filhoindependente.com.br/detox_digital/",
  logoUrl:
    "https://customer-assets.emergentagent.com/job_detox-digital/artifacts/me36p74r_Logo%20FeR.png",
};

// Utility: localStorage helpers
const LS_KEYS = {
  answers: "tddi_answers_v1",
  profile: "tddi_profile_v1",
  results: "tddi_results_history_v1",
};

export function saveProfile(profile) {
  localStorage.setItem(LS_KEYS.profile, JSON.stringify(profile));
}
export function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.profile) || "null");
  } catch (e) {
    return null;
  }
}

export function saveAnswers(answers) {
  localStorage.setItem(LS_KEYS.answers, JSON.stringify(answers));
}
export function loadAnswers() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.answers) || "{}");
  } catch (e) {
    return {};
  }
}

export function saveResult(result) {
  const history = loadResultsHistory();
  const updated = [
    { ...result, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ...history,
  ].slice(0, 25);
  localStorage.setItem(LS_KEYS.results, JSON.stringify(updated));
}
export function loadResultsHistory() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.results) || "[]");
  } catch (e) {
    return [];
  }
}

// Mock email opt-in (no real email is sent)
export async function mockEmailOptIn(email, resultPayload) {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 500));
  const list = JSON.parse(localStorage.getItem("tddi_mock_emails") || "[]");
  list.unshift({ email, payload: resultPayload, ts: Date.now() });
  localStorage.setItem("tddi_mock_emails", JSON.stringify(list));
  return { ok: true };
}

// Answer options helper (Likert 0..4)
const L = {
  NUNCA: { label: "Nunca", value: 0 },
  RARAMENTE: { label: "Raramente", value: 1 },
  AS_VEZES: { label: "Às vezes", value: 2 },
  FREQUENTEMENTE: { label: "Frequentemente", value: 3 },
  SEMPRE: { label: "Sempre", value: 4 },
};

export const QUESTIONS = [
  {
    id: "q1",
    title:
      "Tempo de Tela Diário: Quantas horas, em média, por dia seu filho(a) passa em atividades de tela?",
    options: [
      { label: "Menos de 1 hora", value: 0 },
      { label: "1–2 horas", value: 1 },
      { label: "3–4 horas", value: 2 },
      { label: "5–6 horas", value: 3 },
      { label: "Mais de 6 horas", value: 4 },
    ],
  },
  {
    id: "q2",
    title:
      "Extrapolar Limites de Uso: Com que frequência ele(a) fica mais tempo do que o combinado?",
    options: [L.NUNCA, L.RARAMENTE, L.AS_VEZES, L.FREQUENTEMENTE, L.SEMPRE],
  },
  {
    id: "q3",
    title:
      "Reação ao Desligar: Com que frequência fica irritado(a) quando precisa desligar?",
    options: [
      { label: "Nunca reage mal", value: 0 },
      { label: "Raramente", value: 1 },
      { label: "Às vezes", value: 2 },
      { label: "Fica irritado com frequência", value: 3 },
      { label: "Quase sempre faz birra ou se irrita", value: 4 },
    ],
  },
  {
    id: "q4",
    title:
      "Pedidos Frequentes por Tela: Com que frequência pede insistentemente para usar telas fora do horário?",
    options: [L.NUNCA, L.RARAMENTE, L.AS_VEZES, { label: "Frequente", value: 3 }, { label: "Muito frequente", value: 4 }],
  },
  {
    id: "q5",
    title:
      "Preferência por Telas vs. Outras Atividades: Com que frequência prefere telas quando há alternativas?",
    options: [
      { label: "Nunca prefere telas", value: 0 },
      { label: "Raramente", value: 1 },
      { label: "Às vezes prefere", value: 2 },
      { label: "Frequentemente escolhe telas", value: 3 },
      { label: "Sempre prefere telas", value: 4 },
    ],
  },
  {
    id: "q6",
    title:
      "Uso em Momentos Inadequados: Com que frequência usa ou tenta usar dispositivos em horários impróprios?",
    options: [L.NUNCA, L.RARAMENTE, L.AS_VEZES, L.FREQUENTEMENTE, L.SEMPRE],
  },
  {
    id: "q7",
    title:
      "Dificuldade em Impor Limites: Com que frequência é difícil manter regras de tempo de tela?",
    options: [
      { label: "Não tenho dificuldade", value: 0 },
      { label: "Pouca dificuldade", value: 1 },
      { label: "Às vezes é difícil", value: 2 },
      { label: "Tenho muita dificuldade", value: 3 },
      { label: "Praticamente impossível controlar", value: 4 },
    ],
  },
  {
    id: "q8",
    title:
      "Ansiedade na Falta de Tela: Com que frequência demonstra inquietação/ansiedade sem telas?",
    options: [
      { label: "Nunca – lida bem", value: 0 },
      { label: "Raramente fica inquieto", value: 1 },
      { label: "Às vezes sim", value: 2 },
      { label: "Frequentemente demonstra ansiedade", value: 3 },
      { label: "Sempre fica agitado sem telas", value: 4 },
    ],
  },
  {
    id: "q9",
    title:
      "Impacto no Sono: Com que frequência o uso de dispositivos atrapalha o sono?",
    options: [
      { label: "Nunca afeta o sono", value: 0 },
      { label: "Raramente", value: 1 },
      { label: "Às vezes", value: 2 },
      { label: "Frequentemente", value: 3 },
      { label: "Quase todas as noites", value: 4 },
    ],
  },
  {
    id: "q10",
    title:
      "Prejuízo nas Responsabilidades: Com que frequência deixa de cumprir tarefas por causa da tela?",
    options: [
      { label: "Nunca deixa de cumprir", value: 0 },
      { label: "Raramente", value: 1 },
      { label: "Às vezes", value: 2 },
      { label: "Frequentemente prejudica", value: 3 },
      { label: "Sempre troca deveres por tela", value: 4 },
    ],
  },
  {
    id: "q11",
    title:
      "Uso de Tela como Calmante: Com que frequência usa telas para acalmar/entreter em situações difíceis?",
    options: [
      { label: "Nunca recorro a telas", value: 0 },
      { label: "Quase nunca", value: 1 },
      { label: "Às vezes", value: 2 },
      { label: "Faço isso com frequência", value: 3 },
      { label: "Sempre uso essa estratégia", value: 4 },
    ],
  },
  {
    id: "q12",
    title:
      "Tolerância (Aumento Gradual): Com que frequência quer mais tempo de tela ou conteúdos mais intensos?",
    options: [
      { label: "Não, se contenta facilmente", value: 0 },
      { label: "Raramente", value: 1 },
      { label: "Percebo um pouco", value: 2 },
      { label: "Com frequência quer mais", value: 3 },
      { label: "Sempre quer prolongar/intensificar", value: 4 },
    ],
  },
  {
    id: "q13",
    title:
      "Uso Escondido: Com que frequência tenta usar dispositivos às escondidas?",
    options: [
      { label: "Nunca fez isso", value: 0 },
      { label: "Uma vez/raramente", value: 1 },
      { label: "Algumas vezes", value: 2 },
      { label: "Com certa frequência", value: 3 },
      { label: "Sempre tenta driblar as regras", value: 4 },
    ],
  },
  {
    id: "q14",
    title:
      "Imersão Excessiva: Com que frequência não responde por estar vidrado na tela?",
    options: [L.NUNCA, L.RARAMENTE, L.AS_VEZES, L.FREQUENTEMENTE, { label: "Quase sempre", value: 4 }],
  },
  {
    id: "q15",
    title:
      "Conflitos Familiares: Com que frequência o uso de telas gera brigas em casa?",
    options: [
      { label: "Nunca houve conflito", value: 0 },
      { label: "Raramente", value: 1 },
      { label: "Ocasionalmente", value: 2 },
      { label: "Frequentemente brigamos", value: 3 },
      { label: "Fonte constante de brigas", value: 4 },
    ],
  },
  {
    id: "q16",
    title:
      "Desinteresse por Atividades Offline: Com que frequência se entedia sem eletrônicos?",
    options: [
      { label: "Nunca – gosta de atividades offline", value: 0 },
      { label: "Raramente", value: 1 },
      { label: "Às vezes", value: 2 },
      { label: "Frequentemente mostra desinteresse", value: 3 },
      { label: "Sempre – nada fora das telas entretém", value: 4 },
    ],
  },
  {
    id: "q17",
    title:
      "Comprometimento Social: Com que frequência prioriza telas em vez de interações sociais?",
    options: [L.NUNCA, L.RARAMENTE, L.AS_VEZES, { label: "Muitas vezes", value: 3 }, { label: "Praticamente sempre", value: 4 }],
  },
  {
    id: "q18",
    title:
      "Dependência Emocional: Com que frequência precisa de tela para regular o humor?",
    options: [
      { label: "Nunca – se acalma de outras formas", value: 0 },
      { label: "Raramente", value: 1 },
      { label: "Às vezes recorre à tela", value: 2 },
      { label: "Frequentemente é o único jeito", value: 3 },
      { label: "Sempre – sem tela não se acalma", value: 4 },
    ],
  },
  {
    id: "q19",
    title:
      "Tentativas de Detox: Com que frequência tentativas de reduzir o uso fracassam?",
    options: [
      { label: "Nunca precisei tentar", value: 0 },
      { label: "Tentei e consegui manter", value: 1 },
      { label: "Parcialmente bem-sucedido", value: 2 },
      { label: "Frequentemente não dá certo", value: 3 },
      { label: "Sempre fracasso em pouco tempo", value: 4 },
    ],
  },
  {
    id: "q20",
    title:
      "Nível de Preocupação: Com que frequência você se preocupa que o uso está fora de controle?",
    options: [L.NUNCA, L.RARAMENTE, L.AS_VEZES, L.FREQUENTEMENTE, L.SEMPRE],
  },
];

export function computeScore(answers) {
  // answers: { [questionId]: 0..4 }
  const total = QUESTIONS.reduce((sum, q) => sum + (Number(answers[q.id]) || 0), 0);
  let level = "Baixa";
  if (total >= 61) level = "Muito Alta";
  else if (total >= 41) level = "Alta";
  else if (total >= 21) level = "Moderada";

  const category = {
    name: `Dependência ${level}`,
    color: level === "Baixa" ? "green" : level === "Moderada" ? "amber" : level === "Alta" ? "orange" : "red",
  };

  const tips = getTipsFor(level);
  return { total, max: 80, level, category, tips };
}

function getTipsFor(level) {
  const base = [
    "Crie zonas livres de tecnologia (mesa das refeições, quarto).",
    "Estabeleça horários claros de uso e desligamento.",
    "Ofereça alternativas divertidas offline todos os dias.",
    "Dê o exemplo: revise seu próprio uso de telas.",
  ];
  if (level === "Baixa") {
    return [
      "Ótimo! Mantenha a rotina equilibrada com revisões semanais.",
      ...base,
    ];
  }
  if (level === "Moderada") {
    return [
      "Atenção: já há sinais de excesso. Comece com regras consistentes e combinadas em família.",
      ...base,
    ];
  }
  if (level === "Alta") {
    return [
      "Prioridade: reduza estímulos noturnos e imponha um limite diário firme.",
      "Implemente um detox de 48–72h sem jogos/redes para reset de hábitos.",
      ...base,
    ];
  }
  // Muito Alta
  return [
    "Situação séria, mas reversível: inicie um protocolo de detox guiado.",
    "Remova dispositivos do quarto e desligue 1–2h antes de dormir.",
    "Acompanhe emoções com alternativas (respiração, leitura, passeio).",
    ...base,
  ];
}

export function makeResultPayload(profile, answers) {
  const result = computeScore(answers);
  const payload = {
    profile,
    answers,
    result,
  };
  return payload;
}