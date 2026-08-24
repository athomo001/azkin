// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import crypto from "crypto";
import { IUserRepository } from "../../ports/repositories/user-repository";
import { IMailer } from "../../ports/services/mailer";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutos
const LOGO_CID = "azkin-logo";
const HTML_ESCAPE_MAP: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export interface RequestPasswordResetInput {
  email: string;
  appUrl?: string;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

/**
 * Envoltorio visual común del correo (logo con `cid` — no base64, Outlook de escritorio no
 * renderiza `data:` — y tarjeta blanca sobre fondo gris), compartido entre las dos variantes de
 * contenido de abajo. `color-scheme`/`supported-color-schemes` evitan que clientes con modo
 * oscuro automático (ej. Outlook.com) reinviertan los colores del botón y dejen el texto
 * ilegible sobre su propio fondo.
 */
function buildEmailShell(bodyContent: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
        <title>Azkin</title>
      </head>
      <body style="margin:0; padding:0; background:#f4f4f5;">
        <div style="font-family: Arial, sans-serif; color:#18181b; max-width:480px; margin:0 auto; padding:24px 12px;">
          <div style="background:#09090b; padding:20px 24px; border-radius:12px 12px 0 0; text-align:center;">
            <img src="cid:${LOGO_CID}" width="40" height="40" alt="Azkin" style="display:block; margin:0 auto;" />
          </div>
          <div style="border:1px solid #e4e4e7; border-top:none; border-radius:0 0 12px 12px; padding:28px 24px; background:#ffffff;">
            ${bodyContent}
          </div>
        </div>
      </body>
    </html>
  `;
}

/** Botón CTA con el patrón "bulletproof button" (tabla + `bgcolor`) para que sobreviva al motor
 * de Word de Outlook, y debajo el link en texto plano visible como respaldo si el botón no se ve
 * o no es clicable en el cliente de correo. Usada cuando el backend conoce su URL pública. */
function buildLinkAction(resetLink: string): string {
  const safeLink = escapeHtml(resetLink);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
      <tr>
        <td bgcolor="#10b981" style="background-color:#10b981; border-radius:8px; mso-padding-alt:13px 30px;">
          <a href="${safeLink}" target="_blank" style="display:block; padding:13px 30px; font-family:Arial,sans-serif; font-size:14px; font-weight:bold; text-decoration:none; border-radius:8px; background-color:#10b981;">
            <span style="color:#ffffff !important;">Restablecer contraseña</span>
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#71717a; font-size:12px; line-height:1.5;">
      ¿El botón no funciona? Copia y pega este enlace en tu navegador:<br />
      <a href="${safeLink}" style="color:#10b981; word-break:break-all;">${safeLink}</a>
    </p>
  `;
}

/** Caja destacada con el código para copiar a mano, usada cuando el backend NO conoce su URL
 * pública (sin `AZKIN_APP_URL`/`AZKIN_CORS_ORIGIN` configurados) y por lo tanto no puede armar
 * un link — evita mandar solo texto plano feo/sin instrucciones en ese caso. */
function buildTokenAction(token: string): string {
  const safeToken = escapeHtml(token);
  return `
    <div style="background:#f4f4f5; border:1px solid #e4e4e7; border-radius:8px; padding:16px; margin:20px 0; text-align:center;">
      <span style="font-family:'Courier New',monospace; font-size:13px; font-weight:bold; color:#09090b; letter-spacing:0.3px; word-break:break-all;">${safeToken}</span>
    </div>
    <p style="color:#71717a; font-size:12px; line-height:1.6;">
      En Azkin, andá a <b>"¿Olvidaste tu contraseña?"</b> → <b>"Ya tengo el código"</b>, y pegá el código de arriba junto con tu nueva contraseña.
    </p>
  `;
}

function buildResetHtml(opts: { resetLink?: string; token: string }): string {
  const action = opts.resetLink ? buildLinkAction(opts.resetLink) : buildTokenAction(opts.token);
  return buildEmailShell(`
    <h2 style="margin:0 0 8px; font-size:18px; color:#18181b;">Recuperación de contraseña</h2>
    <p style="color:#52525b; font-size:13px; line-height:1.6;">
      Solicitaste recuperar tu contraseña en Azkin. ${opts.resetLink ? "Este enlace" : "Este código"} vence en 30 minutos.
    </p>
    ${action}
    <p style="color:#a1a1aa; font-size:11px; margin-top:24px;">
      Si no fuiste tú, ignora este mensaje — tu contraseña seguirá siendo la misma.
    </p>
  `);
}

/**
 * Caso de uso para solicitar la recuperación de contraseña.
 * Responde siempre de forma genérica (anti-enumeración): el llamador nunca sabe si el
 * correo existe o no. Si existe, genera un token de un solo uso con expiración corta.
 */
export class RequestPasswordResetUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly mailer: IMailer,
    private readonly auditLog: IAuditLogRepository,
    /** Logo inline (cid) para el correo HTML; si no se inyecta, el correo HTML sigue enviándose
     * igual, solo que sin la imagen del logo (queda como adjunto roto en el header). */
    private readonly logo?: Buffer,
  ) {}

  async execute(input: RequestPasswordResetInput): Promise<void> {
    const user = await this.users.findByEmail(input.email);
    if (!user) {
      return; // Anti-enumeración: no se revela si el correo existe.
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    await this.users.setPasswordResetToken(user.id, tokenHash, expiresAt);

    const resetLink = input.appUrl
      ? `${input.appUrl.replace(/\/$/, "")}/reset-password?token=${token}`
      : undefined;

    await this.mailer.send({
      to: input.email,
      subject: "Recuperación de contraseña — Azkin",
      text: resetLink
        ? `Solicitaste recuperar tu contraseña. Este enlace vence en 30 minutos:\n${resetLink}\n\nSi no fuiste tú, ignora este mensaje.`
        : `Solicitaste recuperar tu contraseña en Azkin. Andá a la sección "Restablecer contraseña" (/reset-password) y pegá este código en el campo "Token de recuperación" (vence en 30 minutos):\n${token}\n\nSi no fuiste tú, ignora este mensaje.`,
      html: buildResetHtml({ resetLink, token }),
      attachments: this.logo
        ? [{ filename: "logo-azkin.png", content: this.logo, contentType: "image/png", cid: LOGO_CID }]
        : undefined,
    });

    await this.auditLog.record({
      actorId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      targetType: "user",
      targetIds: [user.id],
    });
  }
}
