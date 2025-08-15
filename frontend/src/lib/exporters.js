import { jsPDF } from "jspdf";

function toCSVRow(values) {
  return values
    .map((v) => {
      if (v === null || v === undefined) v = "";
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    })
    .join(",");
}

export function exportResultAsCSV(result, filename = "resultado.csv") {
  const headers = [
    "timestamp",
    "responsavel_nome",
    "telefone",
    "email",
    "child_age",
    "score_total",
    "risk_level",
    "answers_json",
  ];
  const row = [
    result.created_at || new Date().toISOString(),
    result.responsavel_nome || "",
    result.telefone || "",
    result.email || "",
    result.child_age ?? "",
    result.score_total ?? "",
    result.risk_level || "",
    JSON.stringify(result.answers || []),
  ];

  const lines = [];
  lines.push(toCSVRow(headers));
  lines.push(toCSVRow(row));

  const csvString = "\uFEFF" + lines.join("\r\n") + "\r\n"; // BOM + CRLF
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportPDF(record, copy) {
  const doc = new jsPDF({ unit: "pt" });
  const margin = 48;
  let y = margin;

  try {
    if (copy.logoUrl) {
      const img = await fetch(copy.logoUrl).then((r) => r.blob());
      const fr = await blobToDataURL(img);
      doc.addImage(fr, "PNG", margin, y - 10, 36, 36);
    }
  } catch {}

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(copy.title || "Resultado do Teste", margin + 44, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(copy.subtitle || "", margin, (y += 36));

  const lines = [
    `Responsável: ${record.responsavel_nome || "-"}`,
    `Telefone: ${record.telefone || "-"}`,
    `E-mail: ${record.email || "-"}`,
    `Idade da criança: ${record.child_age ?? "-"}`,
    `Nível: ${copy.levelName} | Pontuação: ${record.score_total}/80` ,
    `Data: ${new Date(record.created_at).toLocaleString()}`,
  ];
  lines.forEach((l) => {
    doc.text(l, margin, (y += 20));
  });

  doc.setFont("helvetica", "bold");
  doc.text("Recomendações", margin, (y += 28));
  doc.setFont("helvetica", "normal");
  const rec = [copy.message, ...copy.actions];
  rec.forEach((t) => {
    y = addWrappedText(doc, `• ${t}`, margin, y + 16, 520);
  });

  y = addWrappedText(doc, copy.footer || "", margin, y + 20, 520);

  doc.save(`resultado_${record.id}.pdf`);
}

function addWrappedText(doc, text, x, y, maxWidth) {
  const split = doc.splitTextToSize(text, maxWidth);
  doc.text(split, x, y);
  return y + split.length * 14;
}

function blobToDataURL(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}