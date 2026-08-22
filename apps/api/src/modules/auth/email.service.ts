import { ReplitConnectors } from "@replit/connectors-sdk";

interface VerificationEmail {
  to: string;
  from: string;
  otp: string;
  expiresInMinutes: number;
}

export async function sendVerificationEmail({
  to,
  from,
  otp,
  expiresInMinutes,
}: VerificationEmail): Promise<void> {
  const connectors = new ReplitConnectors();
  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Votre code de vérification Maison des Tontines",
      text: `Votre code de vérification est ${otp}. Il expire dans ${expiresInMinutes} minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#1f2937">
          <h1 style="font-size:22px;margin-bottom:16px">Maison des Tontines</h1>
          <p>Voici votre code de vérification :</p>
          <p style="font-size:30px;font-weight:700;letter-spacing:6px;margin:24px 0">${otp}</p>
          <p>Ce code expire dans ${expiresInMinutes} minutes. Ne le communiquez à personne.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Resend could not deliver the verification email${details ? `: ${details}` : ""}`);
  }
}