import { jsPDF } from "jspdf";

export function exportCSV(record) {
  const headers = [
    "id",
    "email",
    "responsavel_nome",
    "child_age",
    "answers_json",
    "score_total",
    "risk_level",
    "created_at",
    "consent",
  ];
  const row = [
    record.id,
    record.email || "",
    record.responsavel_nome || "",
    record.child_age ?? "",
    JSON.stringify(record.answers),
    record.score_total,
    record.risk_level,
    record.created_at,
    String(record.consent),
  ];
  const csv = `${headers.join(",")}\n${row.map(safeCSV).join(",")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resultado_${record.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function safeCSV(v) {
  if (v == null) return "";
  const str = String(v).replaceAll('"', '""');
  if (str.includes(",") || str.includes("\n")) return `"${str}"`;
  return str;
}

export async function exportPDF(record, copy) {
  const doc = new jsPDF({ unit: "pt" });
  const margin = 48;
  let y = margin;

  // Try to add logo if present
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

  // Info block
  const lines = [
    `Responsável: ${record.responsavel_nome || "-"}`,
    `E-mail: ${record.email || "-"}`,
    `Idade da criança: ${record.child_age ?? "-"}`,
    `Nível: ${copy.levelName} | Pontuação: ${record.score_total}/80` ,
    `Data: ${new Date(record.created_at).toLocaleString()}`,
  ];
  lines.forEach((l) => {
    doc.text(l, margin, (y += 20));
  });

  // Recommendations
  doc.setFont("helvetica", "bold");
  doc.text("Recomendações", margin, (y += 28));
  doc.setFont("helvetica", "normal");
  const rec = [copy.message, ...copy.actions];
  rec.forEach((t) => {
    y = addWrappedText(doc, `• ${t}`, margin, y + 16, 520);
  });

  // footer note
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