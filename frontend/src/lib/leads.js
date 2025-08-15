export const SHEETS_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbymx4NuYejFBkRFinvKp-T2-waecXElpd0kjS2JnMh1BXIE4bAgU0wquZpiEhCor9L_/exec";

export async function sendLeadToSheets(payload) {
  try {
    console.info("[Sheets] sending payload", payload);
    const res = await fetch(SHEETS_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" }, // evita preflight
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    const ok = json && json.ok === true;
    if (!ok) console.warn("[Sheets] send not-ok", json);
    return ok;
  } catch (err) {
    console.warn("[Sheets] send failed", err);
    return false;
  }
}