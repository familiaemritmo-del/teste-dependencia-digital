import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import {
  BRAND,
  QUESTIONS,
  saveAnswers,
  loadAnswers,
  saveProfile,
  loadProfile,
  computeScore,
  saveResult,
  mockEmailOptIn,
  makeResultPayload,
} from "../mock/mock";

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
        <span className="font-extrabold tracking-tight text-[#1D3557]">{BRAND.name}</span>
      </div>
      <div className="flex items-center gap-3">
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
        Este é um protótipo com dados mockados (sem backend). As respostas ficam salvas
        apenas no seu navegador para demonstrar a experiência do teste.
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
  const [childAge, setChildAge] = useState(profileFromLS?.childAge || "");

  const startQuiz = () => {
    const profile = { parentName, email, childAge };
    saveProfile(profile);
    // reset current answers for a fresh start
    saveAnswers({});
    toast({ title: "Vamos começar!", description: "Seu perfil foi salvo." });
    navigate("/quiz");
  };

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
              <Label htmlFor="email">E-mail (opcional – para receber o resultado)</Label>
              <Input id="email" type="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
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
    // resume last unanswered index
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

  const finish = () => {
    const payload = makeResultPayload(loadProfile(), answers);
    saveResult(payload);
    toast({ title: "Cálculo pronto!", description: "Gerando recomendações..." });
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
    if (!profile?.email) {
      toast({ title: "Informe um e-mail na primeira tela (opcional)", description: "Volte à página inicial para adicionar." });
      return;
    }
    setSending(true);
    try {
      await mockEmailOptIn(profile.email, makeResultPayload(profile, answers));
      toast({ title: "Enviamos uma cópia (simulado)", description: "Confira sua caixa de entrada." });
    } finally {
      setSending(false);
    }
  };

  const levelColor = {
    Baixa: "text-green-700 bg-green-50",
    Moderada: "text-amber-700 bg-amber-50",
    Alta: "text-orange-700 bg-orange-50",
    "Muito Alta": "text-red-700 bg-red-50",
  }[summary.level];

  return (
    <Container>
      <section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1D3557]">Seu Resultado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${levelColor}`}>
              <span className="font-semibold">{summary.category.name}</span>
              <span>•</span>
              <span>{summary.total} de {summary.max} pontos</span>
            </div>
            <p className="text-slate-700">
              Interpretação:
              {summary.level === "Baixa" && " Há equilíbrio no uso de telas. Continue reforçando hábitos saudáveis."}
              {summary.level === "Moderada" && " Alguns sinais pedem atenção. Ajustes consistentes podem evitar agravamento."}
              {summary.level === "Alta" && " Há impacto significativo. É hora de intervir com medidas claras."}
              {summary.level === "Muito Alta" && " Situação crítica – precisa de um plano intensivo e apoio."}
            </p>

            <div>
              <h3 className="mb-2 font-semibold">Recomendações imediatas</h3>
              <ul className="list-disc space-y-1 pl-5 text-slate-700">
                {summary.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <a href={BRAND.courseUrl} target="_blank" rel="noreferrer">
                <Button className="bg-[#FFD60A] text-black hover:bg-[#e6c009]">Quero Participar do Detox</Button>
              </a>
              <Button variant="outline" onClick={sendEmail} disabled={sending}>
                {sending ? "Enviando..." : "Enviar resultado por e-mail (simulado)"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <History />
      </section>
    </Container>
  );
}

function History() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tddi_results_history_v1") || "[]");
    } catch (e) {
      return [];
    }
  });
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const next = JSON.parse(localStorage.getItem("tddi_results_history_v1") || "[]");
        if (next.length !== items.length) setItems(next);
      } catch {}
    }, 800);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#1D3557]">Histórico (neste navegador)</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{new Date(it.createdAt).toLocaleString()}</p>
                <p className="text-xs text-slate-600">Nível: {it.result.level} • Pontos: {it.result.total}/{it.result.max}</p>
              </div>
              <a href={BRAND.courseUrl} target="_blank" rel="noreferrer" className="text-sm text-[#1D3557] underline">
                Conhecer o Curso
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/resultado" element={<Resultado />} />
    </Routes>
  );
}