/**
 * Email via Resend REST API. Server-side only — RESEND_API_KEY never reaches
 * the browser. All functions are safe to call when email is not configured:
 * they return a clear status instead of throwing.
 */
export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

type SendResult = { ok: boolean; id?: string; status: string };

export async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  if (!emailConfigured()) return { ok: false, status: "not_configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }),
    });
    if (!res.ok) return { ok: false, status: `error_${res.status}` };
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id, status: "sent" };
  } catch {
    return { ok: false, status: "error_network" };
  }
}

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || "https://cikgu-boleh.vercel.app";

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#eaf3f1;font-family:Arial,Helvetica,sans-serif;color:#0e1f1c">
    <div style="max-width:560px;margin:0 auto;padding:24px">
      <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #d9e7e3">
        <div style="background:linear-gradient(135deg,#12b886,#0d7c74 60%,#0b5f59);padding:20px 24px;color:#fff">
          <div style="font-size:20px;font-weight:800">CikguBoleh</div>
          <div style="opacity:.9;font-size:13px">Isi Sekali. Semua Siap.</div>
        </div>
        <div style="padding:24px">
          <h1 style="font-size:18px;margin:0 0 12px">${title}</h1>
          <div style="font-size:14px;line-height:1.7">${bodyHtml}</div>
          <div style="margin-top:24px">
            <a href="${APP_URL()}" style="display:inline-block;background:#0d7c74;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;font-size:14px">Kembali ke CikguBoleh</a>
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #eef4f3;color:#7a8f8b;font-size:12px">
          CikguBoleh — platform bebas untuk guru Malaysia. Bukan laman rasmi KPM.
        </div>
      </div>
    </div></body></html>`;
}

export function autoReplyEmail(name: string): { subject: string; html: string } {
  return {
    subject: "CikguBoleh — Maklum Balas Anda Telah Diterima",
    html: shell("Terima kasih, " + (name || "Cikgu") + "!",
      `<p>Maklum balas anda telah kami terima dan sedang menunggu semakan pentadbir.</p>
       <p>Kami akan membalas melalui email ini sekiranya perlu. Terima kasih kerana membantu kami menambah baik CikguBoleh.</p>`),
  };
}

export function approvalEmail(name: string): { subject: string; html: string } {
  return {
    subject: "CikguBoleh — Maklum Balas Anda Telah Diluluskan",
    html: shell("Hai " + (name || "Cikgu") + ",",
      `<p>Maklum balas anda telah diluluskan untuk dipaparkan di CikguBoleh.</p><p>Terima kasih atas sokongan anda.</p>`),
  };
}

export function adminReplyEmail(name: string, message: string): { subject: string; html: string } {
  return {
    subject: "CikguBoleh — Balasan Kepada Maklum Balas Anda",
    html: shell("Hai " + (name || "Cikgu") + ",",
      `<p>${message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>
       <p style="margin-top:16px;color:#7a8f8b">— Pasukan CikguBoleh</p>`),
  };
}
