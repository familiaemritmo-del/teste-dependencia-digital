import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { Checkbox } from "../components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import {
  BRAND,
  QUESTIONS,
  saveAnswers,
  loadAnswers,
  saveProfile,
  loadProfile,
  computeScore,
  mockEmailOptIn,
  makeResultPayload,
} from "../mock/mock";
import { addTest, listAllTests, listTestsByEmail, Enums } from "../lib/db";
import { exportResultAsCSV, exportPDF } from "../lib/exporters";
import { sendLeadToSheets } from "../lib/leads";

const Container = ({ children }) => (
  <div className="min-h-screen bg-[hsl(var(--background))]">
    <Header />
    <main className="mx-auto w-full max-w-4xl px-4 py-8">{children}</main>
    <Footer />
  </div>
);

const Header = () => (
  <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <img src={BRAND.logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
        <Link to="/" className="font-extrabold tracking-tight text-[#1D3557]">{BRAND.name}</Link>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/meus-resultados" className="text-sm text-slate-700 hover:underline">Meus Resultados</Link>
        <a href={BRAND.courseUrl} target="_blank" rel="noreferrer">
          <Button className="bg-[#FFD60A] text-black hover:bg-[#e6c009]">Conhecer o Curso</Button>
        </a>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="border-t bg-[#F1F1F1]">
    <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-slate-600">
      <p>
        MVP sem backend. Persistência em IndexedDB (nativa do navegador). Envio best-effort para Google Sheets via webhook.
      </p>
    </div>
  </footer>
);

function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const profileFromLS = loadProfile();
  const [parentName, setParentName] = useState(profileFromLS?.parentName || "");
  const [email, setEmail] = useState(profileFromLS?.email || "");
  const [phone, setPhone] = useState(profileFromLS?.phone || "");
  const [childAge, setChildAge] = useState(profileFromLS?.childAge || "");
  const [consentUse, setConsentUse] = useState(true); // consentimento para uso no teste (obrigatório)
  const [consentContact, setConsentContact] = useState(true); // LGPD contato

  const startQuiz = () => {
    if (!consentUse) {
      toast({ title: "É preciso aceitar o uso de dados para continuar." });
      return;
    }
    const profile = { parentName, email, phone, childAge, consent: consentContact };
    saveProfile(profile);
    saveAnswers({});
    toast({ title: "Vamos começar!", description: "Seu perfil foi salvo." });
    navigate("/quiz");
  };

  const sanitizePhone = (v) => v.replace(/[^\d()+\-\s]/g, "");

  return (
    <Container>
      <section className="py-6">
        <div className="mb-8 rounded-xl bg-[#1D3557] p-8 text-white shadow">
          <h1 className="mb-3 text-3xl font-extrabold">Descubra o grau de dependência digital do seu filho(a)</h1>
          <p className="opacity-90">
            Responda 20 perguntas rápidas e receba recomendações personalizadas para começar
            hoje mesmo o Detox Digital Infantil.
          </p>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-[#1D3557]">Comece por aqui</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Seu nome (opcional)</Label>
              <Input id="name" placeholder="Ex.: Ana" value={parentName} onChange={(e) => setParentName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="age">Idade da criança</Label>
              <Input id="age" type="number" min={2} max={15} placeholder="Ex.: 8" value={childAge} onChange={(e) => setChildAge(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <p className="mt-1 text-xs text-slate-500">Tornamos o e-mail obrigatório apenas para enviar seu resultado e orientações futuras. Seus dados não serão compartilhados com terceiros.</p>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input id="phone" type="tel" placeholder="(DDD) 9XXXX-XXXX" value={phone} onChange={(e) => setPhone(sanitizePhone(e.target.value))} />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Checkbox id="consentUse" checked={consentUse} onCheckedChange={(v) => setConsentUse(Boolean(v))} />
                <Label htmlFor="consentUse">Li e concordo com o uso dos meus dados para gerar meu resultado e histórico.</Label>
                <Link to="/privacidade" className="ml-1 underline">Política de Privacidade (MVP)</Link>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="consentContact" checked={consentContact} onCheckedChange={(v) => setConsentContact(Boolean(v))} />
                <Label htmlFor="consentContact">Aceito receber orientações e materiais do Detox Digital Infantil no meu e-mail/WhatsApp.</Label>
              </div>
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <Button onClick={startQuiz} className="bg-[#1D3557] hover:bg-[#173052]">Iniciar Teste</Button>
              <a href={BRAND.courseUrl} target="_blank" rel="noreferrer" className="ml-1">
                <Button variant="secondary" className="bg-[#FFD60A] text-black hover:bg-[#e6c009]">Conhecer o Curso</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </Container>
  );
}

function Quiz() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [answers, setAnswers] = useState(() => loadAnswers());
  const [index, setIndex] = useState(() => {
    const keys = QUESTIONS.map((q) => q.id);
    const firstUnanswered = keys.findIndex((k) => answers[k] === undefined);
    return firstUnanswered === -1 ? 0 : firstUnanswered;
  });

  const q = QUESTIONS[index];
  const progress = Math.round(((index + (answers[q?.id] !== undefined ? 1 : 0)) / QUESTIONS.length) * 100);

  useEffect(() => {
    saveAnswers(answers);
  }, [answers]);

  const onChange = (val) => {
    setAnswers((prev) => ({ ...prev, [q.id]: Number(val) }));
  };

  const next = () => {
    if (index < QUESTIONS.length - 1) {
      setIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const prev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const finish = async () => {
    const profile = loadProfile();
    const payload = makeResultPayload(profile, answers);

    const answersArray = QUESTIONS.map((qq) => Number(answers[qq.id] ?? 0));
    const score = payload.result.total;
    const level = payload.result.level;
    const mapLevel = { Baixa: Enums.RISK.BAIXA, Moderada: Enums.RISK.MODERADA, Alta: Enums.RISK.ALTA, "Muito Alta": Enums.RISK.MUITO_ALTA };

    // Aviso se não houver e-mail
    const email = (profile?.email || "").trim();
    if (!email) {
      toast({ title: "Para receber materiais e histórico por e-mail, preencha seu e-mail." });
    }

    const record = {
      id: crypto.randomUUID(),
      email,
      telefone: profile?.phone || "",
      responsavel_nome: profile?.parentName || "",
      child_age: Number(profile?.childAge) || null,
      answers: answersArray,
      score_total: score,
      risk_level: mapLevel[level],
      created_at: new Date().toISOString(),
      consent: email ? Boolean(profile?.consent ?? true) : false,
    };

    await addTest(record);

    // Best-effort webhook para Sheets
    const leadPayload = {
      nome: record.responsavel_nome,
      telefone: record.telefone,
      email: record.email,
      child_age: record.child_age,
      answers: record.answers,
      score_total: record.score_total,
      risk_level: record.risk_level,
      consent: record.consent,
      created_at: record.created_at,
      user_agent: navigator.userAgent,
    };
    const ok = await sendLeadToSheets(leadPayload);

    if (ok) {
      toast({ title: "Dados enviados", description: "Você receberá novidades do Detox Digital Infantil." });
    } else {
      toast({ title: "Conexão instável", description: "Resultado salvo neste dispositivo. Tentaremos novamente mais tarde." });
    }

    navigate("/resultado");
  };

  const canAdvance = answers[q?.id] !== undefined;
  const allAnswered = QUESTIONS.every((qq) => answers[qq.id] !== undefined);

  return (
    <Container>
      <section className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1D3557]">Pergunta {index + 1} de {QUESTIONS.length}</h2>
            <p className="text-sm text-slate-600">Responda com sinceridade – não há certo ou errado.</p>
          </div>
          <div className="w-48">
            <Progress value={progress} />
          </div>
        </div>

        <Card className="shadow">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{q.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[q.id] !== undefined ? String(answers[q.id]) : undefined}
              onValueChange={(v) => onChange(v)}
              className="grid gap-3"
            >
              {q.options.map((opt, i) => (
                <label
                  key={i}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                    answers[q.id] === opt.value ? "border-[#1D3557] bg-[#F1F1F1]" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem id={`opt-${q.id}-${i}`} value={String(opt.value)} />
                    <Label htmlFor={`opt-${q.id}-${i}`}>{opt.label}</Label>
                  </div>
                  <span className="text-xs text-slate-500">{opt.value}</span>
                </label>
              ))}
            </RadioGroup>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="outline" onClick={prev} disabled={index === 0}>
                Anterior
              </Button>
              {index < QUESTIONS.length - 1 && (
                <Button onClick={() => (canAdvance ? next() : toast({ title: "Selecione uma opção" }))} className="bg-[#1D3557] hover:bg-[#173052]">
                  Próxima
                </Button>
              )}
              {index === QUESTIONS.length - 1 && (
                <Button onClick={() => (allAnswered ? finish() : toast({ title: "Responda todas as perguntas" }))} className="bg-[#1D3557] hover:bg-[#173052]">
                  Ver Resultado
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </Container>
  );
}

function Resultado() {
  const profile = loadProfile();
  const answers = loadAnswers();
  const summary = useMemo(() => computeScore(answers), [answers]);
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const sendEmail = async () => {
    setSending(true);
    try {
      await mockEmailOptIn(profile?.email || "", makeResultPayload(profile, answers));
      toast({ title: "Enviamos uma cópia (simulado)", description: "Confira sua caixa de entrada." });
    } finally {
      setSending(false);
    }
  };

  const copy = getCopy(summary.level);
  const levelColor = {
    Baixa: "text-green-700 bg-green-50",
    Moderada: "text-amber-700 bg-amber-50",
    Alta: "text-orange-700 bg-orange-50",
    "Muito Alta": "text-red-700 bg-red-50",
  }[summary.level];

  const lastRecord = {
    id: crypto.randomUUID(),
    email: profile?.email || "",
    telefone: profile?.phone || "",
    responsavel_nome: profile?.parentName || "",
    child_age: Number(profile?.childAge) || null,
    answers: QUESTIONS.map((qq) => Number(answers[qq.id] ?? 0)),
    score_total: summary.total,
    risk_level: copy.enumValue,
    created_at: new Date().toISOString(),
    consent: Boolean(profile?.consent ?? true),
  };

  return (
    <Container>
      <section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1D3557]">Resultado do Teste: {copy.levelName}</CardTitle>
            <p className="text-sm text-slate-600">Pontuação: {summary.total}/80 • Data: {new Date().toLocaleString()}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${levelColor}`}>
              <span className="font-semibold">{copy.levelName}</span>
              <span>•</span>
              <span>{summary.total} de {summary.max} pontos</span>
            </div>
            <p className="text-slate-700">{copy.message}</p>
            <div>
              <h3 className="mb-2 font-semibold">3 ações rápidas</h3>
              <ul className="list-disc space-y-1 pl-5 text-slate-700">
                {copy.actions.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-slate-500">Diretrizes indicam limites diários de tela por faixa etária. Ajuste a rotina com carinho e consistência.</p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a href={BRAND.courseUrl} target="_blank" rel="noreferrer">
                <Button className="bg-[#FFD60A] text-black hover:bg-[#e6c009]">{copy.cta}</Button>
              </a>
              <Button variant="outline" onClick={sendEmail} disabled={sending}>
                {sending ? "Enviando..." : "Enviar resultado por e-mail (simulado)"}
              </Button>
              <Button variant="outline" onClick={() => exportPDF(lastRecord, { title: `Resultado do Teste: ${copy.levelName}`, subtitle: `Pontuação: ${summary.total}/80 • Data: ${new Date().toLocaleString()}`, levelName: copy.levelName, message: copy.message, actions: copy.actions, footer: "Diretrizes indicam limites diários de tela por faixa etária. Ajuste a rotina com carinho e consistência.", logoUrl: BRAND.logoUrl })}>Baixar PDF</Button>
              <Button variant="outline" onClick={() => exportResultAsCSV(lastRecord, "resultado.csv")}>Baixar CSV</Button>
              <Link to="/">
                <Button variant="ghost">Refazer Teste</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <RecentHistory />
      </section>
    </Container>
  );
}

function RecentHistory() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    listAllTests(10).then(setItems);
  }, []);
  if (!items.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#1D3557]">Histórico recente (neste dispositivo)</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{new Date(it.created_at).toLocaleString()}</p>
                <p className="text-xs text-slate-600">Nível: {levelLabel(it.risk_level)} • Pontos: {it.score_total}/80</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportResultAsCSV(it, "resultado.csv")}>CSV</Button>
                <Button variant="outline" onClick={() => exportPDF(it, copyFromEnum(it.risk_level))}>PDF</Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function MeusResultados() {
  const [email, setEmail] = useState(loadProfile()?.email || "");
  const [items, setItems] = useState([]);
  const buscar = async () => {
    const res = await listTestsByEmail(email.trim());
    setItems(res);
  };
  useEffect(() => {
    if (email) buscar();
  }, []);

  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1D3557]">Meus Resultados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={buscar} className="bg-[#1D3557] hover:bg-[#173052]">Buscar</Button>
          </div>
          {!email && (
            <p className="text-sm text-slate-600">Para ver seu histórico neste dispositivo, informe o e-mail usado quando fez o teste.</p>
          )}
          <div className="space-y-3">
            {items.map((it) => (
              <Card key={it.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{new Date(it.created_at).toLocaleString()}</p>
                      <p className="text-xs text-slate-600">Nível: {levelLabel(it.risk_level)} • Pontos: {it.score_total}/80</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => exportResultAsCSV(it, "resultado.csv")}>CSV</Button>
                      <Button variant="outline" onClick={() => exportPDF(it, copyFromEnum(it.risk_level))}>PDF</Button>
                    </div>
                  </div>
                  <Accordion type="single" collapsible className="mt-3">
                    <AccordionItem value="detalhes">
                      <AccordionTrigger>Ver detalhes</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm">Respostas: {JSON.stringify(it.answers)}</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

function Privacy() {
  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1D3557]">Política de Privacidade (MVP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>Usamos seus dados apenas para gerar o resultado do teste, exibir histórico neste dispositivo e melhorar a experiência. Não compartilhamos com terceiros.</p>
          <p>Você pode solicitar remoção enviando um e-mail para nossa equipe (Fase 2). Como este MVP não tem backend, os dados ficam salvos no seu próprio navegador e enviamos best-effort para o Google Sheets quando possível.</p>
        </CardContent>
      </Card>
    </Container>
  );
}

function getCopy(level) {
  if (level === "Baixa") {
    return { levelName: "Baixa", enumValue: Enums.RISK.BAIXA, message: "Boa notícia: os hábitos digitais do seu filho(a) estão sob controle. Mantenha as rotinas que já funcionam e reforce limites claros, combinados em família.", actions: ["Combine horários fixos de tela.", "Mantenha zonas sem tela (ex.: refeições).", "Incentive atividades offline (leitura, brincadeiras, ar livre)."], cta: "Conhecer o Detox Digital Infantil (prevenção e boas práticas)" };
  }
  if (level === "Moderada") {
    return { levelName: "Moderada", enumValue: Enums.RISK.MODERADA, message: "Existem sinais de alerta. Pequenos ajustes agora evitam que o uso de telas avance para padrões problemáticos.", actions: ["Regras visíveis (quadro de horários).", "Rotina de desligar 1h antes de dormir.", "Ofereça alternativas quando pedir tela (jogo rápido, piada, mini-dança)."], cta: "Quero o Detox com plano simples de 7 dias" };
  }
  if (level === "Alta") {
    return { levelName: "Alta", enumValue: Enums.RISK.ALTA, message: "O uso de telas já prejudica sono, estudos ou convivência. É hora de uma intervenção estruturada e consistente.", actions: ["Zonas e horários sem tela firmes (mesa, quarto à noite).", "Acordos com consequências previsíveis (sem gritos, sem barganha).", "Rotina diária de 30–60 min offline com você (brincar, construir algo, sair)."], cta: "Iniciar o Detox passo a passo (acompanhado)" };
  }
  return { levelName: "Muito Alta", enumValue: Enums.RISK.MUITO_ALTA, message: "Quadro severo de dependência digital. Você deu o passo certo buscando ajuda. Com método e constância, é reversível.", actions: ["Detox guiado (redução progressiva ou pausa breve com substituições).", "Retirar telas do quarto; regras de sono firmes.", "Conversas curtas e empáticas; foco em vínculos."], cta: "Preciso do Detox completo e suporte" };
}

function levelLabel(enumVal) {
  return { BAIXA: "Baixa", MODERADA: "Moderada", ALTA: "Alta", MUITO_ALTA: "Muito Alta" }[enumVal] || "";
}

function copyFromEnum(enumVal) {
  const map = {
    BAIXA: getCopy("Baixa"),
    MODERADA: getCopy("Moderada"),
    ALTA: getCopy("Alta"),
    MUITO_ALTA: getCopy("Muito Alta"),
  };
  const c = map[enumVal];
  return { ...c, title: `Resultado do Teste: ${c.levelName}`, subtitle: "", levelName: c.levelName, logoUrl: BRAND.logoUrl };
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/resultado" element={<Resultado />} />
      <Route path="/meus-resultados" element={<MeusResultados />} />
      <Route path="/privacidade" element={<Privacy />} />
    </Routes>
  );
}